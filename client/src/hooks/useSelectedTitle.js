import { useSearchParams } from "react-router-dom";

/** The title whose details modal is open, kept in `?title=` so it can be linked back to. */
export default function useSelectedTitle() {
  const [searchParams, setSearchParams] = useSearchParams();

  function select(id) {
    setSearchParams(
      (params) => {
        if (id) params.set("title", id);
        else params.delete("title");
        return params;
      },
      { replace: true },
    );
  }

  return [searchParams.get("title"), select];
}
