"use client";
import Link from "next/link";
import { Building, Hotel, Store, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const segments = [
  {
    id: "hostels-pgs",
    title: "Hostels & PGs",
    subtitle: "Regular Daily Produce Supply",
    icon: Building,
    desc: "Consistent, scheduled morning supply of fresh vegetables and seasonal fruits for student hostels, PG accommodations, resident messes, and catering staff.",
    features: [
      "Custom bulk quantities tailored for mess meal schedules",
      "Pesticide-tested, clean produce with minimal kitchen prep waste",
      "Transparent wholesale billing with weekly/monthly settlement",
      "Students & residents can also buy fresh daily directly from the counter",
    ],
    accent: "from-purple-900 to-purple-950",
    badge: "Student & Resident Messes",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "hotels",
    title: "Hotels & Kitchens",
    subtitle: "Commercial Grade Kitchen Supply",
    icon: Hotel,
    desc: "Grade-A fresh vegetables and seasonal fruits supplied directly to hotel kitchens, banquet caterers, and restaurant pantries with strict size & quality grading.",
    features: [
      "Chef-graded quality for high-standard culinary dishes",
      "Daily early morning supply before kitchen prep commences",
      "Volume-based commercial rates with GST-compliant invoicing",
      "Dedicated supply account manager for special menu requests",
    ],
    accent: "from-amber-700 to-amber-900",
    badge: "Hotels & Banquets",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "shops",
    title: "Retail Shops & Marts",
    subtitle: "Direct Retail Store Sourcing",
    icon: Store,
    desc: "Fresh vegetables and seasonal fruits supplied directly to local retail shops, general stores, and mini-marts, eliminating multiple mandi middlemen.",
    features: [
      "Fresh daily arrival ensuring crisp shelf display and higher sales",
      "Competitive wholesale margins enabling better retail profits",
      "Flexible order crates matching everyday retail demand",
      "Direct brand trust with FlashKart quality verification",
    ],
    accent: "from-emerald-800 to-emerald-950",
    badge: "Local Shops & Kiranas",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
];

export function WhereWeSupplySection() {
  return (
    <section id="where-we-supply" className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.24em] font-bold text-purple-700 mb-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Where We Currently Supply
            </div>
            <h2 className="font-display text-3xl md:text-5xl text-purple-950 leading-tight">
              Currently Serving <span className="text-amber-600 italic">Gandhinagar & Beyond</span>.
            </h2>
            <p className="mt-3 text-slate-600 text-base leading-relaxed">
              FlashKart operates a direct supply network delivering high-quality fresh vegetables and seasonal fruits to partner institutions, commercial kitchens, and local stores.
            </p>
          </div>

          <Link
            href="/where-we-supply"
            className="inline-flex items-center gap-2 text-sm font-bold text-purple-900 hover:text-amber-600 transition shrink-0 group"
          >
            Explore Supply Network <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Direct Purchase Banner */}
        <div className="mb-12 rounded-3xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white p-6 md:p-8 shadow-soft border border-purple-800/40 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-block bg-amber-500/20 text-amber-300 font-bold text-xs px-3 py-1 rounded-full border border-amber-400/30 uppercase tracking-wider mb-2">
                Buy Fresh. Buy Direct.
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-white font-bold">
                Fresh Products. Better Quality. Direct From Us.
              </h3>
              <p className="mt-2 text-purple-200 text-sm md:text-base leading-relaxed">
                Get fresh vegetables and seasonal fruits directly from FlashKart through our partner hostels, PGs, hotels, and shops across Gandhinagar.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/shop"
                className="bg-amber-500 hover:bg-amber-600 text-purple-950 font-bold px-6 py-3 rounded-full text-sm transition shadow-md flex items-center gap-2"
              >
                View Fresh Produce <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full text-sm border border-white/20 transition"
              >
                Supply Inquiries
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Supply Segment Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {segments.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-800">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-purple-950 mb-1">{s.title}</h3>
                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">{s.subtitle}</div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">{s.desc}</p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  {s.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={`/where-we-supply#${s.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition border border-purple-200/60"
                >
                  Partner With Us for {s.title} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
