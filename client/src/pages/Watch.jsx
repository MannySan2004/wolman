import { useCallback, useEffect, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import useAsync from "../hooks/useAsync";
import { getTitle } from "../api/catalog";

export default function Watch() {
  const { id } = useParams();
  const { data: movie, loading, error } = useAsync(() => getTitle(id), [id]);
  const trailerRef = useRef(null);
  const navigate = useNavigate();
  const fromTitle = useLocation().state?.fromTitle;

  // Leave to this title's details: step back if we came from them, otherwise open them on Browse.
  const exitToTitle = useCallback(() => {
    if (fromTitle) navigate(-1);
    else navigate(`/browse?title=${encodeURIComponent(id)}`, { replace: true });
  }, [fromTitle, id, navigate]);

  useEffect(() => {
    const trailer = trailerRef.current;
    if (!trailer) return;

    function onFullscreenChange() {
      if (!document.fullscreenElement) exitToTitle();
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    // Browsers only grant this shortly after a click (e.g. Play); otherwise the embed stays inline.
    trailer.requestFullscreen?.()?.catch(() => {});

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [movie, exitToTitle]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-gray-400">
        Loading…
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <p>{error ? "Couldn't load this title." : "Title not found."}</p>
        <Link to="/browse" className="text-brand-red hover:underline">
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white">
      <button
        type="button"
        onClick={exitToTitle}
        aria-label={`Back to ${movie.title}`}
        className="absolute left-6 top-6 z-10 text-3xl leading-none hover:opacity-70"
      >
        ←
      </button>

      <div className="flex flex-1 items-center justify-center p-6">
        {movie.trailerKey ? (
          <iframe
            ref={trailerRef}
            src={`https://www.youtube.com/embed/${encodeURIComponent(movie.trailerKey)}?autoplay=1`}
            title={`${movie.title} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="aspect-video w-full max-w-6xl"
          />
        ) : (
          <div className="max-w-md text-center">
            <div className="mb-6 flex aspect-video items-center justify-center rounded bg-neutral-900 text-5xl text-neutral-700">
              ▶
            </div>
            <p className="mb-2 text-xl font-semibold">{movie.title}</p>
            <p className="text-sm text-gray-400">
              No trailer available for this title yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
