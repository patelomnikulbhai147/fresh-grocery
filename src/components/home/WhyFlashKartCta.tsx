"use client";

import Link from "next/link";
import { Leaf, Zap, Tag, Truck, ShieldCheck, Building2, ArrowRight, Percent } from "lucide-react";

const pillars = [
  { icon: Leaf, title: "Freshness", desc: "Sourced daily from trusted regional farms" },
  { icon: Zap, title: "Speed", desc: "Fast doorstep delivery in serviceable areas" },
  { icon: Tag, title: "Competitive Pricing", desc: "Fair rates by cutting the middlemen" },
  { icon: Truck, title: "Reliable Supply", desc: "Consistent quality for homes & businesses" },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Safe checkout and transparent billing" },
];

/** Promo banners — only genuinely configured offers (FRESH20 exists in the coupon system). */
export function PromoBanners() {
  return (
    <section className="py-4 sm:py-6">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Real coupon: FRESH20 (20% off first order, min cart ₹499) */}
          <div className="relative overflow-hidden bg-[#2b1a4e] rounded-2xl p-5 sm:p-6 text-white shadow-md">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ea580c]/25 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-orange-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                <Percent className="w-3 h-3" /> First Order Offer
              </div>
              <div className="font-display font-extrabold text-xl sm:text-2xl leading-tight">
                20% OFF Your First Order
              </div>
              <p className="text-purple-100/80 text-xs font-semibold mt-1">
                Use code <span className="bg-white/15 border border-white/25 px-2 py-0.5 rounded font-mono font-bold text-white">FRESH20</span> on orders above ₹499
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 bg-white text-[#2b1a4e] font-extrabold text-xs px-4 py-2 rounded-lg mt-3.5 hover:bg-purple-50 transition"
              >
                Order Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Business value banner */}
          <div className="relative overflow-hidden bg-[#14532d] rounded-2xl p-5 sm:p-6 text-white shadow-md">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                <Building2 className="w-3 h-3" /> FlashKart Business
              </div>
              <div className="font-display font-extrabold text-xl sm:text-2xl leading-tight">
                Wholesale Prices for Businesses
              </div>
              <p className="text-emerald-100/80 text-xs font-semibold mt-1">
                Tiered bulk pricing & scheduled supply for hotels, hostels, PGs & shops
              </p>
              <Link
                href="/bulk"
                className="inline-flex items-center gap-1.5 bg-white text-[#14532d] font-extrabold text-xs px-4 py-2 rounded-lg mt-3.5 hover:bg-emerald-50 transition"
              >
                Order in Bulk <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyFlashKart() {
  return (
    <section className="py-6 sm:py-8">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#2b1a4e]">
            Why FlashKart?
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Built for everyday freshness — trusted by homes and businesses
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 shadow-2xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col items-center text-center"
            >
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-[#067a46] border border-emerald-100 grid place-items-center mb-2.5">
                <p.icon className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">{p.title}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BusinessCta() {
  return (
    <section className="py-6 sm:py-8">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="bg-[#14532d] rounded-2xl px-5 py-5 sm:px-8 sm:py-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-emerald-200 grid place-items-center shrink-0">
              <Building2 className="w-5.5 h-5.5" />
            </span>
            <div>
              <div className="font-display font-extrabold text-lg sm:text-xl text-white leading-tight">
                Want to order in bulk for your business?
              </div>
              <p className="text-emerald-100/80 text-xs sm:text-sm font-semibold mt-0.5">
                Get better prices, priority delivery and scheduled supply.
              </p>
            </div>
          </div>
          <Link
            href="/bulk"
            className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-[#14532d] font-extrabold px-6 py-3 rounded-xl text-sm transition shadow-sm active:scale-[0.98] shrink-0 w-full sm:w-auto justify-center"
          >
            <span>Go to Business</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
