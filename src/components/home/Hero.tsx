"use client";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Store, Tractor, Clock, Users, Sprout, Star, Leaf } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fdfbf7] flex flex-col">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero_bg_india.png"
          alt="Independence Day Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />
        {/* Subtle white fade at the top to blend with header */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent" />
      </div>

      {/* Hero Content (Two Columns) */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 py-12 md:py-20 w-full flex-1 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Left Side: Copy */}
        <div className="w-full lg:w-[55%] xl:w-[60%] pt-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white text-navy-900 border border-india-green/20 shadow-sm px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6"
          >
            <Star className="w-3.5 h-3.5 text-india-saffron fill-india-saffron" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-india-saffron via-navy-900 to-india-green">
              🇮🇳 Franchise Opportunity In Gujarat
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-display text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold leading-[1.12] tracking-tight whitespace-pre-line text-balance drop-shadow-sm"
          >
            <span className="text-navy-950 block mb-1">Start Your Own</span>
            <span className="text-india-saffron block mb-1 drop-shadow-md">FlashKart</span>
            <span className="text-india-green block">Fresh Produce Shop</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-6 text-base md:text-lg text-slate-700 leading-relaxed max-w-xl font-medium"
          >
            Partner with an established brand, get reliable daily produce supply, and build your own fresh vegetable and fruit retail business.
          </motion.p>

          {/* Feature Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3 text-xs text-navy-900 font-bold"
          >
            <span className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-india-green/20 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-india-green" /> Best Quality & Rate
            </span>
            <span className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-india-saffron/20 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-india-saffron" /> Direct Farm Sourcing
            </span>
            <span className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-navy-900/10 shadow-sm">
              <Store className="w-4 h-4 text-navy-600" /> Hostels, Hotels & Shops
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/franchise"
              className="bg-india-saffron hover:bg-india-green text-white font-black px-8 py-4 rounded-full text-sm md:text-base transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2 group"
            >
              Franchise Details
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/shop"
              className="bg-white hover:bg-slate-50 text-navy-900 font-bold px-8 py-4 rounded-full text-sm md:text-base border border-slate-200 transition shadow-sm"
            >
              Explore Products
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Graphic */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
          className="w-full lg:w-[45%] xl:w-[40%] flex justify-center lg:justify-end relative"
        >
          <div className="relative w-full max-w-lg aspect-square lg:aspect-auto lg:h-[500px]">
             {/* Note: The generated hero_basket image has a white background. Using mix-blend-multiply helps it blend if the background isn't purely white, but it's best left normal if we want the crispness. */}
            <Image
              src="/images/hero_basket.png"
              alt="Fresh Produce Basket Independence Day"
              fill
              className="object-contain drop-shadow-2xl mix-blend-multiply"
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Benefits Bar */}
      <div className="relative z-20 w-full bg-navy-950 text-white border-t-4 border-india-saffron mt-4 md:mt-0">
        {/* Very slim tricolor line on top of the bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-india-saffron via-white to-india-green opacity-50" />
        
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-5">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-center md:justify-between gap-4 md:gap-2">
            
            <div className="flex items-center gap-3 px-2 md:border-r border-slate-700/50 flex-1 justify-center md:justify-start last:border-0 min-w-[140px]">
              <Leaf className="w-6 h-6 text-india-green" />
              <div className="text-xs font-bold leading-tight">Fresh & Healthy<br/>Everyday</div>
            </div>

            <div className="flex items-center gap-3 px-2 md:border-r border-slate-700/50 flex-1 justify-center md:justify-center last:border-0 min-w-[140px]">
              <Tractor className="w-6 h-6 text-india-saffron" />
              <div className="text-xs font-bold leading-tight">Farm Fresh<br/>Guarantee</div>
            </div>

            <div className="flex items-center gap-3 px-2 md:border-r border-slate-700/50 flex-1 justify-center md:justify-center last:border-0 min-w-[140px]">
              <Clock className="w-6 h-6 text-india-green" />
              <div className="text-xs font-bold leading-tight">On-Time<br/>Delivery</div>
            </div>

            <div className="flex items-center gap-3 px-2 md:border-r border-slate-700/50 flex-1 justify-center md:justify-center last:border-0 min-w-[140px]">
              <Users className="w-6 h-6 text-india-saffron" />
              <div className="text-xs font-bold leading-tight">Trusted by<br/>Hundreds</div>
            </div>

            <div className="flex items-center gap-3 px-2 flex-1 justify-center md:justify-end min-w-[140px]">
              <Sprout className="w-6 h-6 text-india-green" />
              <div className="text-xs font-bold leading-tight">Grow with<br/>FlashKart</div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
