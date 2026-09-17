import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import TitleModal from "../components/TitleModal";
import useAsync from "../hooks/useAsync";
import useSelectedTitle from "../hooks/useSelectedTitle";
import { searchTitles } from "../api/catalog";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { data: results, loading, error } = useAsync(
    () => searchTitles(query),
    [query],
  );
  const [selectedId, selectTitle] = useSelectedTitle();

  return (
    <div className="min-h-screen bg-brand-black">
      <Navbar />
      <div className="px-6 pb-12 pt-24 md:px-12">
        <h1 className="mb-6 text-xl text-white md:text-2xl">
          Results for <span className="font-semibold">{query}</span>
        </h1>

        {loading ? (
          <p className="text-gray-400">Searching…</p>
        ) : error ? (
          <p className="text-gray-400">Search failed. Is the API running?</p>
        ) : results.length === 0 ? (
          <p className="text-gray-400">
            No titles matched. Try a different title or genre.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {results.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={(movie) => selectTitle(movie.id)}
              />
            ))}
          </div>
        )}
      </div>

      <TitleModal
        id={selectedId}
        onSelect={selectTitle}
        onClose={() => selectTitle(null)}
      />
    </div>
  );
}
