import useAsync from "../hooks/useAsync";
import { getCast, getRecommendations } from "../api/catalog";
import { joinMeta, lengthLabel } from "../lib/titleMeta";

function initials(name) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
}

export default function TitleExtras({ id, onSelect }) {
  const { data: cast } = useAsync(() => getCast(id), [id]);
  const { data: recommendations } = useAsync(() => getRecommendations(id), [id]);

  return (
    <>
      {cast?.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 text-lg font-semibold text-white">Cast</h3>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cast.map((person) => (
              <li key={person.id} className="flex min-w-0 items-center gap-3">
                {person.photoUrl ? (
                  <img
                    src={person.photoUrl}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold text-gray-300">
                    {initials(person.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{person.name}</p>
                  {person.character && (
                    <p className="truncate text-xs text-gray-400">
                      {person.character}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recommendations?.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 text-lg font-semibold text-white">More Like This</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {recommendations.map((title) => (
              <button
                key={title.id}
                type="button"
                onClick={() => onSelect(title.id)}
                className="overflow-hidden rounded bg-neutral-800 text-left transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <img
                  src={title.backdropUrl}
                  alt=""
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
                <div className="p-3">
                  <p className="mb-1 truncate text-sm font-semibold text-white">
                    {title.title}
                  </p>
                  <p className="mb-2 text-xs text-gray-400">
                    {joinMeta(title.releaseYear, title.rating, lengthLabel(title))}
                  </p>
                  <p className="line-clamp-3 text-xs text-gray-300">
                    {title.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
