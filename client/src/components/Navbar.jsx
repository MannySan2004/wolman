import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Transparent over the hero, solid once content scrolls under it.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header
      className={`fixed top-0 z-30 flex w-full items-center justify-between gap-4 px-6 py-4 transition-colors duration-300 md:px-12 ${
        scrolled
          ? "bg-brand-black"
          : "bg-gradient-to-b from-black/90 via-black/60 to-transparent"
      }`}
    >
      <div className="flex items-center gap-6">
        <Link
          to="/browse"
          className="text-xl font-extrabold tracking-tight text-brand-red md:text-2xl"
        >
          WOLMAN
        </Link>
        <Link
          to="/browse"
          className="hidden text-sm text-gray-200 hover:text-white md:block"
        >
          Home
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titles, genres"
            aria-label="Search titles"
            className="w-36 rounded border border-white/30 bg-black/60 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-white focus:outline-none md:w-56"
          />
        </form>
        <Link
          to="/profiles"
          className="text-sm text-gray-200 hover:text-white"
        >
          Profiles
        </Link>
        <Link to="/" className="text-sm text-gray-200 hover:text-white">
          Sign Out
        </Link>
      </div>
    </header>
  );
}
