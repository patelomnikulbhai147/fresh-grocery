"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Star,
  Heart,
  ShieldCheck,
  Sparkles,
  Plus,
  Minus,
  Leaf,
  Share2,
  CheckCircle2,
  Building,
  ImageOff,
} from "lucide-react";
import { variantAvailable, maxPacksAvailable, type Product } from "@/data/catalog";
import { formatINR, formatWeight, percentOff, cn } from "@/lib/utils";
import { useCart, useWishlist, useToasts } from "@/store/shop";
import { useLiveProduct } from "@/lib/useLiveProduct";

export function ProductDetail({ product: staticProduct }: { product: Product }) {
  // Live admin-managed data (images, price, pack sizes, stock) — updates
  // immediately when changed from the Admin panel; catalog is the fallback.
  const product = useLiveProduct(staticProduct);

  const [weightIdx, setWeightIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  // Natural aspect ratio of the current image; the container adapts to it
  // (clamped) so the photo fills edge-to-edge without blank strips or heavy crops.
  const [imgRatio, setImgRatio] = useState(1);
  const displayRatio = Math.min(1.5, Math.max(0.75, imgRatio));
  const [tab, setTab] = useState<"desc" | "nutrition" | "storage" | "reviews">("desc");

  // Purchase options: only active variants, in admin-defined order (array order).
  // Selection stores the ORIGINAL weights index so the cart maps correctly.
  const purchaseOptions = product.weights
    .map((w, i) => ({ w, i }))
    .filter((x) => x.w.active !== false);
  const selected = purchaseOptions.find((x) => x.i === weightIdx) ?? purchaseOptions[0];
  const safeWeightIdx = selected?.i ?? 0;
  const weight = selected?.w ?? product.weights[0] ?? { label: "", grams: 0, price: 0, mrp: 0 };
  const safeImgIdx = Math.max(0, Math.min(activeImg, product.gallery.length - 1));
  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);
  const wishlist = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  const isWished = wishlist.includes(product.id);
  const off = percentOff(weight.mrp, weight.price);
  // Weight-based availability: all pack sizes share the product's physical stock
  // (stockGrams); a pack is orderable while enough grams remain for it.
  const inStock = purchaseOptions.length > 0 && variantAvailable(product, weight);
  // Max packs of the selected size the remaining physical stock can fulfil
  const maxQty = Math.max(1, maxPacksAvailable(product, weight));
  const hasThumbs = product.gallery.length > 1;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: `${product.name} · FlashKart`, url });
      } else {
        await navigator.clipboard.writeText(url);
        push("Product link copied to clipboard", "info");
      }
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-xs text-[#067a46] font-bold mb-4">
        <Link href="/" className="hover:text-[#046338]">Home</Link>
        <span className="text-slate-400 mx-1.5">/</span>
        <Link href="/shop" className="hover:text-[#046338]">Fresh Produce</Link>
        <span className="text-slate-400 mx-1.5">/</span>
        <span className="text-slate-600 font-semibold">{product.name}</span>
      </div>

      {/* Main purchase card */}
      <div className="bg-white rounded-[18px] border border-slate-100 shadow-sm p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

          {/* ── Gallery (45%) ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
            <div className={cn("flex gap-3", hasThumbs ? "flex-col-reverse md:flex-row" : "")}>
              {hasThumbs && (
                <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-visible scrollbar-hide shrink-0">
                  {product.gallery.map((g, i) => (
                    <button
                      key={`${g}-${i}`}
                      type="button"
                      onClick={() => { setActiveImg(i); setImgFailed(false); }}
                      aria-label={`View image ${i + 1}`}
                      className={cn(
                        "relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition bg-slate-50",
                        i === safeImgIdx
                          ? "border-[#067a46] ring-2 ring-emerald-100"
                          : "border-slate-100 hover:border-slate-300"
                      )}
                    >
                      <Image src={g} alt="" fill sizes="64px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image — container adapts to the photo's natural ratio so the
                  product fills the box corner-to-corner (no blank strips, no
                  meaningful crop; clamp keeps extreme ratios sensible) */}
              <div
                className="relative flex-1 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100"
                style={{ aspectRatio: `${displayRatio}` }}
              >
                {imgFailed ? (
                  <div className="absolute inset-0 grid place-items-center text-slate-400">
                    <div className="text-center">
                      <ImageOff className="w-10 h-10 mx-auto mb-2" />
                      <div className="text-xs font-semibold">Image unavailable</div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={product.gallery[safeImgIdx] ?? product.image}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 520px"
                    className="object-cover object-center"
                    onLoad={(e) => {
                      const el = e.currentTarget;
                      if (el.naturalWidth > 0 && el.naturalHeight > 0) {
                        setImgRatio(el.naturalWidth / el.naturalHeight);
                      }
                    }}
                    onError={() => setImgFailed(true)}
                    unoptimized
                  />
                )}
                {product.organic && (
                  <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur text-emerald-900 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Organic Certified
                  </div>
                )}
                {off > 0 && (
                  <div className="absolute top-3 right-3 z-10 bg-[#ea580c] text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm">
                    {off}% OFF
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Info (55%) ── */}
          <div className="lg:col-span-7">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
              {product.category} · {product.subcategory}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl md:text-[2.1rem] leading-tight font-extrabold text-slate-900 mt-1.5 text-balance line-clamp-2">
              {product.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1 italic">{product.tagline}</p>

            <div className="flex items-center gap-3 mt-3 text-sm">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-950 px-2.5 py-1 rounded-full border border-amber-200 font-bold text-xs">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {product.rating.toFixed(1)}
              </div>
              <span className="text-slate-600 text-xs font-medium">{product.reviews} reviews</span>
              <span
                className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-full border",
                  inStock
                    ? "text-[#067a46] bg-emerald-50 border-emerald-200"
                    : "text-rose-600 bg-rose-50 border-rose-200"
                )}
              >
                {inStock ? "In Stock" : "Currently unavailable"}
              </span>
              {product.stockGrams !== undefined && product.stockGrams > 0 && (
                <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                  Available: {formatWeight(product.stockGrams)}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3 flex-wrap">
              <div className="font-display text-3xl sm:text-4xl font-black text-slate-900">{formatINR(weight.price)}</div>
              {weight.mrp > weight.price && (
                <>
                  <div className="text-base sm:text-lg text-slate-400 line-through">{formatINR(weight.mrp)}</div>
                  <div className="text-xs font-bold text-[#ea580c] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                    {off}% OFF
                  </div>
                </>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">Direct Farm Sourced Produce · All Taxes Included</div>

            {/* Pack size (existing selection logic) */}
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Choose pack size</div>
              <div className="flex flex-wrap gap-2">
                {purchaseOptions.length === 0 && (
                  <span className="text-xs font-bold text-rose-600">Currently unavailable</span>
                )}
                {purchaseOptions.map(({ w, i }) => {
                  const variantOut = !variantAvailable(product, w);
                  return (
                    <button
                      key={`${w.label}-${i}`}
                      type="button"
                      disabled={variantOut}
                      onClick={() => setWeightIdx(i)}
                      className={cn(
                        "relative px-3.5 py-2.5 rounded-xl border text-left transition min-w-[96px]",
                        variantOut && "opacity-45 cursor-not-allowed",
                        i === safeWeightIdx
                          ? "border-[#067a46] bg-emerald-50 ring-2 ring-emerald-100 text-slate-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      )}
                    >
                      <div className="text-sm font-bold">{w.label}</div>
                      <div className="text-xs text-[#067a46] font-semibold mt-0.5">{formatINR(w.price)}</div>
                      {variantOut && (
                        <div className="text-[9px] font-black text-rose-500 uppercase">Out of stock</div>
                      )}
                      {i === safeWeightIdx && (
                        <CheckCircle2 className="absolute top-1.5 right-1.5 w-4 h-4 text-[#067a46]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Qty + CTA (existing cart logic) */}
            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 grid place-items-center rounded-full hover:bg-slate-50 text-slate-800"
                  aria-label="Decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-10 text-center font-bold text-slate-900">{qty}</div>
                <button
                  onClick={() => {
                    if (qty >= maxQty) {
                      push(
                        `Only ${formatWeight(product.stockGrams ?? 0)} available — max ${maxQty} × ${weight.label}`,
                        "info"
                      );
                      return;
                    }
                    setQty(qty + 1);
                  }}
                  className="w-10 h-10 grid place-items-center rounded-full hover:bg-slate-50 text-slate-800"
                  aria-label="Increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  // Cap at available stock (qty may exceed it after switching variants)
                  const buyQty = Math.min(qty, maxQty);
                  for (let i = 0; i < buyQty; i++) add(product, safeWeightIdx);
                  push(`${buyQty} × ${product.name} added`);
                }}
                disabled={!inStock}
                className="flex-1 min-w-[190px] max-w-md bg-[#067a46] hover:bg-[#046338] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full py-3.5 font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95"
              >
                Add to Cart · {formatINR(weight.price * qty)}
              </button>

              <button
                onClick={() => {
                  toggle(product.id);
                  push(isWished ? "Removed from wishlist" : "Added to wishlist", "info");
                }}
                className="w-11 h-11 grid place-items-center rounded-full border border-slate-200 hover:border-rose-500 hover:text-rose-500 transition text-slate-400"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" fill={isWished ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleShare}
                className="w-11 h-11 grid place-items-center rounded-full border border-slate-200 hover:border-[#067a46] hover:text-[#067a46] transition text-slate-400"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Benefit cards — compact horizontal row */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5 border border-slate-100">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Daily Fresh</div>
                  <div className="text-[11px] text-slate-500">Morning farm harvest</div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5 border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Quality Hand-Sorted</div>
                  <div className="text-[11px] text-slate-500">Zero compromise</div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5 border border-slate-100">
                <Building className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Direct Supply</div>
                  <div className="text-[11px] text-slate-500">Hostels, Hotels & Shops</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Full-width details tabs below both columns ── */}
        <div className="mt-8 border-t border-slate-100 pt-2">
          <div className="border-b border-slate-100">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
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
                    "py-3 text-xs md:text-sm font-bold border-b-2 -mb-[1px] transition shrink-0",
                    tab === k ? "border-[#067a46] text-[#067a46]" : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-5 text-xs md:text-sm text-slate-600 leading-relaxed max-w-3xl">
            {tab === "desc" && (
              <div>
                <p>{product.description}</p>
                <div className="mt-3 space-y-1.5">
                  {product.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-900">
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
                  <div key={n.label} className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                    <div className="text-[11px] text-slate-500 font-medium">{n.label}</div>
                    <div className="font-bold text-slate-900 mt-0.5">{n.value}</div>
                  </div>
                ))}
              </div>
            )}
            {tab === "storage" && <p>{product.storage}</p>}
            {tab === "reviews" && (
              <div className="space-y-3">
                <div className="font-bold text-slate-900">Customer & Institutional Feedback</div>
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
