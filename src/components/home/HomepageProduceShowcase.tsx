"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf } from "lucide-react";
import { products } from "@/data/catalog";

const vegetableItems = [
  { name: "Tomato", slug: "fresh-tomato", priceRange: "₹20 - ₹30 / kg", fallbackImg: "/images/products/tomato.png", catId: "v-tomato" },
  { name: "Potato", slug: "potato", priceRange: "₹18 - ₹25 / kg", fallbackImg: "/images/products/potato.png", catId: "v-potato" },
  { name: "Onion", slug: "onion", priceRange: "₹20 - ₹25 / kg", fallbackImg: "/images/products/onion.png", catId: "v-onion" },
  { name: "Carrot", slug: "carrot", priceRange: "₹25 - ₹35 / kg", fallbackImg: "/images/products/carrot.png", catId: "v-carrot" },
  { name: "Capsicum", slug: "capsicum", priceRange: "₹30 - ₹45 / kg", fallbackImg: "/images/products/capsicum.png", catId: "v-capsicum" },
  { name: "Cabbage", slug: "cabbage", priceRange: "₹15 - ₹20 / kg", fallbackImg: "/images/products/cabbage.png", catId: "v-cabbage" },
];

const fruitItems = [
  { name: "Banana", slug: "banana", priceRange: "₹25 - ₹35 / kg", fallbackImg: "/images/products/banana.png", catId: "f-banana" },
  { name: "Apple", slug: "apple", priceRange: "₹120 - ₹180 / kg", fallbackImg: "/images/products/apple.png", catId: "f-apple" },
  { name: "Grapes", slug: "grapes", priceRange: "₹80 - ₹120 / kg", fallbackImg: "/images/products/grapes.png", catId: "f-grapes" },
  { name: "Mango", slug: "mango", priceRange: "₹60 - ₹100 / kg", fallbackImg: "/images/products/mango.png", catId: "f-mango" },
  { name: "Watermelon", slug: "watermelon", priceRange: "₹20 - ₹30 / kg", fallbackImg: "/images/products/watermelon.png", catId: "f-watermelon" },
  { name: "Papaya", slug: "papaya", priceRange: "₹30 - ₹50 / kg", fallbackImg: "/images/products/papaya.png", catId: "f-papaya" },
];

export function HomepageProduceShowcase() {
  return (
    <section className="py-6 sm:py-8 md:py-10">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Left: Fresh Vegetables Panel */}
          <div className="bg-white rounded-[24px] md:rounded-[28px] p-5 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header row */}
              <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-[#067a46] border border-emerald-200/60 grid place-items-center shrink-0">
                    <Leaf className="w-5 h-5 text-[#067a46]" />
                  </div>
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
                    Fresh Vegetables
                  </h2>
                </div>

                <Link
                  href="/shop?cat=vegetables"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#067a46] hover:text-[#046338] transition hover:translate-x-0.5 duration-200"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 6 Vegetable Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3 sm:gap-3.5">
                {vegetableItems.map((item) => {
                  const catProduct = products.find((p) => p.id === item.catId || p.slug.includes(item.slug));
                  const imgSrc = catProduct?.image || item.fallbackImg;

                  return (
                    <Link
                      key={item.name}
                      href={`/product/${catProduct?.slug || item.slug}`}
                      className="group bg-slate-50/60 hover:bg-white rounded-2xl p-2.5 sm:p-3 text-center border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-between"
                    >
                      <div className="relative w-full aspect-square mb-1.5 overflow-hidden rounded-xl">
                        <Image
                          src={imgSrc}
                          alt={item.name}
                          fill
                          sizes="120px"
                          className="object-contain group-hover:scale-105 transition-transform duration-300 p-1"
                          unoptimized
                        />
                      </div>
                      <div className="w-full">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#067a46] transition-colors truncate">
                          {item.name}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
                          {item.priceRange}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Seasonal Fruits Panel */}
          <div className="bg-white rounded-[24px] md:rounded-[28px] p-5 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header row */}
              <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-600 border border-amber-200/60 grid place-items-center shrink-0 text-lg font-bold">
                    🍊
                  </div>
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
                    Seasonal Fruits
                  </h2>
                </div>

                <Link
                  href="/shop?cat=fruits"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#067a46] hover:text-[#046338] transition hover:translate-x-0.5 duration-200"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 6 Fruit Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3 sm:gap-3.5">
                {fruitItems.map((item) => {
                  const catProduct = products.find((p) => p.id === item.catId || p.slug.includes(item.slug));
                  const imgSrc = catProduct?.image || item.fallbackImg;

                  return (
                    <Link
                      key={item.name}
                      href={`/product/${catProduct?.slug || item.slug}`}
                      className="group bg-slate-50/60 hover:bg-white rounded-2xl p-2.5 sm:p-3 text-center border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-between"
                    >
                      <div className="relative w-full aspect-square mb-1.5 overflow-hidden rounded-xl">
                        <Image
                          src={imgSrc}
                          alt={item.name}
                          fill
                          sizes="120px"
                          className="object-contain group-hover:scale-105 transition-transform duration-300 p-1"
                          unoptimized
                        />
                      </div>
                      <div className="w-full">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#067a46] transition-colors truncate">
                          {item.name}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
                          {item.priceRange}
                        </p>
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
