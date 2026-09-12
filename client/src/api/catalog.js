// The only place the UI touches the catalog source.
//
// Today every call resolves from local mock data. Once server/ exists, swap
// these bodies for fetch() calls — the call sites are already async, so
// nothing else has to change.

import { movies } from "../data/movies";

export async function getCatalog() {
  return movies;
}

export async function getTitle(id) {
  return movies.find((m) => String(m.id) === String(id)) ?? null;
}

export async function getFeatured() {
  return movies.find((m) => m.featured) ?? movies[0] ?? null;
}

/** Catalog grouped into the genre rows shown on Browse. */
export async function getRows() {
  const genres = [...new Set(movies.flatMap((m) => m.genres))].sort();
  return genres.map((genre) => ({
    genre,
    titles: movies.filter((m) => m.genres.includes(genre)),
  }));
}

export async function searchTitles(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return movies.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)),
  );
}
