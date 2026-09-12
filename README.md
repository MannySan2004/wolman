# Wolman

A streaming catalog app. Monorepo: frontend and backend live as sibling
folders here and deploy independently.

## Structure

- `client/` — React + Vite + Tailwind + React Router. Runs today against mock
  catalog data.
- `server/` — not built yet. See `server/README.md`.

## Client

```
cd client
npm install
npm run dev
```

Routes: `/` (sign in), `/profiles`, `/browse`, `/search?q=`, `/watch/:id`.

## Catalog data

`client/src/api/catalog.js` is the only place the UI touches the catalog. It
currently resolves from `client/src/data/movies.js` (placeholder titles) and
every function is already async, so pointing it at a real API later requires no
changes elsewhere.

Title shape: `id`, `title`, `description`, `posterUrl`, `backdropUrl`,
`genres[]`, `releaseYear`, `rating`, `durationMinutes`, `videoUrl`, optional
`featured`.

## Infrastructure (owned outside this repo)

- PostgreSQL on Amazon RDS — single region to start.
- S3 for posters, backdrops, and video objects.
- CDN in front of S3 later.

Artwork and video URLs are stored per title, so moving from direct S3 URLs to
CDN URLs is a data change, not a code change.
