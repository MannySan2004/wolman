import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import TitleExtras from "./TitleExtras";
import useAsync from "../hooks/useAsync";
import { useProfile } from "../context/profileContext";
import { getTitle } from "../api/catalog";
import { joinMeta, lengthLabel } from "../lib/titleMeta";

export default function TitleModal({ id, onSelect, onClose }) {
  const { data: movie } = useAsync(
    () => (id ? getTitle(id) : Promise.resolve(null)),
    [id],
  );
  const panelRef = useRef(null);
  const { canFavorite, isFavorite, toggleFavorite } = useProfile();
  const [savingFavorite, setSavingFavorite] = useState(false);

  async function handleToggleFavorite() {
    setSavingFavorite(true);
    await toggleFavorite(movie);
    setSavingFavorite(false);
  }

  useEffect(() => {
    panelRef.current?.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!id || !movie || String(movie.id) !== String(id)) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-brand-dark shadow-2xl"
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
            {joinMeta(
              movie.releaseYear,
              movie.rating,
              lengthLabel(movie),
              movie.genres.join(", "),
            )}
          </p>
          <p className="mb-6 text-sm text-gray-200">{movie.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/watch/${movie.id}`}
              state={{ fromTitle: true }}
              className="inline-block rounded bg-white px-6 py-2 font-semibold text-black transition hover:bg-white/80"
            >
              ▶ Play
            </Link>
            {canFavorite && (
              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={savingFavorite}
                aria-pressed={isFavorite(movie.id)}
                className="inline-flex items-center gap-2 rounded border border-white/40 bg-black/40 px-4 py-2 font-semibold text-white transition hover:border-white disabled:opacity-60"
              >
                {isFavorite(movie.id) ? (
                  <>
                    <span className="text-brand-red">♥</span> In My Favorites
                  </>
                ) : (
                  <>
                    <span>♡</span> Add to My Favorites
                  </>
                )}
              </button>
            )}
          </div>

          <TitleExtras key={movie.id} id={movie.id} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}
