import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function TitleModal({ movie, onClose }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!movie) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-lg bg-brand-dark shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="aspect-video w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <h2 className="mb-2 text-2xl font-bold text-white">{movie.title}</h2>
          <p className="mb-4 text-xs text-gray-400">
            {movie.releaseYear} · {movie.rating} · {movie.durationMinutes} min ·{" "}
            {movie.genres.join(", ")}
          </p>
          <p className="mb-6 text-sm text-gray-200">{movie.description}</p>
          <Link
            to={`/watch/${movie.id}`}
            className="inline-block rounded bg-white px-6 py-2 font-semibold text-black transition hover:bg-white/80"
          >
            ▶ Play
          </Link>
        </div>
      </div>
    </div>
  );
}
