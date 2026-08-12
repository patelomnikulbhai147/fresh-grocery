"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { vegetableProducts, fruitProducts } from "@/data/catalog";

const vegItems = [
  { name: "Tomato", price: "₹20 - ₹30 / kg", image: "/images/products/tomato.jpg", slug: "tomato" },
  { name: "Potato", price: "₹18 - ₹25 / kg", image: "/images/products/potato.jpg", slug: "potato" },
  { name: "Onion", price: "₹20 - ₹28 / kg", image: "/images/products/onion.jpg", slug: "onion" },
  { name: "Carrot", price: "₹25 - ₹35 / kg", image: "/images/products/carrot.jpg", slug: "carrot" },
  { name: "Capsicum", price: "₹30 - ₹45 / kg", image: "/images/products/capsicum.jpg", slug: "capsicum" },
  { name: "Cabbage", price: "₹15 - ₹20 / kg", image: "/images/products/cabbage.jpg", slug: "cabbage" },
];

const fruitItems = [
  { name: "Banana", price: "₹25 - ₹35 / kg", image: "/images/products/banana.jpg", slug: "banana" },
  { name: "Apple", price: "₹120 - ₹180 / kg", image: "/images/products/apple.jpg", slug: "apple" },
  { name: "Grapes", price: "₹80 - ₹120 / kg", image: "/images/products/grapes.jpg", slug: "grapes" },
  { name: "Mango", price: "₹60 - ₹100 / kg", image: "/images/products/mango.jpg", slug: "mango" },
  { name: "Watermelon", price: "₹20 - ₹30 / kg", image: "/images/products/watermelon.jpg", slug: "watermelon" },
  { name: "Papaya", price: "₹30 - ₹50 / kg", image: "/images/products/papaya.jpg", slug: "papaya" },
];

export function HomepageProduceShowcase() {
  return (
    <section className="py-12 md:py-16 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* Left: Fresh Vegetables Showcase */}
          <div className="bg-slate-50/60 rounded-3xl p-5 md:p-6 border border-slate-200/80">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 font-display font-extrabold text-xl text-slate-900">
                <span className="text-xl">🥦</span>
                <span>Fresh Vegetables</span>
              </div>
              <Link
                href="/shop?cat=vegetables"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#067a46] hover:underline"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {vegItems.map((item) => (
                <Link
                  key={item.name}
                  href={`/product/${item.slug}`}
                  className="group bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm hover:shadow-md transition text-center flex flex-col items-center justify-between"
                >
                  <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-xl bg-slate-50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 33vw, 150px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-slate-900 group-hover:text-[#067a46] transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {item.price}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Seasonal Fruits Showcase */}
          <div className="bg-slate-50/60 rounded-3xl p-5 md:p-6 border border-slate-200/80">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 font-display font-extrabold text-xl text-slate-900">
                <span className="text-xl">🍊</span>
                <span>Seasonal Fruits</span>
              </div>
              <Link
                href="/shop?cat=fruits"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#067a46] hover:underline"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {fruitItems.map((item) => (
                <Link
                  key={item.name}
                  href={`/product/${item.slug}`}
                  className="group bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm hover:shadow-md transition text-center flex flex-col items-center justify-between"
                >
                  <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-xl bg-slate-50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 33vw, 150px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-slate-900 group-hover:text-[#067a46] transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {item.price}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
