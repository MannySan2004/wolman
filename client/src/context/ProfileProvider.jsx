import { useCallback, useEffect, useMemo, useState } from "react";
import { ProfileContext } from "./profileContext";
import { addFavorite, getFavorites, removeFavorite } from "../api/profiles";

const STORAGE_KEY = "wolman.profile";
const NO_FAVORITES = [];

function readStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

const sameId = (a, b) => String(a) === String(b);

export default function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(readStoredProfile);
  // Tagged with the profile they belong to, so switching profiles never shows the previous list.
  const [saved, setSaved] = useState({ profileId: null, titles: NO_FAVORITES });
  const canFavorite = Boolean(profile && !profile.isGuest);
  const favorites =
    canFavorite && saved.profileId === profile.id ? saved.titles : NO_FAVORITES;

  useEffect(() => {
    if (!canFavorite) return;
    let active = true;
    getFavorites(profile.id).then(
      (titles) => active && setSaved({ profileId: profile.id, titles }),
      (err) => console.error(err),
    );
    return () => {
      active = false;
    };
  }, [profile, canFavorite]);

  const selectProfile = useCallback((next) => {
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable: the choice still holds for this tab.
    }
    setProfile(next);
  }, []);

  const isFavorite = useCallback(
    (titleId) => favorites.some((t) => sameId(t.id, titleId)),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (title) => {
      const add = !isFavorite(title.id);
      const update = (change) =>
        setSaved((s) => ({
          profileId: profile.id,
          titles: change(s.profileId === profile.id ? s.titles : NO_FAVORITES),
        }));
      const without = (list) => list.filter((t) => !sameId(t.id, title.id));

      update((list) => (add ? [title, ...without(list)] : without(list)));
      try {
        await (add ? addFavorite : removeFavorite)(profile.id, title.id);
      } catch (err) {
        console.error(err);
        update((list) => (add ? without(list) : [title, ...without(list)]));
      }
    },
    [isFavorite, profile],
  );

  const value = useMemo(
    () => ({ profile, selectProfile, canFavorite, favorites, isFavorite, toggleFavorite }),
    [profile, selectProfile, canFavorite, favorites, isFavorite, toggleFavorite],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
