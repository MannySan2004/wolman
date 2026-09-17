import { pool } from "./db.js";
import { TITLE_FIELDS, toTitle } from "./catalog.js";

export const MAX_PROFILES = 5; // not counting the guest profile
export const MAX_NAME_LENGTH = 20;
export const PROFILE_COLORS = [
  { name: "Red", value: "#dc2626" },
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#16a34a" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#9333ea" },
  { name: "Pink", value: "#db2777" },
  { name: "Orange", value: "#ea580c" },
  { name: "Teal", value: "#0d9488" },
];

const PROFILE_FIELDS = `
  p.id, p.name, p.is_guest, p.color, a.updated_at as avatar_updated_at
  from profiles p
  left join profile_avatars a on a.profile_id = p.id`;

function toProfile(row) {
  return {
    id: row.id,
    name: row.name,
    isGuest: row.is_guest,
    color: row.color,
    // Versioned so a new upload isn't hidden behind the browser cache.
    avatarUrl: row.avatar_updated_at
      ? `/api/profiles/${row.id}/avatar?v=${row.avatar_updated_at.getTime()}`
      : null,
  };
}

function normalizeName(raw) {
  const name = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
  if (!name) return { error: "Enter a name for the profile." };
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `Names can be at most ${MAX_NAME_LENGTH} characters.` };
  }
  return { name };
}

const isProfileColor = (color) => PROFILE_COLORS.some((c) => c.value === color);
const nameTaken = (name) => ({ status: 409, error: `There's already a profile named ${name}.` });

/** Runs `fn` in a transaction holding a lock that serializes profile creates and deletes. */
async function withProfilesLock(fn) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("lock table profiles in share row exclusive mode");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

export async function listProfiles() {
  const { rows } = await pool.query(`select ${PROFILE_FIELDS} order by p.is_guest, p.id`);
  return rows.map(toProfile);
}

export async function getProfile(id) {
  const { rows } = await pool.query(`select ${PROFILE_FIELDS} where p.id = $1`, [id]);
  return rows[0] ? toProfile(rows[0]) : null;
}

// Mutations resolve to `{ profile }` on success or `{ status, error }` when a rule fails.

export async function createProfile({ name: rawName, color }) {
  const { name, error } = normalizeName(rawName);
  if (error) return { status: 400, error };
  if (color !== undefined && !isProfileColor(color)) {
    return { status: 400, error: "Pick one of the available colors." };
  }

  const outcome = await withProfilesLock(async (client) => {
    const {
      rows: [existing],
    } = await client.query(
      `select count(*) filter (where not is_guest)::int as regular,
              coalesce(bool_or(lower(name) = lower($1)), false) as name_taken,
              coalesce(array_agg(color), '{}') as used_colors
       from profiles`,
      [name],
    );
    if (existing.name_taken) return nameTaken(name);
    if (existing.regular >= MAX_PROFILES) {
      return { status: 409, error: `You can have up to ${MAX_PROFILES} profiles.` };
    }

    const unused = PROFILE_COLORS.find((c) => !existing.used_colors.includes(c.value));
    const { rows } = await client.query(
      "insert into profiles (name, color) values ($1, $2) returning id",
      [name, color ?? unused?.value ?? PROFILE_COLORS[0].value],
    );
    return { id: rows[0].id };
  });

  // Read back after commit so the response includes the joined avatar fields.
  return outcome.error ? outcome : { profile: await getProfile(outcome.id) };
}

export async function updateProfile(id, { name: rawName, color }) {
  const assignments = [];
  const values = [];
  let name;

  if (rawName !== undefined) {
    const normalized = normalizeName(rawName);
    if (normalized.error) return { status: 400, error: normalized.error };
    name = normalized.name;
    values.push(name);
    assignments.push(`name = $${values.length}`);
  }
  if (color !== undefined) {
    if (!isProfileColor(color)) return { status: 400, error: "Pick one of the available colors." };
    values.push(color);
    assignments.push(`color = $${values.length}`);
  }
  if (!assignments.length) return { status: 400, error: "Nothing to update." };

  values.push(id);
  try {
    await pool.query(
      `update profiles set ${assignments.join(", ")} where id = $${values.length} and not is_guest`,
      values,
    );
  } catch (err) {
    if (err.code === "23505") return nameTaken(name);
    throw err;
  }
  return { profile: await getProfile(id) };
}

export async function deleteProfile(id) {
  return withProfilesLock(async (client) => {
    const {
      rows: [{ regular }],
    } = await client.query(
      "select count(*) filter (where not is_guest)::int as regular from profiles",
    );
    if (regular <= 1) return { status: 409, error: "You need to keep at least one profile." };
    await client.query("delete from profiles where id = $1 and not is_guest", [id]);
    return {};
  });
}

function sniffImageType(data) {
  if (data.length > 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return "image/jpeg";
  }
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (
    data.subarray(0, 4).toString("latin1") === "RIFF" &&
    data.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function setAvatar(profileId, data) {
  // Trust the bytes, not the request's Content-Type, so only real raster images are ever served back.
  const contentType = Buffer.isBuffer(data) ? sniffImageType(data) : null;
  if (!contentType) return { status: 415, error: "Upload a JPEG, PNG, or WebP image." };
  await pool.query(
    `insert into profile_avatars (profile_id, content_type, data, updated_at)
     values ($1, $2, $3, now())
     on conflict (profile_id) do update
       set content_type = excluded.content_type, data = excluded.data, updated_at = now()`,
    [profileId, contentType, data],
  );
  return { profile: await getProfile(profileId) };
}

export async function removeAvatar(profileId) {
  await pool.query("delete from profile_avatars where profile_id = $1", [profileId]);
  return { profile: await getProfile(profileId) };
}

export async function getAvatar(profileId) {
  const { rows } = await pool.query(
    "select content_type, data from profile_avatars where profile_id = $1",
    [profileId],
  );
  return rows[0] ?? null;
}

export async function getFavorites(profileId) {
  const { rows } = await pool.query(
    `select ${TITLE_FIELDS}
     from profile_favorites f
     join titles t on t.id = f.title_id
     where f.profile_id = $1 and t.is_active
     order by f.created_at desc`,
    [profileId],
  );
  return rows.map(toTitle);
}

/** Resolves to false when the title doesn't exist. Adding an existing favorite is a no-op. */
export async function addFavorite(profileId, titleId) {
  const { rows } = await pool.query(
    `with title as (
       select id from titles where id = $2::bigint and is_active
     ),
     inserted as (
       insert into profile_favorites (profile_id, title_id)
       select $1::int, id from title
       on conflict do nothing
     )
     select exists (select 1 from title) as found`,
    [profileId, titleId],
  );
  return rows[0].found;
}

export async function removeFavorite(profileId, titleId) {
  await pool.query(
    "delete from profile_favorites where profile_id = $1 and title_id = $2",
    [profileId, titleId],
  );
}
