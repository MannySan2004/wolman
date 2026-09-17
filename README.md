# Wolman

A streaming catalog app. Monorepo: frontend and backend live as sibling
folders here and deploy independently.

## Structure

- `client/` — React + Vite + Tailwind + React Router.
- `server/` — Express API over the catalog in PostgreSQL on Amazon RDS. See
  `server/README.md`.

## Running locally

Three terminals:

```
cd server && npm install && npm run tunnel   # SSM tunnel to RDS, leave open
cd server && npm run dev                     # API on :3001
cd client && npm install && npm run dev      # UI on :5173, proxies /api to :3001
```

First time only, with the tunnel open: `cd server && npm run db:schema`.

Routes: `/` (sign in), `/profiles`, `/browse`, `/search?q=`, `/watch/:id`.

Profiles come from the API; the chosen one is kept in `localStorage`. Up to 5
profiles can be added from the profile picker (Guest doesn't count), and
"Manage Profiles" renames, recolors, sets a photo on, or deletes them — the
Guest profile is locked. Non-guest profiles get a "My Favorites" row on Browse
and a favorites toggle in the title details modal; the Guest profile gets
neither.

## Catalog data

`client/src/api/catalog.js` is the only place the UI touches the catalog; it
calls the API under `/api`.

Title shape: `id`, `type` (`movie` | `tv`), `title`, `description`,
`posterUrl`, `backdropUrl`, `genres[]`, `releaseYear`, `rating`,
`durationMinutes` (movies), `seasons` (TV), `trailerKey` (YouTube), `featured`.

## Infrastructure (owned outside this repo)

- PostgreSQL on Amazon RDS (`us-west-2`), private; reached through a bastion
  EC2 instance via SSM Session Manager.
- Titles, genres, and artwork paths are loaded from TMDB; images are served
  from TMDB's image CDN.
