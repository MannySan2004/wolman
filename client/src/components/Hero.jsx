import { Link } from "react-router-dom";

export default function Hero({ movie, onMoreInfo }) {
  if (!movie) return null;

  return (
    <div
      className="relative flex h-[65vh] w-full items-end bg-cover bg-center md:h-[80vh]"
      style={{ backgroundImage: `url(${movie.backdropUrl})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-black/40" />
      <div className="relative z-10 max-w-xl px-6 pb-24 md:px-12">
        <h1 className="mb-3 text-3xl font-bold text-white drop-shadow md:text-5xl">
          {movie.title}
        </h1>
        <p className="mb-2 text-xs text-gray-300">
          {movie.releaseYear} · {movie.rating} · {movie.durationMinutes} min
        </p>
        <p className="mb-6 text-sm text-gray-200 md:text-base">
          {movie.description}
        </p>
        <div className="flex gap-3">
          <Link
            to={`/watch/${movie.id}`}
            className="rounded bg-white px-6 py-2 font-semibold text-black transition hover:bg-white/80"
          >
            ▶ Play
          </Link>
          <button
            type="button"
            onClick={() => onMoreInfo(movie)}
            className="rounded bg-gray-500/60 px-6 py-2 font-semibold text-white transition hover:bg-gray-500/40"
          >
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}
