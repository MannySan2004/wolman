# Server

Express API over the `netflix` PostgreSQL database on RDS. The catalog tables
are read-only here; the app owns `profiles`, `profile_favorites`, and
`profile_avatars` (`db/app-schema.sql`).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill it in. Wrap the password in single
   quotes if it has special characters.
3. Requires the AWS CLI (logged in) and the Session Manager plugin for the
   tunnel.
4. With the tunnel open, `npm run db:schema` to create or upgrade the app
   tables (safe to re-run; run it again after pulling schema changes).

## Run

```
npm run tunnel   # forwards localhost:$PGPORT to RDS through the bastion
npm run dev      # API on http://localhost:$PORT, restarts on file changes
```

TLS to RDS is verified against `certs/rds-global-bundle.pem` (Amazon's public
RDS CA bundle), using `RDS_HOST` as the expected hostname since `PGHOST` is the
local tunnel.

Use the `app_api` database role in `.env` rather than the master user: it can
read the catalog and manage profiles, favorites, and profile photos.

## Endpoints

| Route | Returns |
| --- | --- |
| `GET /api/featured` | Hero title: `is_featured` first, else most popular with a backdrop |
| `GET /api/rows` | `{ title, titles }[]`: top picks in the US, popular TV, popular movies, then genre rows |
| `GET /api/search?q=` | Titles matching full-text search, title substring, or genre name |
| `GET /api/titles/:id` | One title, or 404 |
| `GET /api/titles/:id/cast` | Top-billed cast: `{ id, name, character, photoUrl }[]` |
| `GET /api/titles/:id/recommendations` | Similar titles, scored by shared keywords and genres, same type first |
| `GET /api/profiles` | `{ profiles: { id, name, isGuest, color, avatarUrl }[], maxProfiles, maxNameLength, colors: { name, value }[] }` |
| `POST /api/profiles` | Body `{ name, color? }`. 201 with the profile; 400 bad name/color; 409 name taken (case-insensitive) or 5 non-guest profiles already exist |
| `PATCH /api/profiles/:profileId` | Body `{ name?, color? }`. The updated profile; 400/409 as above; 403 for the guest |
| `DELETE /api/profiles/:profileId` | 204, also deletes its favorites and photo; 409 if it's the last non-guest profile; 403 for the guest |
| `GET /api/profiles/:profileId/avatar` | The profile photo (JPEG/PNG/WebP), or 404 |
| `PUT /api/profiles/:profileId/avatar` | Raw image body, max 2 MB, type checked from the bytes. The updated profile; 415 if not an image; 403 for the guest |
| `DELETE /api/profiles/:profileId/avatar` | Removes the photo. The updated profile; 403 for the guest |
| `GET /api/profiles/:profileId/favorites` | The profile's favorite titles, newest first (403 for guests) |
| `PUT /api/profiles/:profileId/favorites/:id` | Adds a favorite; 204, idempotent (403 for guests) |
| `DELETE /api/profiles/:profileId/favorites/:id` | Removes a favorite; 204 (403 for guests) |
