"use client";
import Link from "next/link";
import { Sparkles, Store, TrendingUp, ShieldCheck, Truck, Users, HelpCircle, PhoneCall, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Store,
    title: "Attractive Shop Concept",
    desc: "Modern, clean, and recognizable fresh produce storefront designed to attract daily shoppers.",
  },
  {
    icon: Truck,
    title: "Daily Fresh Product Supply",
    desc: "Dependable morning delivery of fresh vegetables and seasonal fruits directly to your store.",
  },
  {
    icon: ShieldCheck,
    title: "Quality-Focused Sourcing",
    desc: "Rigorous grading and direct farm connections ensure your customers always get the best produce.",
  },
  {
    icon: TrendingUp,
    title: "Established Brand Identity",
    desc: "Leverage FlashKart's trusted brand, marketing materials, and customer reputation.",
  },
  {
    icon: Users,
    title: "Comprehensive Guidance",
    desc: "Operational training, inventory turnover best practices, and pricing guidance from day one.",
  },
  {
    icon: HelpCircle,
    title: "Ongoing Brand Support",
    desc: "Continuous logistics, supply assistance, and promotional campaign support to grow your business.",
  },
];

export function FranchiseSection() {
  return (
    <section id="franchise" className="py-16 md:py-24 bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Partnership Opportunity
          </div>
          <h2 className="font-display text-3xl md:text-5xl text-white font-bold tracking-tight">
            Grow With <span className="text-amber-400">FlashKart</span>
          </h2>
          <div className="font-display text-xl md:text-2xl text-purple-200 mt-2 font-medium">
            Start Your Own FlashKart Fresh Produce Shop
          </div>
          <p className="mt-4 text-purple-200 text-sm md:text-base leading-relaxed">
            Become a FlashKart franchise partner and build your own fresh vegetables & seasonal fruits business with our brand, supply network, and operational guidance.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {benefits.map((b, idx) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <b.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{b.title}</h3>
              <p className="text-purple-200 text-xs md:text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Action Card / Quick Contact */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <h3 className="font-display text-2xl md:text-3xl text-white font-bold">
              Ready to Launch Your FlashKart Shop in Gandhinagar or Gujarat?
            </h3>
            <p className="text-purple-200 text-sm mt-2 leading-relaxed">
              Connect directly with our founding leadership to discuss location suitability, store setup requirements, and supply onboarding.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-amber-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Low Entry Barrier</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Direct Farm Sourcing</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Complete Setup Assistance</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <Link
              href="/franchise"
              className="bg-amber-500 hover:bg-amber-400 text-purple-950 font-bold px-7 py-3.5 rounded-full text-sm transition shadow-glow-cta flex items-center justify-center gap-2"
            >
              Explore Franchise Details <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:+919773271029"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-full text-sm border border-white/20 transition flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" /> Call Om Patel
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
