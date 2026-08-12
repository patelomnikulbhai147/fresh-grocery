"use client";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Truck, Tag, Package } from "lucide-react";
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
    <div className="relative">
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-24">
        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-[1400px] px-4 md:px-8 w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Left Side: Headline & Copy */}
          <div className="w-full lg:w-[52%] pt-2">
            {/* Festival Label Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-5 text-xs md:text-sm font-black uppercase tracking-widest text-slate-800"
            >
              <span className="h-[2.5px] w-7 bg-[#ea580c]" />
              <span className="text-[#ea580c]">HAPPY</span>
              <span className="text-[#1d4ed8]">INDEPENDENCE</span>
              <span className="text-[#16a34a]">DAY</span>
              <span className="h-[2.5px] w-7 bg-[#16a34a]" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-display text-4xl sm:text-5xl lg:text-[4rem] font-black text-[#0f172a] leading-[1.1] tracking-tight text-balance"
            >
              Celebrate <span className="text-[#ea580c]">15 August</span> <br />
              with Freshness
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-6 text-base md:text-xl text-slate-700 leading-relaxed max-w-2xl font-medium"
            >
              Fresh vegetables and seasonal fruits, supplied directly to Hostels, PGs, Hotels and Shops.
            </motion.p>

            {/* Primary CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-9 flex items-center gap-4"
            >
              <Link
                href="/where-we-supply"
                className="bg-[#067a46] hover:bg-[#046338] text-white font-extrabold px-9 py-4 rounded-full text-base md:text-lg transition shadow-lg flex items-center gap-3 group"
              >
                <span>Enquire Now</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
            <div className="relative w-full max-w-xl aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-[480px]">
              {/* Proud to be Indian Circular Badge */}
              <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1e3a8a]/10 border border-[#1e3a8a]/30 grid place-items-center text-[#1e3a8a] text-sm font-black">
                  ⚙️
                </div>
                <div className="text-[10px] uppercase font-black tracking-wider leading-tight text-slate-800">
                  <span className="text-[#ea580c] block">PROUD TO BE</span>
                  <span className="text-[#0f172a] block font-extrabold text-sm">INDIAN</span>
                  <span className="text-[#16a34a] block text-[9px]">PROUD TO SERVE FRESHNESS</span>
                </div>
              </div>

              {/* Basket Produce Image */}
              <Image
                src="/images/hero_basket_transparent.png"
                alt="Fresh Produce Crate 15 August"
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Glass Feature Benefit Strip - Glassmorphism Panel */}
      <div className="relative z-20 max-w-[1400px] mx-auto px-4 md:px-8 -mt-6 md:-mt-10 pb-12">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/80 shadow-xl p-5 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          {benefits.map((b, idx) => (
            <div key={b.title} className={`flex items-center gap-4 ${idx > 0 ? "lg:pl-6 pt-4 sm:pt-0" : ""}`}>
              <div className="w-13 h-13 rounded-2xl bg-emerald-50/90 text-[#067a46] border border-emerald-100/90 flex items-center justify-center shrink-0 shadow-sm p-3">
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
