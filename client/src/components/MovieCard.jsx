export default function MovieCard({ movie, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(movie)}
      className="group relative block w-full overflow-hidden rounded text-left transition-transform duration-200 hover:z-10 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white"
    >
      <img
        src={movie.posterUrl}
        alt={movie.title}
        loading="lazy"
        className="aspect-[2/3] w-full object-cover"
      />
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/10 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <div>
          <p className="text-xs font-semibold text-white">{movie.title}</p>
          <p className="text-[10px] text-gray-300">
            {movie.releaseYear} · {movie.rating}
          </p>
        </div>
      </div>
    </button>
  );
}
