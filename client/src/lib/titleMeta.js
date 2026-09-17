export function lengthLabel(title) {
  if (title.type === "tv") {
    return title.seasons
      ? `${title.seasons} Season${title.seasons === 1 ? "" : "s"}`
      : null;
  }
  return title.durationMinutes ? `${title.durationMinutes} min` : null;
}

export function joinMeta(...parts) {
  return parts.filter(Boolean).join(" · ");
}
