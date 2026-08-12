"use client";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star, BadgeCheck, Sparkles } from "lucide-react";
import { testimonials } from "@/data/catalog";
import { cn } from "@/lib/utils";

export function Reviews() {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((i) => (i + 1) % testimonials.length);
  const prev = () => setIdx((i) => (i - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[idx];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-purple-50/30">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.24em] font-bold text-purple-700 mb-2 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Trusted Partnerships
            </div>
            <h2 className="font-display text-3xl md:text-5xl text-purple-950 text-balance leading-tight">
              Freshness You Trust, <span className="italic text-amber-600">Quality You Deserve</span>.
            </h2>
            <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
              Hear from hostel managers, commercial chefs, local shopkeepers, and direct consumers who rely on FlashKart daily.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex text-amber-500">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-5 h-5" fill="currentColor" />
                ))}
              </div>
              <div className="text-sm text-purple-900 font-bold">
                <span>4.9 / 5.0</span> · Rated for Quality & Reliability
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={prev}
                aria-label="Previous review"
                className="w-11 h-11 grid place-items-center rounded-full bg-white border border-purple-200 hover:border-purple-500 text-purple-900 shadow-sm transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                aria-label="Next review"
                className="w-11 h-11 grid place-items-center rounded-full bg-purple-950 hover:bg-purple-900 text-white shadow-sm transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="ml-2 text-xs font-bold text-purple-700">
                <span>{idx + 1}</span> / {testimonials.length}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 relative min-h-[300px]">
            <Quote className="absolute -top-3 -left-3 w-16 h-16 text-purple-100/80 -z-0" />
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-3xl border border-purple-100 shadow-soft p-7 md:p-9 relative z-10"
              >
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className={cn("w-4 h-4", i < t.rating ? "text-amber-400 fill-amber-400" : "text-slate-200")}
                    />
                  ))}
                </div>
                <p className="font-display text-lg md:text-xl leading-relaxed text-purple-950">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-6 pt-5 border-t border-purple-50 flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-purple-100 border-2 border-purple-200 shrink-0">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-purple-950 flex items-center gap-1.5">
                      {t.name}
                      {t.verified && (
                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{t.role} · {t.location}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
