import { useParams, Link } from "react-router-dom";
import useAsync from "../hooks/useAsync";
import { getTitle } from "../api/catalog";

export default function Watch() {
  const { id } = useParams();
  const { data: movie, loading } = useAsync(() => getTitle(id), [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-gray-400">
        Loading…
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <p>Title not found.</p>
        <Link to="/browse" className="text-brand-red hover:underline">
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white">
      <Link
        to="/browse"
        aria-label="Back to Browse"
        className="absolute left-6 top-6 z-10 text-3xl leading-none hover:opacity-70"
      >
        ←
      </Link>

      <div className="flex flex-1 items-center justify-center p-6">
        {movie.videoUrl ? (
          <video
            src={movie.videoUrl}
            controls
            autoPlay
            className="max-h-[90vh] w-full max-w-6xl"
          />
        ) : (
          <div className="max-w-md text-center">
            <div className="mb-6 flex aspect-video items-center justify-center rounded bg-neutral-900 text-5xl text-neutral-700">
              ▶
            </div>
            <p className="mb-2 text-xl font-semibold">{movie.title}</p>
            <p className="text-sm text-gray-400">
              No video source yet. Playback starts working once titles carry a{" "}
              <code className="text-gray-300">videoUrl</code> — S3 object URLs
              for now, CDN later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
