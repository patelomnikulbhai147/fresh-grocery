"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { categories as staticCategories } from "@/data/catalog";
import { useAdminStore } from "@/store/adminStore";

export function CategoryGrid() {
  const adminCategories = useAdminStore((s) => s.categories);
  const displayCategories = adminCategories && adminCategories.length > 0 ? adminCategories : staticCategories;

  return (
    <section className="py-16 md:py-24 bg-slate-50/60">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.24em] font-bold text-purple-700 mb-2 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Fresh Categories
            </div>
            <h2 className="font-display text-3xl md:text-5xl text-purple-950 text-balance leading-tight">
              Fresh Vegetables & <span className="italic text-amber-600">Seasonal Fruits</span>.
            </h2>
            <p className="mt-2 text-slate-600 text-sm md:text-base">
              Hand-picked daily from regional partner farms for optimum freshness, taste, and nutrition.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-900 hover:text-amber-600 transition shrink-0 group"
          >
            Browse All Produce <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {displayCategories.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: Math.min(i * 0.06, 0.3), duration: 0.4 }}
            >
              <Link
                href={`/shop?cat=${c.slug}`}
                className={`group relative block overflow-hidden rounded-3xl bg-gradient-to-br ${c.accent} aspect-[4/5] shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 border border-purple-100`}
              >
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/30 to-transparent" />

                <div className="absolute inset-x-4 bottom-4 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="font-display text-lg md:text-xl leading-tight font-extrabold text-white drop-shadow-md">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-amber-300 mt-1 font-bold">
                        {c.count} items available
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur grid place-items-center group-hover:bg-amber-400 group-hover:text-purple-950 transition shadow-sm shrink-0">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
