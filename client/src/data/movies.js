// Placeholder catalog. Shape mirrors a typical movie-database export, so the
// real import can replace this file's contents wholesale.
//
// Poster/backdrop URLs point at a placeholder service for now; the real ones
// will be S3 object URLs (fronted by a CDN later).

const poster = (label, bg) =>
  `https://placehold.co/300x450/${bg}/ffffff?text=${encodeURIComponent(label)}`;
const backdrop = (label, bg) =>
  `https://placehold.co/1280x720/${bg}/ffffff?text=${encodeURIComponent(label)}`;

export const movies = [
  {
    id: 1,
    title: "Iron Meridian",
    description:
      "A demolitions expert is pulled back in for one last job on a rig that was never meant to be found.",
    posterUrl: poster("Iron Meridian", "7f1d1d"),
    backdropUrl: backdrop("Iron Meridian", "7f1d1d"),
    genres: ["Action", "Thriller"],
    releaseYear: 2024,
    rating: "TV-MA",
    durationMinutes: 128,
    videoUrl: "",
    featured: true,
  },
  {
    id: 2,
    title: "Last Convoy",
    description:
      "Six drivers, one mountain pass, and a shipment that three governments want to disappear.",
    posterUrl: poster("Last Convoy", "9a3412"),
    backdropUrl: backdrop("Last Convoy", "9a3412"),
    genres: ["Action"],
    releaseYear: 2022,
    rating: "PG-13",
    durationMinutes: 114,
    videoUrl: "",
  },
  {
    id: 3,
    title: "Redline Protocol",
    description:
      "When a racing syndicate goes dark, a former driver has 48 hours to surface its ledger.",
    posterUrl: poster("Redline Protocol", "b91c1c"),
    backdropUrl: backdrop("Redline Protocol", "b91c1c"),
    genres: ["Action", "Thriller"],
    releaseYear: 2023,
    rating: "TV-14",
    durationMinutes: 106,
    videoUrl: "",
  },
  {
    id: 4,
    title: "The Quiet Harbor",
    description:
      "Three siblings return to the fishing town they left behind, and to the argument they never finished.",
    posterUrl: poster("The Quiet Harbor", "1e3a5f"),
    backdropUrl: backdrop("The Quiet Harbor", "1e3a5f"),
    genres: ["Drama"],
    releaseYear: 2023,
    rating: "TV-14",
    durationMinutes: 132,
    videoUrl: "",
  },
  {
    id: 5,
    title: "Salt and Ember",
    description:
      "A glassblower's apprentice inherits a workshop, its debts, and the rivalry that built both.",
    posterUrl: poster("Salt and Ember", "78350f"),
    backdropUrl: backdrop("Salt and Ember", "78350f"),
    genres: ["Drama"],
    releaseYear: 2021,
    rating: "R",
    durationMinutes: 119,
    videoUrl: "",
  },
  {
    id: 6,
    title: "Northbound",
    description:
      "A long-haul nurse drives the winter road to a clinic that may already be closed.",
    posterUrl: poster("Northbound", "164e63"),
    backdropUrl: backdrop("Northbound", "164e63"),
    genres: ["Drama", "Thriller"],
    releaseYear: 2024,
    rating: "TV-MA",
    durationMinutes: 141,
    videoUrl: "",
  },
  {
    id: 7,
    title: "Total Disaster Club",
    description:
      "Four coworkers start a support group for their worst decisions and immediately make more.",
    posterUrl: poster("Total Disaster Club", "854d0e"),
    backdropUrl: backdrop("Total Disaster Club", "854d0e"),
    genres: ["Comedy"],
    releaseYear: 2024,
    rating: "TV-14",
    durationMinutes: 98,
    videoUrl: "",
  },
  {
    id: 8,
    title: "My Landlord, the Wizard",
    description:
      "The rent is reasonable. The plumbing is enchanted. The lease is, unfortunately, binding.",
    posterUrl: poster("My Landlord, the Wizard", "5b21b6"),
    backdropUrl: backdrop("My Landlord, the Wizard", "5b21b6"),
    genres: ["Comedy"],
    releaseYear: 2022,
    rating: "PG",
    durationMinutes: 101,
    videoUrl: "",
  },
  {
    id: 9,
    title: "Orbital Drift",
    description:
      "A salvage crew wakes from cryo to find their station has moved, and so has the year.",
    posterUrl: poster("Orbital Drift", "1e1b4b"),
    backdropUrl: backdrop("Orbital Drift", "1e1b4b"),
    genres: ["Sci-Fi", "Thriller"],
    releaseYear: 2025,
    rating: "TV-MA",
    durationMinutes: 137,
    videoUrl: "",
  },
  {
    id: 10,
    title: "Second Sun",
    description:
      "Astronomers detect a second dawn over the Pacific, and eleven minutes of missing time.",
    posterUrl: poster("Second Sun", "0f766e"),
    backdropUrl: backdrop("Second Sun", "0f766e"),
    genres: ["Sci-Fi"],
    releaseYear: 2023,
    rating: "PG-13",
    durationMinutes: 122,
    videoUrl: "",
  },
  {
    id: 11,
    title: "Glass Alibi",
    description:
      "A defense attorney takes the one case where every witness is telling the truth.",
    posterUrl: poster("Glass Alibi", "3f3f46"),
    backdropUrl: backdrop("Glass Alibi", "3f3f46"),
    genres: ["Thriller"],
    releaseYear: 2024,
    rating: "TV-MA",
    durationMinutes: 117,
    videoUrl: "",
  },
  {
    id: 12,
    title: "The Long Weekend",
    description:
      "A lake house, seven old friends, and a storm that takes out the only road home.",
    posterUrl: poster("The Long Weekend", "334155"),
    backdropUrl: backdrop("The Long Weekend", "334155"),
    genres: ["Thriller"],
    releaseYear: 2022,
    rating: "R",
    durationMinutes: 108,
    videoUrl: "",
  },
  {
    id: 13,
    title: "Deep Field",
    description:
      "Ten years, one telescope, and the faintest light anyone has ever tried to measure.",
    posterUrl: poster("Deep Field", "172554"),
    backdropUrl: backdrop("Deep Field", "172554"),
    genres: ["Documentary"],
    releaseYear: 2023,
    rating: "TV-G",
    durationMinutes: 89,
    videoUrl: "",
  },
  {
    id: 14,
    title: "Concrete Giants",
    description:
      "The engineers who poured the century's largest structures, and what they would do differently.",
    posterUrl: poster("Concrete Giants", "44403c"),
    backdropUrl: backdrop("Concrete Giants", "44403c"),
    genres: ["Documentary"],
    releaseYear: 2024,
    rating: "TV-PG",
    durationMinutes: 94,
    videoUrl: "",
  },
];
