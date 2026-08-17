"use client";

import Link from "next/link";
import Image from "next/image";
import { useAdminStore } from "@/store/adminStore";
import { categories as catalogCategories } from "@/data/catalog";
import { getCategoryStatus } from "@/lib/categoryHelper";

export function CategoryShowcase() {
  const adminCategories = useAdminStore((s) => s.categories);
  const source = adminCategories && adminCategories.length > 0 ? adminCategories : catalogCategories;

  const visible = source
    .filter((c) => getCategoryStatus(c) !== "Hidden")
    .sort((a, b) => ((a as { order?: number }).order ?? 0) - ((b as { order?: number }).order ?? 0));

  // Dairy & Eggs routes to the existing Coming Soon experience
  const tiles = [
    ...visible.map((c) => ({
      slug: c.slug,
      name: c.name,
      image: c.image,
      comingSoon: getCategoryStatus(c) === "Coming Soon",
    })),
    {
      slug: "dairy",
      name: "Dairy & Eggs",
      image: "/images/category_dairy_display.png",
      comingSoon: true,
    },
  ];

  return (
    <section className="py-6 sm:py-8">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="font-display font-extrabold text-lg sm:text-xl md:text-2xl text-[#2b1a4e]">
            Shop by Categories{" "}
            <span className="text-slate-400 font-bold text-sm sm:text-base">(Instant Delivery)</span>
          </h2>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-[#16a34a] hover:text-[#15803d] transition shrink-0"
          >
            View All →
          </Link>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-1 md:grid md:grid-cols-6 md:overflow-visible">
          {tiles.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?cat=${cat.slug}`}
              className="group shrink-0 w-[104px] xs:w-[116px] md:w-auto bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-2.5 sm:p-3 flex flex-col items-center text-center"
            >
              <div className="relative w-full aspect-square max-w-[84px] mb-1.5 overflow-hidden rounded-xl bg-slate-50/70">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="110px"
                  className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <div className="font-bold text-[11px] sm:text-xs text-slate-900 group-hover:text-[#16a34a] transition-colors leading-tight">
                {cat.name}
              </div>
              {cat.comingSoon && (
                <span className="mt-1 text-[9px] font-bold text-[#ea580c] bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  Coming Soon
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
