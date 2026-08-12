"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { products } from "@/data/catalog";
import { formatINR } from "@/lib/utils";

export function HomepageProduceShowcase() {
  const vegetables = products
    .filter((p) => p.category === "vegetables")
    .slice(0, 6);

  const fruits = products
    .filter((p) => p.category === "fruits")
    .slice(0, 6);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left: Fresh Vegetables Panel */}
          <div className="bg-white rounded-[28px] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-[#067a46] border border-emerald-200/80 grid place-items-center text-xl font-bold">
                    🥦
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-2xl text-slate-900">
                      Fresh Vegetables
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Daily farm-fresh produce at best rates</p>
                  </div>
                </div>

                <Link
                  href="/shop?cat=vegetables"
                  className="inline-flex items-center gap-1.5 text-xs md:text-sm font-extrabold text-[#067a46] hover:text-[#046338] transition bg-white/90 border border-emerald-200 px-4 py-2 rounded-full shadow-sm"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 6 Product Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                {vegetables.map((item) => {
                  const minPrice = item.weights[0]?.price ?? 20;
                  const maxPrice = item.weights[1]?.price ?? Math.round(minPrice * 1.5);
                  return (
                    <Link
                      key={item.id}
                      href={`/product/${item.slug}`}
                      className="group card-option12 p-3 text-center flex flex-col items-center justify-between h-full"
                    >
                      <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-xl">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 40vw, 200px"
                          className="object-contain group-hover:scale-110 transition-transform duration-300 p-2"
                        />
                      </div>
                      <div className="w-full pb-1">
                        <h3 className="font-bold text-sm text-slate-800 group-hover:text-[#067a46] transition-colors truncate">
                          {item.name.split("/")[0].trim()}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Seasonal Fruits Panel */}
          <div className="bg-white rounded-[28px] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100/80 text-amber-700 border border-amber-200/80 grid place-items-center text-xl font-bold">
                    🍊
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-2xl text-slate-900">
                      Seasonal Fruits
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Naturally ripened fresh fruits</p>
                  </div>
                </div>

                <Link
                  href="/shop?cat=fruits"
                  className="inline-flex items-center gap-1.5 text-xs md:text-sm font-extrabold text-[#067a46] hover:text-[#046338] transition bg-white/90 border border-emerald-200 px-4 py-2 rounded-full shadow-sm"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 6 Product Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                {fruits.map((item) => {
                  const minPrice = item.weights[0]?.price ?? 40;
                  const maxPrice = item.weights[1]?.price ?? Math.round(minPrice * 1.6);
                  return (
                    <Link
                      key={item.id}
                      href={`/product/${item.slug}`}
                      className="group card-option12 p-3 text-center flex flex-col items-center justify-between h-full"
                    >
                      <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-xl">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 40vw, 200px"
                          className="object-contain group-hover:scale-110 transition-transform duration-300 p-2"
                        />
                      </div>
                      <div className="w-full pb-1">
                        <h3 className="font-bold text-sm text-slate-800 group-hover:text-[#067a46] transition-colors truncate">
                          {item.name.split("/")[0].trim()}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
