import { createContext, useContext } from "react";

export const ProfileContext = createContext(null);

/**
 * `{ profile, selectProfile, canFavorite, favorites, isFavorite, toggleFavorite }`.
 * Guests (and no profile) get `canFavorite: false` and an empty `favorites`.
 */
export function useProfile() {
  return useContext(ProfileContext);
}
