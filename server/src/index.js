import express from "express";
import * as catalog from "./catalog.js";
import * as profiles from "./profiles.js";

const app = express();
app.use(express.json());

app.param("id", (_req, res, next, id) => {
  if (!/^\d{1,18}$/.test(id)) return res.status(404).json({ error: "Title not found" });
  next();
});

app.param("profileId", async (req, res, next, profileId) => {
  try {
    req.profile = /^\d{1,9}$/.test(profileId) ? await profiles.getProfile(profileId) : null;
    if (!req.profile) return res.status(404).json({ error: "Profile not found" });
    next();
  } catch (err) {
    next(err);
  }
});

const rejectGuest = (error) => (req, res, next) =>
  req.profile.isGuest ? res.status(403).json({ error }) : next();
const requireFavoritesAccess = rejectGuest("Guest profiles can't have favorites");
const requireEditableProfile = rejectGuest("The guest profile can't be changed");

/** Sends a profiles.js mutation result: its error, the updated profile, or 204. */
function sendResult(res, { profile, status, error }, successStatus = 200) {
  if (error) return res.status(status).json({ error });
  if (profile) return res.status(successStatus).json(profile);
  res.status(204).end();
}

app.get("/api/featured", async (_req, res) => {
  res.json(await catalog.getFeatured());
});

app.get("/api/rows", async (_req, res) => {
  res.json(await catalog.getRows());
});

app.get("/api/search", async (req, res) => {
  res.json(await catalog.searchTitles(String(req.query.q ?? "")));
});

app.get("/api/titles/:id", async (req, res) => {
  const title = await catalog.getTitle(req.params.id);
  if (!title) return res.status(404).json({ error: "Title not found" });
  res.json(title);
});

app.get("/api/titles/:id/cast", async (req, res) => {
  res.json(await catalog.getCast(req.params.id));
});

app.get("/api/titles/:id/recommendations", async (req, res) => {
  res.json(await catalog.getRecommendations(req.params.id));
});

app.get("/api/profiles", async (_req, res) => {
  res.json({
    profiles: await profiles.listProfiles(),
    maxProfiles: profiles.MAX_PROFILES,
    maxNameLength: profiles.MAX_NAME_LENGTH,
    colors: profiles.PROFILE_COLORS,
  });
});

app.post("/api/profiles", async (req, res) => {
  const { name, color } = req.body ?? {};
  sendResult(res, await profiles.createProfile({ name, color }), 201);
});

app.patch("/api/profiles/:profileId", requireEditableProfile, async (req, res) => {
  const { name, color } = req.body ?? {};
  sendResult(res, await profiles.updateProfile(req.profile.id, { name, color }));
});

app.delete("/api/profiles/:profileId", requireEditableProfile, async (req, res) => {
  sendResult(res, await profiles.deleteProfile(req.profile.id));
});

app.get("/api/profiles/:profileId/avatar", async (req, res) => {
  const avatar = await profiles.getAvatar(req.profile.id);
  if (!avatar) return res.status(404).json({ error: "This profile has no photo" });
  res.set({
    "Content-Type": avatar.content_type,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  res.send(avatar.data);
});

app.put(
  "/api/profiles/:profileId/avatar",
  requireEditableProfile,
  express.raw({ type: () => true, limit: "2mb" }),
  async (req, res) => {
    sendResult(res, await profiles.setAvatar(req.profile.id, req.body));
  },
);

app.delete("/api/profiles/:profileId/avatar", requireEditableProfile, async (req, res) => {
  sendResult(res, await profiles.removeAvatar(req.profile.id));
});

app.get("/api/profiles/:profileId/favorites", requireFavoritesAccess, async (req, res) => {
  res.json(await profiles.getFavorites(req.profile.id));
});

app.put("/api/profiles/:profileId/favorites/:id", requireFavoritesAccess, async (req, res) => {
  const found = await profiles.addFavorite(req.profile.id, req.params.id);
  if (!found) return res.status(404).json({ error: "Title not found" });
  res.status(204).end();
});

app.delete("/api/profiles/:profileId/favorites/:id", requireFavoritesAccess, async (req, res) => {
  await profiles.removeFavorite(req.profile.id, req.params.id);
  res.status(204).end();
});

app.use((err, _req, res, _next) => {
  // Client errors raised by middleware, e.g. malformed JSON bodies.
  if (err.expose) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
