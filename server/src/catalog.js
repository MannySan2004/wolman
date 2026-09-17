import { pool } from "./db.js";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";
const PROFILE_BASE = "https://image.tmdb.org/t/p/w185";
const ROW_SIZE = 20;
const MIN_GENRE_ROW_SIZE = 5;
const PICKS = { country: "US", rowTitle: "Top Picks in the US" };
const SEARCH_LIMIT = 60;
const CAST_LIMIT = 10;
const RECOMMENDATION_LIMIT = 9;

export const TITLE_FIELDS = `
  t.id, t.title_type, t.name, t.overview, t.poster_path, t.backdrop_path,
  extract(year from t.release_date)::int as release_year,
  t.maturity_rating, t.runtime_minutes, t.number_of_seasons,
  t.trailer_youtube_key, t.is_featured,
  array(
    select g.name from title_genres tg join genres g on g.id = tg.genre_id
    where tg.title_id = t.id order by g.name
  ) as genres`;

export function toTitle(row) {
  return {
    id: row.id,
    type: row.title_type,
    title: row.name,
    description: row.overview ?? "",
    posterUrl: row.poster_path && POSTER_BASE + row.poster_path,
    backdropUrl: row.backdrop_path && BACKDROP_BASE + row.backdrop_path,
    genres: row.genres,
    releaseYear: row.release_year,
    rating: row.maturity_rating,
    durationMinutes: row.runtime_minutes,
    seasons: row.number_of_seasons,
    trailerKey: row.trailer_youtube_key,
    featured: row.is_featured,
  };
}

function groupIntoRows(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.row_title)) groups.set(row.row_title, []);
    groups.get(row.row_title).push(toTitle(row));
  }
  return [...groups].map(([title, titles]) => ({ title, titles }));
}

export async function getFeatured() {
  const { rows } = await pool.query(`
    select ${TITLE_FIELDS}
    from titles t
    where t.is_active and t.backdrop_path is not null and t.overview <> ''
    order by t.is_featured desc, t.popularity desc nulls last
    limit 1`);
  return rows[0] ? toTitle(rows[0]) : null;
}

export async function getTitle(id) {
  const { rows } = await pool.query(
    `select ${TITLE_FIELDS} from titles t where t.id = $1 and t.is_active`,
    [id],
  );
  return rows[0] ? toTitle(rows[0]) : null;
}

export async function getCast(titleId) {
  const { rows } = await pool.query(
    `select p.id, p.name, p.profile_path, tc.character_name
     from title_cast tc
     join people p on p.id = tc.person_id
     where tc.title_id = $1
     order by tc.billing_order, p.name
     limit $2`,
    [titleId, CAST_LIMIT],
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    character: row.character_name,
    photoUrl: row.profile_path && PROFILE_BASE + row.profile_path,
  }));
}

// Scores other titles by shared keywords (3 each) and genres (2 each), plus 4 for the same type.
export async function getRecommendations(titleId) {
  const { rows } = await pool.query(
    `with source as (
       select title_type from titles where id = $1
     ),
     shared as (
       select tk.title_id, 3 as weight
       from title_keywords src
       join title_keywords tk on tk.keyword_id = src.keyword_id
       where src.title_id = $1
       union all
       select tg.title_id, 2
       from title_genres src
       join title_genres tg on tg.genre_id = src.genre_id
       where src.title_id = $1
     ),
     scored as (
       select title_id, sum(weight) as score
       from shared
       where title_id <> $1
       group by title_id
     )
     select ${TITLE_FIELDS}
     from scored s
     join titles t on t.id = s.title_id
     cross join source
     where t.is_active
     order by s.score + case when t.title_type = source.title_type then 4 else 0 end desc,
              t.popularity desc nulls last
     limit $2`,
    [titleId, RECOMMENDATION_LIMIT],
  );
  return rows.map(toTitle);
}

export async function getRows() {
  const [picks, byType, byGenre] = await Promise.all([
    pool.query(
      `select $1::text as row_title, ${TITLE_FIELDS}
       from regional_picks rp
       join titles t on t.id = rp.title_id
       where rp.country_code = $2 and t.is_active
       order by rp.source_rank
       limit $3`,
      [PICKS.rowTitle, PICKS.country, ROW_SIZE],
    ),
    pool.query(
      `with ranked as (
         select id, row_number() over (
           partition by title_type order by popularity desc nulls last, id
         ) as pos
         from titles
         where is_active
       )
       select case t.title_type when 'tv' then 'Popular TV Shows' else 'Popular Movies' end as row_title,
              ${TITLE_FIELDS}
       from ranked r
       join titles t on t.id = r.id
       where r.pos <= $1
       order by t.title_type desc, r.pos`,
      [ROW_SIZE],
    ),
    pool.query(
      `with ranked as (
         select tg.genre_id, t.id,
                row_number() over (
                  partition by tg.genre_id order by t.popularity desc nulls last, t.id
                ) as pos,
                count(*) over (partition by tg.genre_id) as genre_size
         from title_genres tg
         join titles t on t.id = tg.title_id
         where t.is_active
       )
       select g.name as row_title, ${TITLE_FIELDS}
       from ranked r
       join genres g on g.id = r.genre_id
       join titles t on t.id = r.id
       where r.pos <= $1 and r.genre_size >= $2
       order by r.genre_size desc, g.name, r.pos`,
      [ROW_SIZE, MIN_GENRE_ROW_SIZE],
    ),
  ]);

  return groupIntoRows([...picks.rows, ...byType.rows, ...byGenre.rows]);
}

export async function searchTitles(query) {
  const q = query.trim();
  if (!q) return [];
  const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;

  const { rows } = await pool.query(
    `select ${TITLE_FIELDS}
     from titles t
     where t.is_active and (
       t.search_vector @@ websearch_to_tsquery('english', $1)
       or t.name ilike $2
       or exists (
         select 1 from title_genres tg join genres g on g.id = tg.genre_id
         where tg.title_id = t.id and g.name ilike $2
       )
     )
     order by t.name ilike $2 desc,
              ts_rank(t.search_vector, websearch_to_tsquery('english', $1)) desc,
              t.popularity desc nulls last
     limit $3`,
    [q, pattern, SEARCH_LIMIT],
  );
  return rows.map(toTitle);
}
