"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Flame, Minus, Plus, ShoppingCart } from "lucide-react";
import { products, variantAvailable, type Product } from "@/data/catalog";
import { useCart, useToasts } from "@/store/shop";
import { ProductImage } from "@/components/ui/ProductImage";
import { useLiveProduct } from "@/lib/useLiveProduct";

/** Compact commerce product card driven entirely by live admin-managed data. */
export function HomeProductCard({ product: staticProduct, showDiscount = false }: { product: Product; showDiscount?: boolean }) {
  const product = useLiveProduct(staticProduct);
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const pushToast = useToasts((s) => s.push);

  // First ACTIVE variant (original index preserved for the cart)
  const firstActiveIdx = product.weights.findIndex((x) => x.active !== false);
  const wIdx = firstActiveIdx === -1 ? 0 : firstActiveIdx;
  const w = product.weights[wIdx];
  // Weight-based: orderable while the shared physical stock covers this pack's weight
  const inStock = firstActiveIdx !== -1 && variantAvailable(product, w);
  const hasDiscount = w.mrp > w.price;
  const discountPct = hasDiscount ? Math.round(((w.mrp - w.price) / w.mrp) * 100) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    for (let i = 0; i < qty; i++) add(product, wIdx, "instant");
    pushToast(`Added ${qty} × ${product.name} (${w.label}) to cart`);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col justify-between h-full">
      <Link href={`/product/${product.slug}`} className="flex flex-col w-full">
        <div className="relative w-full aspect-[5/4] bg-slate-50 overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.name}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
            containPadding="p-2"
            hoverZoom
          />
          {showDiscount && hasDiscount && (
            <span className="absolute top-2 left-2 z-10 bg-[#ea580c] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              {discountPct}% OFF
            </span>
          )}
          {!inStock && (
            <span className="absolute inset-0 z-10 bg-white/70 grid place-items-center text-xs font-extrabold text-slate-600 uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>

        <div className="px-2.5 pt-2 pb-1 text-left sm:px-3">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#16a34a] transition-colors truncate">
            {product.name}
          </h3>
          <div className="text-[10px] font-semibold text-slate-400">{w.label}</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm sm:text-base font-extrabold text-[#2b1a4e]">₹{w.price}</span>
            {showDiscount && hasDiscount && (
              <span className="text-[11px] font-semibold text-slate-400 line-through">₹{w.mrp}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3 pt-1 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full p-0.5">
          <button
            onClick={(e) => { e.preventDefault(); setQty((q) => Math.max(1, q - 1)); }}
            className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:border-emerald-300 active:scale-95 transition shrink-0"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-[11px] font-bold text-slate-800 min-w-[18px] text-center">{qty}</span>
          <button
            onClick={(e) => { e.preventDefault(); setQty((q) => q + 1); }}
            className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:border-emerald-300 active:scale-95 transition shrink-0"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={!inStock}
          className="bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-bold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition shadow-sm shrink-0"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}

function useMidnightCountdown() {
  const [remaining, setRemaining] = useState<{ h: string; m: string; s: string } | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return remaining;
}

export function DealsOfTheDay() {
  const remaining = useMidnightCountdown();

  // Real discounts only: products whose configured MRP is above selling price
  const deals = products
    .filter((p) => p.weights[0] && p.weights[0].mrp > p.weights[0].price && p.stock > 0)
    .sort((a, b) => {
      const da = (a.weights[0].mrp - a.weights[0].price) / a.weights[0].mrp;
      const db = (b.weights[0].mrp - b.weights[0].price) / b.weights[0].mrp;
      return db - da;
    })
    .slice(0, 6);

  if (deals.length === 0) return null;

  return (
    <section className="py-4 sm:py-6">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="bg-[#fff4ec] rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 border border-orange-100 shadow-sm">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4 sm:mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-white text-[#ea580c] border border-orange-200 grid place-items-center shrink-0">
                <Flame className="w-4.5 h-4.5" />
              </span>
              <div>
                <h2 className="font-display font-extrabold text-lg sm:text-xl md:text-2xl text-[#2b1a4e] leading-tight">
                  Deals of the Day
                </h2>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Grab the best offers before the day is gone!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {remaining && (
                <div className="flex items-center gap-1" aria-label="Deal time remaining today">
                  {[remaining.h, remaining.m, remaining.s].map((v, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="bg-[#2b1a4e] text-white font-mono font-bold text-xs sm:text-sm px-2 py-1 rounded-lg min-w-[32px] text-center">
                        {v}
                      </span>
                      {i < 2 && <span className="text-[#2b1a4e] font-bold">:</span>}
                    </span>
                  ))}
                </div>
              )}
              <Link
                href="/shop"
                className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-[11px] sm:text-xs px-3.5 py-2 rounded-lg transition shrink-0"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {deals.map((p) => (
              <HomeProductCard key={p.id} product={p} showDiscount />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BestSellers() {
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 6);
  if (bestSellers.length === 0) return null;

  return (
    <section className="py-4 sm:py-6">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="font-display font-extrabold text-lg sm:text-xl md:text-2xl text-[#2b1a4e]">
            Best Selling Products
          </h2>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-[#16a34a] hover:text-[#15803d] transition shrink-0"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {bestSellers.map((p) => (
            <HomeProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
