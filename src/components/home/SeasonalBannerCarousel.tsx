"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sprout } from "lucide-react";

/**
 * Seasonal Vegetables — a multi-card auto-scrolling carousel.
 *
 * Shows 2–3 small promo cards at once (responsive) and auto-advances one card
 * at a time, looping seamlessly. Prev/next, dots, touch swipe, keyboard arrows,
 * pause-on-interaction. Pure promotional banners — no fake product records.
 */
type Slide = { key: string; src: string; alt: string };

const SLIDES: Slide[] = [
  { key: "kankoda", src: "/images/seasonal/kankoda.jpg", alt: "Fresh Kankoda (Spiny Gourd / Kankod) — Season's Pick" },
  { key: "karela", src: "/images/seasonal/karela.jpg", alt: "Fresh Karela (Bitter Gourd / Karela) — Season's Pick" },
  { key: "pudina", src: "/images/seasonal/pudina.jpg", alt: "Fresh Pudina (Mint Leaves / Pudino) — Season's Pick" },
  { key: "palak", src: "/images/seasonal/palak.jpg", alt: "Fresh Palak (Spinach / Palak) — Season's Pick" },
];

const INTERVAL = 3200;
const COUNT = SLIDES.length;

/** How many cards are visible at once (responsive). */
function usePerView() {
  const [pv, setPv] = useState(3);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPv(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return pv;
}

export function SeasonalBannerCarousel() {
  const perView = usePerView();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animate, setAnimate] = useState(true);

  // Duplicate the list so the track always has cards to its right — the loop
  // resets invisibly once we scroll one full set forward.
  const cards = [...SLIDES, ...SLIDES];

  const next = useCallback(() => setIndex((i) => i + 1), []);
  const prev = useCallback(() => setIndex((i) => (i <= 0 ? COUNT - 1 : i - 1)), []);

  // Auto-advance — paused on hover/focus/touch.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => i + 1), INTERVAL);
    return () => clearInterval(id);
  }, [paused]);

  // Seamless loop: after the transition that lands us on the duplicated set,
  // snap back by one set with animation off, then re-enable it.
  const onTransitionEnd = () => {
    if (index >= COUNT) {
      setAnimate(false);
      setIndex((i) => i - COUNT);
    }
  };
  useEffect(() => {
    if (!animate) {
      const raf = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [animate]);

  // Touch swipe
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current !== null) {
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    }
    touchX.current = null;
    setPaused(false);
  };

  const activeDot = ((index % COUNT) + COUNT) % COUNT;
  const cardBasis = 100 / perView;

  return (
    <section className="mb-8" aria-roledescription="carousel" aria-label="Seasonal Vegetables">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#067a46] border border-emerald-100 grid place-items-center shrink-0">
          <Sprout className="w-4 h-4" />
        </span>
        <h2 className="font-display font-extrabold text-lg sm:text-xl md:text-2xl text-[#2b1a4e]">
          Seasonal Vegetables
        </h2>
      </div>

      <div
        className="relative select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        tabIndex={0}
        role="group"
        aria-label={`Seasonal slide ${activeDot + 1} of ${COUNT}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
          if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        }}
      >
        <div className="overflow-hidden">
          {/* Sliding track — moves one card at a time */}
          <div
            className="flex ease-out"
            style={{
              transform: `translateX(-${index * cardBasis}%)`,
              transition: animate ? "transform 500ms" : "none",
            }}
            onTransitionEnd={onTransitionEnd}
          >
            {cards.map((s, i) => (
              <div key={`${s.key}-${i}`} style={{ flex: `0 0 ${cardBasis}%` }} className="px-1.5">
                <div className="aspect-[21/10] rounded-xl overflow-hidden ring-1 ring-emerald-900/10 bg-[#eef6e0] shadow-sm">
                  {/* object-cover fills the card edge-to-edge (corner to corner) —
                      no cream matte gaps around the banner. */}
                  <img
                    src={s.src}
                    alt={s.alt}
                    loading="eager"
                    draggable={false}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prev / Next */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute -left-1 sm:left-1 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm transition active:scale-95 z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute -right-1 sm:right-1 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm transition active:scale-95 z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dots */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeDot}
              className={`h-1.5 rounded-full transition-all ${
                i === activeDot ? "w-4 bg-[#067a46]" : "w-1.5 bg-emerald-200 hover:bg-emerald-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
