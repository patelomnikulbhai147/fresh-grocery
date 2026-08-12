"use client";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Heart,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Plus,
  Minus,
  Leaf,
  Share2,
  CheckCircle2,
  Building,
} from "lucide-react";
import type { Product } from "@/data/catalog";
import { formatINR, percentOff, cn } from "@/lib/utils";
import { useCart, useWishlist, useToasts } from "@/store/shop";

export function ProductDetail({ product }: { product: Product }) {
  const [weightIdx, setWeightIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState<"desc" | "nutrition" | "storage" | "reviews">("desc");

  const weight = product.weights[weightIdx];
  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);
  const wishlist = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  const isWished = wishlist.includes(product.id);
  const off = percentOff(weight.mrp, weight.price);

  return (
    <div className="bg-white rounded-3xl border border-purple-100 p-6 md:p-10 shadow-soft">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
            {product.gallery.map((g, i) => (
              <button
                key={g}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition",
                  i === activeImg ? "border-purple-600 ring-2 ring-purple-100" : "border-purple-100 hover:border-purple-300"
                )}
              >
                <Image src={g} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-purple-50 to-amber-50/40 border border-purple-100">
            <Image
              src={product.gallery[activeImg] ?? product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
            />
            {product.organic && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Organic Certified
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-purple-600 font-bold">
              <span>{product.category}</span> · <span>{product.subcategory}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-purple-950 mt-2 text-balance">
              {product.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1 italic">{product.tagline}</p>

            <div className="flex items-center gap-3 mt-4 text-sm">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-950 px-2.5 py-1 rounded-full border border-amber-200 font-bold">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {product.rating.toFixed(1)}
              </div>
              <span className="text-slate-600 text-xs font-medium">based on {product.reviews} reviews</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <div className="font-display text-4xl font-black text-purple-950">{formatINR(weight.price)}</div>
              {weight.mrp > weight.price && (
                <>
                  <div className="text-lg text-slate-400 line-through">{formatINR(weight.mrp)}</div>
                  <div className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                    {off}% OFF
                  </div>
                </>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">Direct Farm Sourced Produce • All Taxes Included</div>

            {/* Weights */}
            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-950 mb-3">Choose pack size</div>
              <div className="flex flex-wrap gap-2">
                {product.weights.map((w, i) => (
                  <button
                    key={w.label}
                    onClick={() => setWeightIdx(i)}
                    className={cn(
                      "relative px-4 py-3 rounded-2xl border text-left transition min-w-[110px]",
                      i === weightIdx
                        ? "border-purple-600 bg-purple-50 ring-2 ring-purple-100 text-purple-950"
                        : "border-purple-100 bg-white hover:border-purple-300 text-slate-700"
                    )}
                  >
                    <div className="text-sm font-bold">{w.label}</div>
                    <div className="text-xs text-purple-700 font-semibold mt-0.5">{formatINR(w.price)}</div>
                    {i === weightIdx && (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-purple-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + CTA */}
            <div className="mt-8 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-white border border-purple-200 rounded-full p-1 shadow-sm">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 grid place-items-center rounded-full hover:bg-purple-50 text-purple-950"
                  aria-label="Decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-10 text-center font-bold text-purple-950">{qty}</div>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 grid place-items-center rounded-full hover:bg-purple-50 text-purple-950"
                  aria-label="Increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  for (let i = 0; i < qty; i++) add(product, weightIdx);
                  push(`${qty} × ${product.name} added`);
                }}
                className="flex-1 min-w-[200px] bg-amber-500 hover:bg-amber-400 text-purple-950 rounded-full py-4 font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95"
              >
                Add to Order · {formatINR(weight.price * qty)}
              </button>

              <button
                onClick={() => {
                  toggle(product.id);
                  push(isWished ? "Removed from wishlist" : "Added to wishlist", "info");
                }}
                className="w-12 h-12 grid place-items-center rounded-full border border-purple-200 hover:border-purple-400 transition text-purple-950"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" fill={isWished ? "currentColor" : "none"} />
              </button>
              <button
                className="w-12 h-12 grid place-items-center rounded-full border border-purple-200 hover:border-purple-400 transition text-purple-950"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Value Badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
            <div className="bg-purple-50 rounded-2xl p-3 flex items-center gap-2 border border-purple-100">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-purple-950">Daily Fresh</div>
                <div className="text-[11px] text-purple-700">Morning farm harvest</div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3 flex items-center gap-2 border border-purple-100">
              <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
              <div>
                <div className="font-bold text-purple-950">Quality Hand-Sorted</div>
                <div className="text-[11px] text-purple-700">Zero compromise</div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3 flex items-center gap-2 border border-purple-100">
              <Building className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <div className="font-bold text-purple-950">Direct Supply</div>
                <div className="text-[11px] text-purple-700">Hostels, Hotels & Shops</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-purple-100">
            <div className="flex gap-6">
              {([
                ["desc", "Description"],
                ["nutrition", "Nutrition"],
                ["storage", "Storage"],
                ["reviews", `Reviews (${product.reviews})`],
              ] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={cn(
                    "py-3 text-xs md:text-sm font-bold border-b-2 -mb-[1px] transition",
                    tab === k ? "border-purple-950 text-purple-950" : "border-transparent text-slate-500 hover:text-purple-900"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-5 text-xs md:text-sm text-slate-600 leading-relaxed">
            {tab === "desc" && (
              <div>
                <p>{product.description}</p>
                <div className="mt-3 space-y-1.5">
                  {product.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-purple-950">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === "nutrition" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {product.nutrition.map((n) => (
                  <div key={n.label} className="bg-purple-50/60 p-3 rounded-xl text-center border border-purple-100">
                    <div className="text-[11px] text-slate-500 font-medium">{n.label}</div>
                    <div className="font-bold text-purple-950 mt-0.5">{n.value}</div>
                  </div>
                ))}
              </div>
            )}
            {tab === "storage" && <p>{product.storage}</p>}
            {tab === "reviews" && (
              <div className="space-y-3">
                <div className="font-bold text-purple-950">Customer & Institutional Feedback</div>
                <p className="text-xs text-slate-500">
                  Rated {product.rating.toFixed(1)}/5.0 by our partner hostel mess managers, chefs, and direct buyers across Gandhinagar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
