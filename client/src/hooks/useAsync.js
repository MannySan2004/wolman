import { useEffect, useState } from "react";

/**
 * Runs an async catalog call and tracks its result. Keeps pages from each
 * hand-rolling loading state, and means they already handle latency once the
 * real API is behind src/api/catalog.js.
 */
export default function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fn().then((result) => {
      if (!active) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading };
}
