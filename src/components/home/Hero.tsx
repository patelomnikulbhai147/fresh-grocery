"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Store, Building, Hotel, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Slide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  tag: string;
  cta: { label: string; href: string };
  secondary: { label: string; href: string };
  image: string;
  badge: string;
};

const slides: Slide[] = [
  {
    eyebrow: "FlashKart · Fresh. Fast. Reliable.",
    title: "Fresh Vegetables & Seasonal Fruits,\nDirect From FlashKart",
    subtitle:
      "Quality-focused fresh produce at better rates, supplied through our growing network of hostels, PGs, hotels and shops.",
    tag: "Gandhinagar Hub",
    cta: { label: "Explore Our Products", href: "/shop" },
    secondary: { label: "Become a Franchise Partner", href: "/franchise" },
    image: "/images/products/tomato.jpg",
    badge: "Direct Farm Fresh Produce",
  },
  {
    eyebrow: "Institutional & Business Sourcing",
    title: "Regular Morning Supply for\nHostels, PGs, Hotels & Shops",
    subtitle:
      "Carefully sorted, pesticide-checked fresh vegetables and seasonal fruits with dependable morning fulfillment and fair pricing.",
    tag: "Supply Network",
    cta: { label: "Where We Supply", href: "/where-we-supply" },
    secondary: { label: "Contact Leadership", href: "/contact" },
    image: "/images/products/potato.jpg",
    badge: "Hostels · Hotels · Shops",
  },
  {
    eyebrow: "Franchise Opportunity in Gujarat",
    title: "Start Your Own FlashKart\nFresh Produce Shop",
    subtitle:
      "Partner with an established brand, get reliable daily produce supply, and build your own fresh vegetable and fruit retail business.",
    tag: "Grow With FlashKart",
    cta: { label: "Franchise Details", href: "/franchise" },
    secondary: { label: "Explore Products", href: "/shop" },
    image: "/images/products/cucumber.jpg",
    badge: "Franchise Inquiries Open",
  },
];

export function Hero() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused]);

  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);
  const slide = slides[idx];

  return (
    <section
      className="relative overflow-hidden bg-purple-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[580px] md:min-h-[640px] flex items-center">
        {/* Background Image Carousel with Purple Gradient Overlays */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={slide.image}
              alt="FlashKart Fresh Produce"
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center opacity-30"
            />
            {/* Multi-layered Purple & Amber Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-950 via-purple-950/90 to-purple-900/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-transparent to-purple-950/40" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24 w-full">
          <div className="max-w-3xl">
            {/* Pill Eyebrow */}
            <motion.div
              key={`eyebrow-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {slide.eyebrow}
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              key={`title-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.12] tracking-tight whitespace-pre-line text-balance"
            >
              {slide.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              key={`sub-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-5 text-base md:text-lg text-purple-100/90 leading-relaxed max-w-2xl"
            >
              {slide.subtitle}
            </motion.p>

            {/* Supporting Trust Badges */}
            <motion.div
              key={`badges-${idx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-6 flex flex-wrap items-center gap-3 text-xs text-purple-200"
            >
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Best Quality • Best Rate
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Direct Farm Sourcing
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <Store className="w-3.5 h-3.5 text-purple-300" /> Hostels, Hotels & Shops
              </span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              key={`cta-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href={slide.cta.href}
                className="bg-amber-500 hover:bg-amber-400 text-purple-950 font-bold px-7 py-3.5 rounded-full text-sm md:text-base transition shadow-glow-cta flex items-center gap-2 group"
              >
                {slide.cta.label}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={slide.secondary.href}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-full text-sm md:text-base border border-white/20 transition backdrop-blur-sm"
              >
                {slide.secondary.label}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Carousel Navigation Controls */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={prev}
            aria-label="Previous Slide"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 grid place-items-center transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5 px-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === idx ? "w-7 bg-amber-400" : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            aria-label="Next Slide"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 grid place-items-center transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
