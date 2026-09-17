import { useEffect, useState } from "react";

/**
 * Runs an async catalog call and tracks its result, so pages don't each
 * hand-roll loading and error state.
 */
export default function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fn().then(
      (result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
      },
      (err) => {
        if (!active) return;
        setError(err);
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
