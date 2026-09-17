import { request } from "./http";
import { rememberTitles } from "./catalog";

/**
 * `{ profiles, maxProfiles, maxNameLength, colors: { name, value }[] }` — the guest
 * profile doesn't count toward `maxProfiles`.
 */
export function getProfiles() {
  return request("/profiles");
}

export function createProfile({ name, color }) {
  return request("/profiles", { method: "POST", body: { name, color } });
}

export function updateProfile(profileId, changes) {
  return request(`/profiles/${profileId}`, { method: "PATCH", body: changes });
}

export function deleteProfile(profileId) {
  return request(`/profiles/${profileId}`, { method: "DELETE" });
}

export function uploadAvatar(profileId, imageBlob) {
  return request(`/profiles/${profileId}/avatar`, { method: "PUT", body: imageBlob });
}

export function removeAvatar(profileId) {
  return request(`/profiles/${profileId}/avatar`, { method: "DELETE" });
}

export async function getFavorites(profileId) {
  return rememberTitles(await request(`/profiles/${profileId}/favorites`));
}

export function addFavorite(profileId, titleId) {
  return request(`/profiles/${profileId}/favorites/${encodeURIComponent(titleId)}`, {
    method: "PUT",
  });
}

export function removeFavorite(profileId, titleId) {
  return request(`/profiles/${profileId}/favorites/${encodeURIComponent(titleId)}`, {
    method: "DELETE",
  });
}
