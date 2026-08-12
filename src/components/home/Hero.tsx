"use client";
import Image from "next/image";
import Link from "next/link";
import { Leaf, ShieldCheck, Truck, Tag, Package } from "lucide-react";

const benefits = [
  {
    icon: Leaf,
    title: "Farm Fresh",
    desc: "Directly sourced from trusted farmers",
  },
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    desc: "Carefully selected for the best quality",
  },
  {
    icon: Truck,
    title: "Timely Supply",
    desc: "Reliable and on-time delivery",
  },
  {
    icon: Tag,
    title: "Best Prices",
    desc: "Competitive pricing for your business",
  },
  {
    icon: Package,
    title: "Bulk Orders",
    desc: "Custom orders for all business needs",
  },
];

export function Hero() {
  return (
    <div className="relative">
      {/* Hero Fixed Image Banner */}
      <section className="pt-3 pb-3 md:pt-4 md:pb-4">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <Link href="/where-we-supply" className="block relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-md border border-slate-200/80 group">
            <Image
              src="/images/hero_banner.png"
              alt="Celebrate 15 August with Freshness - FlashKart"
              width={1400}
              height={380}
              priority
              className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </Link>
        </div>
      </section>

      {/* Floating Glass Feature Benefit Strip */}
      <div className="relative z-20 max-w-[1400px] mx-auto px-4 md:px-8 pb-10">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/80 shadow-lg p-5 md:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          {benefits.map((b, idx) => (
            <div key={b.title} className={`flex items-center gap-4 ${idx > 0 ? "lg:pl-6 pt-4 sm:pt-0" : ""}`}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50/90 text-[#067a46] border border-emerald-100/90 flex items-center justify-center shrink-0 shadow-sm p-3">
                <b.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-display font-extrabold text-base text-[#0f172a]">{b.title}</div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
