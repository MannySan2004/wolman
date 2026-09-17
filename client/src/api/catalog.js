// The only place the UI touches the catalog.
import { request as get } from "./http";

// Titles already loaded elsewhere, so opening one doesn't wait on the API.
const titleCache = new Map();

export function rememberTitles(titles) {
  for (const title of titles) titleCache.set(String(title.id), title);
  return titles;
}

export async function getFeatured() {
  const title = await get("/featured");
  if (title) rememberTitles([title]);
  return title;
}

/** Rows shown on Browse: `{ title, titles }[]`. */
export async function getRows() {
  const rows = await get("/rows");
  for (const row of rows) rememberTitles(row.titles);
  return rows;
}

export async function getTitle(id) {
  const cached = titleCache.get(String(id));
  if (cached) return cached;
  const title = await get(`/titles/${encodeURIComponent(id)}`);
  if (title) rememberTitles([title]);
  return title;
}

export function getCast(id) {
  return get(`/titles/${encodeURIComponent(id)}/cast`);
}

export async function getRecommendations(id) {
  return rememberTitles(await get(`/titles/${encodeURIComponent(id)}/recommendations`));
}

export async function searchTitles(query) {
  const q = query.trim();
  return q ? rememberTitles(await get(`/search?q=${encodeURIComponent(q)}`)) : [];
}
