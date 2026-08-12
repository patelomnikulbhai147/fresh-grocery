"use client";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Clock, Tag, Package, Sprout, Award, Truck, Banknote, Store } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="relative bg-[#faf9f6]">
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
        {/* Background Decorative Layer */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <Image
            src="/images/hero_bg_india.png"
            alt="Independence Day Background"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Left Side: Headline & Copy */}
          <div className="w-full lg:w-[52%] pt-2">
            {/* Festival Label Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest text-slate-800"
            >
              <span className="h-[2px] w-6 bg-[#ea580c]" />
              <span className="text-[#ea580c]">HAPPY</span>
              <span className="text-[#1d4ed8]">INDEPENDENCE</span>
              <span className="text-[#16a34a]">DAY</span>
              <span className="h-[2px] w-6 bg-[#16a34a]" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-display text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-[#0f172a] leading-[1.12] tracking-tight text-balance"
            >
              Celebrate <span className="text-[#ea580c]">15 August</span> <br />
              with Freshness
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-xl font-medium"
            >
              Fresh vegetables and seasonal fruits, supplied directly to Hostels, PGs, Hotels and Shops.
            </motion.p>

            {/* Primary CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 flex items-center gap-4"
            >
              <Link
                href="/where-we-supply"
                className="bg-[#067a46] hover:bg-[#046338] text-white font-extrabold px-8 py-3.5 rounded-full text-sm md:text-base transition shadow-md flex items-center gap-2 group"
              >
                <span>Enquire Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Right Side: Fresh Produce Graphic & Indian Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="w-full lg:w-[48%] relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-[480px]">
              {/* Proud to be Indian Circular Badge */}
              <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200 shadow-md flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1e3a8a]/10 border border-[#1e3a8a]/30 grid place-items-center text-[#1e3a8a] text-xs font-black">
                  ⚙️
                </div>
                <div className="text-[10px] uppercase font-black tracking-wider leading-tight text-slate-800">
                  <span className="text-[#ea580c] block">PROUD TO BE</span>
                  <span className="text-[#0f172a] block font-extrabold text-xs">INDIAN</span>
                  <span className="text-[#16a34a] block text-[9px]">PROUD TO SERVE FRESHNESS</span>
                </div>
              </div>

              {/* Basket Produce Image */}
              <Image
                src="/images/hero_basket_transparent.png"
                alt="Fresh Produce Crate 15 August"
                fill
                priority
                className="object-contain drop-shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Benefit Strip - Reference Mockup Card */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 -mt-6 md:-mt-10 pb-12">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          {benefits.map((b, idx) => (
            <div key={b.title} className={`flex items-center gap-3.5 ${idx > 0 ? "lg:pl-5 pt-3 sm:pt-0" : ""}`}>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#067a46] border border-emerald-100 flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-[#0f172a]">{b.title}</div>
                <div className="text-xs text-slate-500 leading-snug">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
