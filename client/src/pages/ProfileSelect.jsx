import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileAvatar from "../components/ProfileAvatar";
import ProfileEditor from "../components/ProfileEditor";
import { useProfile } from "../context/profileContext";
import { getProfiles } from "../api/profiles";

// Keeps the server's order: regular profiles by creation, guest last.
function upsertProfile(list, profile) {
  if (list.some((p) => p.id === profile.id)) {
    return list.map((p) => (p.id === profile.id ? profile : p));
  }
  const guestIndex = list.findIndex((p) => p.isGuest);
  return guestIndex === -1
    ? [...list, profile]
    : [...list.slice(0, guestIndex), profile, ...list.slice(guestIndex)];
}

export default function ProfileSelect() {
  const navigate = useNavigate();
  const { profile: currentProfile, selectProfile } = useProfile();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [managing, setManaging] = useState(false);
  const [editing, setEditing] = useState(null); // { profile } — null profile means adding

  useEffect(() => {
    let active = true;
    getProfiles().then(
      (result) => active && setData(result),
      (err) => active && setError(err),
    );
    return () => {
      active = false;
    };
  }, []);

  function choose(profile) {
    selectProfile(profile);
    navigate("/browse");
  }

  function handleSaved(profile) {
    setData((d) => ({ ...d, profiles: upsertProfile(d.profiles, profile) }));
    setEditing(null);
    if (currentProfile?.id === profile.id) selectProfile(profile);
  }

  function handleDeleted(id) {
    setData((d) => ({ ...d, profiles: d.profiles.filter((p) => p.id !== id) }));
    setEditing(null);
    if (currentProfile?.id === id) selectProfile(null);
  }

  if (editing) {
    const usedColors = data.profiles.map((p) => p.color);
    const defaultColor = (
      data.colors.find((c) => !usedColors.includes(c.value)) ?? data.colors[0]
    ).value;
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black px-6 py-12">
        <ProfileEditor
          profile={editing.profile}
          colors={data.colors}
          defaultColor={defaultColor}
          maxNameLength={data.maxNameLength}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  const regularCount = data?.profiles.filter((p) => !p.isGuest).length ?? 0;
  const canAdd = data && regularCount < data.maxProfiles;
  const tileClass = "h-24 w-24 rounded md:h-32 md:w-32";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-black px-6 py-12">
      <h1 className="mb-10 text-3xl text-white md:text-4xl">
        {managing ? "Manage Profiles" : "Who's watching?"}
      </h1>
      {error ? (
        <p className="text-gray-400">Couldn't load profiles. Is the API running?</p>
      ) : !data ? (
        <p className="text-gray-400">Loading profiles…</p>
      ) : (
        <>
          <div className="flex max-w-4xl flex-wrap justify-center gap-8">
            {data.profiles.map((profile) => {
              const locked = managing && profile.isGuest;
              return (
                <button
                  key={profile.id}
                  type="button"
                  disabled={locked}
                  title={locked ? "The guest profile can't be changed" : undefined}
                  aria-label={managing && !locked ? `Edit ${profile.name}` : profile.name}
                  onClick={() => (managing ? setEditing({ profile }) : choose(profile))}
                  className="group flex flex-col items-center gap-3 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <div className="relative">
                    <ProfileAvatar
                      profile={profile}
                      className={`${tileClass} transition ${
                        locked ? "" : "group-hover:ring-4 group-hover:ring-white"
                      }`}
                    />
                    {managing && !profile.isGuest && (
                      <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50 text-3xl text-white">
                        ✎
                      </div>
                    )}
                  </div>
                  <span className={`text-gray-300 ${locked ? "" : "group-hover:text-white"}`}>
                    {profile.name}
                  </span>
                </button>
              );
            })}
            {canAdd && (
              <button
                type="button"
                onClick={() => setEditing({ profile: null })}
                className="group flex flex-col items-center gap-3"
              >
                <div
                  className={`${tileClass} flex items-center justify-center border-2 border-gray-500 text-5xl text-gray-500 transition group-hover:border-white group-hover:text-white`}
                >
                  +
                </div>
                <span className="text-gray-300 group-hover:text-white">
                  Add Profile
                </span>
              </button>
            )}
          </div>
          {!canAdd && (
            <p className="mt-10 text-sm text-gray-500">
              You've reached the limit of {data.maxProfiles} profiles.
            </p>
          )}
          <button
            type="button"
            onClick={() => setManaging((m) => !m)}
            className={`mt-12 rounded border px-6 py-2 font-semibold tracking-wide transition ${
              managing
                ? "border-white bg-white text-black hover:bg-white/80"
                : "border-gray-500 text-gray-400 hover:border-white hover:text-white"
            }`}
          >
            {managing ? "Done" : "Manage Profiles"}
          </button>
        </>
      )}
    </div>
  );
}
