import MovieCard from "./MovieCard";

export default function MovieRow({ title, movies, onSelect }) {
  if (!movies.length) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-2 px-6 text-lg font-semibold text-white md:px-12 md:text-xl">
        {title}
      </h2>
      <div className="flex gap-2 overflow-x-auto px-6 pb-4 md:px-12">
        {movies.map((movie) => (
          <div key={movie.id} className="w-36 flex-shrink-0 md:w-44">
            <MovieCard movie={movie} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </section>
  );
}
