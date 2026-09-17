import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import TitleModal from "../components/TitleModal";
import useAsync from "../hooks/useAsync";
import useSelectedTitle from "../hooks/useSelectedTitle";
import { useProfile } from "../context/profileContext";
import { getFeatured, getRows } from "../api/catalog";

export default function Browse() {
  const { data: featured } = useAsync(getFeatured);
  const { data: rows, loading, error } = useAsync(getRows);
  const [selectedId, selectTitle] = useSelectedTitle();
  const { canFavorite, favorites } = useProfile();
  const openTitle = (movie) => selectTitle(movie.id);

  return (
    <div className="min-h-screen bg-brand-black">
      <Navbar />
      <Hero movie={featured} onMoreInfo={openTitle} />

      <div className="relative z-10 -mt-10 pb-12">
        {loading ? (
          <p className="px-6 text-gray-400 md:px-12">Loading catalog…</p>
        ) : error ? (
          <p className="px-6 pt-24 text-gray-400 md:px-12">
            Couldn't load the catalog. Is the API running?
          </p>
        ) : (
          <>
            {canFavorite && (
              <MovieRow
                title="My Favorites"
                movies={favorites}
                onSelect={openTitle}
              />
            )}
            {rows.map(({ title, titles }) => (
              <MovieRow
                key={title}
                title={title}
                movies={titles}
                onSelect={openTitle}
              />
            ))}
          </>
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
