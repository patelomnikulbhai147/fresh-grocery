"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sprout } from "lucide-react";

/**
 * Seasonal Vegetables — promotional banner carousel.
 *
 * Displays the 5 seasonal promo banners (full artwork, never cropped) with
 * auto-advance, prev/next, dot indicators, swipe on touch, keyboard arrows,
 * and pause-on-interaction. Pure promotional banners — they intentionally do
 * NOT link to product pages (no fake product records are created for seasonal
 * items that may not exist in the live catalog).
 */
type Slide = { key: string; src: string; alt: string };

const SLIDES: Slide[] = [
  { key: "kankoda", src: "/images/seasonal/kankoda.jpg", alt: "Fresh Kankoda (Spiny Gourd / Kankod) — Season's Pick" },
  { key: "karela", src: "/images/seasonal/karela.jpg", alt: "Fresh Karela (Bitter Gourd / Karela) — Season's Pick" },
  { key: "pudina", src: "/images/seasonal/pudina.jpg", alt: "Fresh Pudina (Mint Leaves / Pudino) — Season's Pick" },
  { key: "kakdi", src: "/images/seasonal/kakdi.jpg", alt: "Fresh Kakdi (Cucumber / Kakdi / Kheera) — Season's Pick" },
  { key: "palak", src: "/images/seasonal/palak.jpg", alt: "Fresh Palak (Spinach / Palak) — Season's Pick" },
];

const INTERVAL = 5000;

export function SeasonalBannerCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);
  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  // Auto-advance — paused on hover/focus/touch interaction.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(id);
  }, [paused, count]);

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

  return (
    <section className="mb-8" aria-roledescription="carousel" aria-label="Seasonal Vegetables">
      <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#067a46] border border-emerald-100 grid place-items-center shrink-0">
          <Sprout className="w-4 h-4" />
        </span>
        <h2 className="font-display font-extrabold text-base sm:text-lg text-[#2b1a4e]">
          Seasonal Vegetables
        </h2>
      </div>

      <div
        className="relative mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl aspect-[21/10] overflow-hidden rounded-xl ring-1 ring-emerald-900/10 bg-[#eef6e0] shadow-sm select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        tabIndex={0}
        role="group"
        aria-label={`Slide ${index + 1} of ${count}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
          if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        }}
      >
        {/* Sliding track */}
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((s, i) => (
            <div key={s.key} className="w-full h-full shrink-0 grow-0 basis-full" aria-hidden={i !== index}>
              {/* object-contain preserves the full banner (logo + text + product)
                  — never cropped or distorted; the soft green matte blends with
                  the banner's own light background. Eager: only 5 banners, and
                  they must be ready so sliding never flashes blank. */}
              <img
                src={s.src}
                alt={s.alt}
                loading="eager"
                draggable={false}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>

        {/* Prev / Next */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 grid place-items-center rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm transition active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 grid place-items-center rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm transition active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-[#067a46]" : "w-1.5 bg-white/80 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
