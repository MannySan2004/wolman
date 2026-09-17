import { useEffect, useState } from "react";
import ProfileAvatar from "./ProfileAvatar";
import {
  createProfile,
  deleteProfile,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from "../api/profiles";
import { toAvatarBlob } from "../lib/avatarImage";

const KEEP_PHOTO = { kind: "keep" };
const REMOVE_PHOTO = { kind: "remove" };

/**
 * Adds a profile (`profile` null) or edits one. The icon is either a photo or a
 * color: picking a color drops the photo.
 */
export default function ProfileEditor({
  profile,
  colors,
  defaultColor,
  maxNameLength,
  onSaved,
  onDeleted,
  onCancel,
}) {
  // Becomes the created profile if a later step of adding one fails, so Save retries as an edit.
  const [saved, setSaved] = useState(profile);
  const [name, setName] = useState(profile?.name ?? "");
  const [color, setColor] = useState(profile?.color ?? defaultColor);
  const [photo, setPhoto] = useState(KEEP_PHOTO); // or { kind: "new", blob, url } / REMOVE_PHOTO
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (photo.kind !== "new") return;
    return () => URL.revokeObjectURL(photo.url);
  }, [photo]);

  const photoUrl =
    photo.kind === "new" ? photo.url : photo.kind === "keep" ? saved?.avatarUrl : null;

  async function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const blob = await toAvatarBlob(file);
      setError(null);
      setPhoto({ kind: "new", blob, url: URL.createObjectURL(blob) });
    } catch (err) {
      setError(err.message);
    }
  }

  function chooseColor(value) {
    setColor(value);
    if (photoUrl) setPhoto(REMOVE_PHOTO);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let current = saved;
      if (!current) {
        current = await createProfile({ name, color });
        setSaved(current);
      } else if (name.trim() !== current.name || color !== current.color) {
        current = await updateProfile(current.id, { name, color });
        setSaved(current);
      }
      if (photo.kind === "new") {
        current = await uploadAvatar(current.id, photo.blob);
      } else if (photo.kind === "remove" && current.avatarUrl) {
        current = await removeAvatar(current.id);
      }
      onSaved(current);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    setError(null);
    try {
      await deleteProfile(saved.id);
      onDeleted(saved.id);
    } catch (err) {
      setError(err.message);
      setSaving(false);
      setConfirmingDelete(false);
    }
  }

  const secondaryButton =
    "rounded border border-gray-500 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:border-white hover:text-white disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <h1 className="mb-8 text-3xl text-white md:text-4xl">
        {saved ? "Edit Profile" : "Add Profile"}
      </h1>

      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="flex flex-col items-center gap-3">
          <ProfileAvatar
            profile={{ color, avatarUrl: photoUrl }}
            className="h-28 w-28 rounded md:h-32 md:w-32"
          />
          <label className={`${secondaryButton} cursor-pointer focus-within:ring-2 focus-within:ring-white`}>
            {photoUrl ? "Change photo" : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="sr-only"
            />
          </label>
          {photoUrl && (
            <button
              type="button"
              onClick={() => setPhoto(REMOVE_PHOTO)}
              className="text-sm text-gray-400 hover:text-white"
            >
              Remove photo
            </button>
          )}
        </div>

        <div className="flex-1">
          <label htmlFor="profile-name" className="mb-2 block text-sm text-gray-400">
            Name
          </label>
          <input
            id="profile-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={maxNameLength}
            className="w-full rounded bg-neutral-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
          />

          <p className="mb-2 mt-6 text-sm text-gray-400">
            Color{photoUrl && " (replaces the photo)"}
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => {
              const selected = !photoUrl && c.value === color;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => chooseColor(c.value)}
                  aria-label={c.name}
                  aria-pressed={selected}
                  title={c.name}
                  className={`h-9 w-9 rounded transition hover:scale-110 ${
                    selected ? "ring-2 ring-white ring-offset-2 ring-offset-brand-black" : ""
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-brand-red">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="rounded bg-white px-6 py-2 font-semibold text-black transition hover:bg-white/80 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          // A partly failed save may already have created or renamed the profile.
          onClick={() => (saved !== profile ? onSaved(saved) : onCancel())}
          disabled={saving}
          className={secondaryButton}
        >
          Cancel
        </button>
        {saved && !confirmingDelete && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={saving}
            className="ml-auto text-sm font-semibold text-gray-400 hover:text-brand-red disabled:opacity-50"
          >
            Delete Profile
          </button>
        )}
      </div>

      {confirmingDelete && (
        <div className="mt-6 rounded border border-brand-red/60 bg-brand-red/10 p-4">
          <p className="mb-4 text-sm text-white">
            Delete <span className="font-semibold">{saved.name}</span>? Their
            favorites will be deleted too.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={saving}
              className={secondaryButton}
            >
              Keep Profile
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
