"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, Minus, Star, Leaf as LeafIcon, Package, Sparkles, Building, Store } from "lucide-react";
import type { DeliveryMode, Product } from "@/data/catalog";
import { cn, formatINR, percentOff } from "@/lib/utils";
import { useCart, useWishlist, useToasts } from "@/store/shop";
import { useCustomerAuth } from "@/store/customerAuth";
import { useAdminStore } from "@/store/adminStore";
import { isCategoryComingSoon } from "@/lib/categoryHelper";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [weightIdx, setWeightIdx] = useState(0);
  const [mode, setMode] = useState<DeliveryMode>(product.modes[0] ?? "instant");
  const weight = product.weights[weightIdx];
  const add = useCart((s) => s.add);
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const wishlist = useWishlist((s) => s.ids);
  const toggleWish = useWishlist((s) => s.toggle);
  const push = useToasts((s) => s.push);
  const { isAuthenticated, openLoginModal } = useCustomerAuth();
  const adminCategories = useAdminStore((s) => s.categories);
  const isComingSoon = isCategoryComingSoon(product.category, adminCategories);

  // price depends on mode
  let price = weight.price;
  let mrp = weight.mrp;
  if (mode === "bulk" && weight.bulk) {
    price = weight.bulk.unit;
    mrp = Math.round(weight.bulk.unit / (1 - weight.bulk.discount / 100));
  } else if (mode === "subscription" && weight.subscription) {
    price = weight.subscription;
  }

  const inCart = items.find(
    (i) => i.productId === product.id && i.weight === weight.label && i.mode === mode
  );
  const isWished = wishlist.includes(product.id);
  const off = percentOff(mrp, price);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35 }}
      className="group relative card-option12 hover:border-[#067a46]/30 overflow-hidden flex flex-col"
    >
      {/* Image Container */}
      <div className="relative block aspect-[5/4] overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/30">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0 p-4">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
            className="object-contain transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
          />
        </Link>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {off > 0 && (
            <span className="inline-flex items-center gap-1 bg-[#ea580c] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
              {off}% OFF
            </span>
          )}
          {product.organic && (
            <span className="inline-flex items-center gap-1 bg-white/95 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shadow-sm">
              <LeafIcon className="w-3 h-3 text-emerald-600" /> Organic
            </span>
          )}
          {product.newArrival && (
            <span className="inline-flex items-center gap-1 bg-[#067a46] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Seasonal
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (isAuthenticated) {
              toggleWish(product.id);
              push(isWished ? "Removed from wishlist" : "Added to wishlist", "info");
            } else {
              openLoginModal(null, { type: "wishlist", payload: { productId: product.id } });
            }
          }}
          aria-label="Wishlist"
          className={cn(
            "absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full backdrop-blur transition z-10 shadow-sm",
            isWished ? "bg-rose-500 text-white" : "bg-white text-slate-400 hover:text-rose-500"
          )}
        >
          <Heart className="w-3.5 h-3.5" fill={isWished ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Mode pills */}
        <div className="flex flex-wrap gap-1">
          {product.modes.map((m) => {
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border flex items-center gap-1 transition",
                  m === mode
                    ? m === "instant"
                      ? "bg-[#067a46] text-white border-[#067a46]"
                      : m === "bulk"
                      ? "bg-[#ea580c] text-white border-[#ea580c] font-extrabold"
                      : "bg-emerald-700 text-white border-emerald-700"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                )}
              >
                {m === "instant" ? "Direct" : m === "bulk" ? "Wholesale" : "Supply"}
              </button>
            );
          })}
        </div>

        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{product.subcategory}</div>
        <Link href={`/product/${product.slug}`} className="font-display text-[16px] leading-snug font-bold text-slate-800 hover:text-[#067a46] line-clamp-2">
          {product.name}
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-700">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 text-[11px]">{product.reviews} reviews</span>
        </div>

        {/* Weight selector */}
        {product.weights.length > 1 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {product.weights.map((w, i) => (
              <button
                key={w.label}
                onClick={() => setWeightIdx(i)}
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border transition",
                  i === weightIdx
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                )}
              >
                {w.label}
              </button>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-3 flex items-end justify-between gap-2 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-2">
              <div className="font-display text-lg font-black text-slate-800">{formatINR(price)}</div>
              {mrp > price && (
                <div className="text-xs text-slate-400 line-through">{formatINR(mrp)}</div>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 font-medium">
              {mode === "instant" && <><Sparkles className="w-3 h-3 text-[#ea580c]" /> Direct Farm Fresh</>}
              {mode === "bulk" && <><Package className="w-3 h-3 text-slate-600" /> MOQ {weight.bulk?.moq} units</>}
              {mode === "subscription" && <><Building className="w-3 h-3 text-emerald-600" /> Regular Supply</>}
            </div>
          </div>

          {!inCart ? (
            <button
              onClick={() => {
                add(product, weightIdx, mode);
                push(`${product.name} added to order`);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-lg bg-[#067a46] hover:bg-[#046338] text-white transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-[#067a46] text-white rounded-lg p-1">
              <button
                onClick={() => updateQty(product.id, weight.label, mode, inCart.quantity - 1)}
                className="w-6 h-6 grid place-items-center rounded bg-white/20 hover:bg-white/30"
                aria-label="Decrease"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-bold">{inCart.quantity}</span>
              <button
                onClick={() => updateQty(product.id, weight.label, mode, inCart.quantity + 1)}
                className="w-6 h-6 grid place-items-center rounded bg-white/20 hover:bg-white/30"
                aria-label="Increase"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
