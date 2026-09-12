import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import TitleModal from "../components/TitleModal";
import useAsync from "../hooks/useAsync";
import { getFeatured, getRows } from "../api/catalog";

export default function Browse() {
  const { data: featured } = useAsync(getFeatured);
  const { data: rows, loading } = useAsync(getRows);
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-brand-black">
      <Navbar />
      <Hero movie={featured} onMoreInfo={setSelected} />

      <div className="relative z-10 -mt-10 pb-12">
        {loading ? (
          <p className="px-6 text-gray-400 md:px-12">Loading catalog…</p>
        ) : (
          rows.map(({ genre, titles }) => (
            <MovieRow
              key={genre}
              title={genre}
              movies={titles}
              onSelect={setSelected}
            />
          ))
        )}
      </div>

      <TitleModal movie={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
