import { useEffect, useRef, useState } from "react";
import MovieCard from "./MovieCard";

const HOVER_SPEED = 700; // px/s while the pointer rests on an arrow
const REWIND_SPEED = 5000; // px/s when looping back around from an end

function isAtEnd(el, direction) {
  const max = el.scrollWidth - el.clientWidth;
  return direction > 0 ? el.scrollLeft >= max - 1 : el.scrollLeft <= 0;
}

export default function MovieRow({ title, movies, onSelect }) {
  const scrollerRef = useRef(null);
  const frameRef = useRef(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => setOverflows(el.scrollWidth > el.clientWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [movies]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  function stopHoverScroll() {
    cancelAnimationFrame(frameRef.current);
  }

  function startHoverScroll(direction) {
    stopHoverScroll();
    const el = scrollerRef.current;
    let last = null;
    let rewinding = false;

    const step = (now) => {
      const seconds = last === null ? 0 : Math.min(now - last, 100) / 1000;
      last = now;
      if (!rewinding && isAtEnd(el, direction)) rewinding = true;
      if (rewinding) {
        el.scrollLeft -= direction * REWIND_SPEED * seconds;
        rewinding = !isAtEnd(el, -direction);
      } else {
        el.scrollLeft += direction * HOVER_SPEED * seconds;
      }
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  }

  function page(direction) {
    const el = scrollerRef.current;
    const max = el.scrollWidth - el.clientWidth;
    const left = isAtEnd(el, direction)
      ? direction > 0 ? 0 : max
      : el.scrollLeft + direction * el.clientWidth * 0.8;
    el.scrollTo({ left, behavior: "smooth" });
  }

  if (!movies.length) return null;

  const arrowClass =
    "absolute bottom-4 top-0 z-20 flex w-10 items-center justify-center bg-black/50 text-5xl leading-none text-white opacity-0 transition-opacity hover:bg-black/70 focus:opacity-100 group-hover:opacity-100 md:w-12";

  function arrowProps(direction) {
    return {
      type: "button",
      "aria-label": `Scroll ${title} ${direction > 0 ? "right" : "left"}`,
      onClick: () => page(direction),
      // Touch taps also fire pointerenter, which would start a scroll that never stops.
      onPointerEnter: (e) => e.pointerType === "mouse" && startHoverScroll(direction),
      onPointerLeave: stopHoverScroll,
    };
  }

  return (
    <section className="mb-8">
      <h2 className="mb-2 px-6 text-lg font-semibold text-white md:px-12 md:text-xl">
        {title}
      </h2>
      <div className="group relative">
        {overflows && (
          <button {...arrowProps(-1)} className={`${arrowClass} left-0`}>
            ‹
          </button>
        )}
        <div
          ref={scrollerRef}
          className="scrollbar-none flex gap-2 overflow-x-auto px-6 pb-4 md:px-12"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="w-36 flex-shrink-0 md:w-44">
              <MovieCard movie={movie} onSelect={onSelect} />
            </div>
          ))}
        </div>
        {overflows && (
          <button {...arrowProps(1)} className={`${arrowClass} right-0`}>
            ›
          </button>
        )}
      </div>
    </section>
  );
}
