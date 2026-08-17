"use client";
import Image from "next/image";
import Link from "next/link";
import { Zap, Building2, Timer, Tag, ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { PincodeDeliveryCard } from "@/components/home/PincodeDeliveryCard";

const trustItems = [
  { icon: Timer, title: "10 Min", sub: "Express Delivery" },
  { icon: Tag, title: "Best Prices", sub: "Everyday" },
  { icon: ShieldCheck, title: "Fresh & Quality", sub: "Guaranteed" },
  { icon: Lock, title: "Secure Payment", sub: "100% Safe" },
];

export function Hero() {
  return (
    <div className="relative w-full bg-white rb-hero-glass">
      <section className="relative w-full overflow-hidden border-b border-slate-100 pt-6 sm:pt-8 lg:pt-10 pb-6 sm:pb-8">
        <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

            {/* Left: Headline + two service cards */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div>
                <h1 className="font-display text-3xl xs:text-[2.1rem] sm:text-4xl lg:text-[2.75rem] leading-[1.15] font-extrabold">
                  <span className="text-[#2b1a4e]">Two Ways to Shop.</span>
                  <br />
                  <span className="text-[#ea580c]">One Trusted Partner.</span>
                </h1>
                <p className="text-slate-600 text-sm sm:text-base font-medium mt-2.5">
                  Instant delivery for <span className="text-[#16a34a] font-bold">your home</span>.
                  Bulk supply for <span className="text-[#2b1a4e] font-bold">your business</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3.5 sm:gap-4">
                {/* FlashKart NOW card */}
                <div className="bg-[#2b1a4e] rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-8 h-8 rounded-lg bg-white/10 grid place-items-center">
                        <Zap className="w-4.5 h-4.5 text-[#fb923c]" />
                      </span>
                      <div className="font-display font-extrabold text-base sm:text-lg leading-none">
                        FlashKart <span className="text-[#fb923c]">NOW</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                      Instant Delivery
                    </div>
                    <p className="text-xs text-purple-100/80 font-medium mt-1.5 leading-snug">
                      Groceries & daily essentials delivered fast to your doorstep.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/shop"
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-white text-[#2b1a4e] font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl hover:bg-purple-50 transition active:scale-[0.98]"
                    >
                      <span>Shop Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <div className="text-[10px] text-purple-200/80 font-semibold text-center mt-2 tracking-wide">
                      Fast · Fresh · Reliable
                    </div>
                  </div>
                </div>

                {/* FlashKart BUSINESS card */}
                <div className="bg-[#14532d] rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-8 h-8 rounded-lg bg-white/10 grid place-items-center">
                        <Building2 className="w-4.5 h-4.5 text-[#86efac]" />
                      </span>
                      <div className="font-display font-extrabold text-base sm:text-lg leading-none">
                        FlashKart <span className="text-[#86efac]">BUSINESS</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                      Bulk Delivery
                    </div>
                    <p className="text-xs text-emerald-100/80 font-medium mt-1.5 leading-snug">
                      Bulk groceries for hotels, restaurants, hostels & more.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/bulk"
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-white text-[#14532d] font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl hover:bg-emerald-50 transition active:scale-[0.98]"
                    >
                      <span>Order in Bulk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <div className="text-[10px] text-emerald-200/80 font-semibold text-center mt-2 tracking-wide">
                      Better Price · Better Service
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Fresh produce imagery */}
            <div className="lg:col-span-5 relative flex items-center justify-center w-full min-h-0 sm:min-h-[300px] lg:min-h-[360px]">
              <div className="relative w-full max-w-[420px] lg:max-w-[500px] aspect-[4/3] flex items-center justify-center">
                <Image
                  src="/images/hero_produce_basket.png"
                  alt="Fresh vegetables and fruits basket"
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {trustItems.map((t) => (
              <div
                key={t.title}
                className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-3.5 py-3 shadow-2xs"
              >
                <span className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 text-[#16a34a] grid place-items-center shrink-0">
                  <t.icon className="w-4.5 h-4.5" />
                </span>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight truncate">
                    {t.title}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">
                    {t.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery availability checker (existing pincode logic) */}
          <div className="mt-6 sm:mt-8">
            <PincodeDeliveryCard />
          </div>
        </div>
      </section>
    </div>
  );
}
