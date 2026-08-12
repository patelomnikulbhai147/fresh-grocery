import type { Metadata } from "next";
import {
  Leaf,
  Sprout,
  Users,
  Award,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Building,
  Store,
  Hotel,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About FlashKart — Fresh Vegetables & Seasonal Fruits",
  description:
    "FlashKart connects regional partner farms directly with hostels, PGs, hotels, and retail shops in Gandhinagar, delivering premium quality produce at better rates.",
};

const milestones = [
  { year: "2023", title: "FlashKart Inception", text: "Founded with the mission to eliminate middlemen in the vegetable supply chain and deliver fresh produce directly to kitchens." },
  { year: "2024", title: "Institutional Supply Network", text: "Expanded daily morning vegetable supply to top student hostels and PG accommodations across Gandhinagar." },
  { year: "2025", title: "Hotel & Kitchen Partnerships", text: "Commenced commercial-grade vegetable and seasonal fruit supply for leading hotels, banquet caterers, and restaurants." },
  { year: "2026", title: "Franchise Program Launch", text: "Launched the FlashKart shop franchise model to empower local entrepreneurs with branded fresh produce outlets." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#04502d] via-[#067a46] to-[#04502d] text-white py-20 md:py-28">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ea580c]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-5 md:px-8 max-w-3xl text-center">
            <div className="text-xs uppercase font-bold tracking-[0.24em] text-white mb-3 bg-[#ea580c] inline-block px-3.5 py-1 rounded-full shadow-sm">
              Our Mission
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight text-balance">
              Fresh Produce. Direct Supply. <span className="text-[#ea580c]">Better Value.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-emerald-50 max-w-2xl mx-auto leading-relaxed">
              FlashKart was founded in Gandhinagar, Gujarat, with a straightforward purpose: to source fresh vegetables and seasonal fruits directly from farmers and supply them at fair, transparent rates to hostels, PGs, hotels, and retail shops.
            </p>
          </div>
        </section>

        {/* 3 Core Pillars */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8 grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "Direct Farm Sourcing",
                text: "We work directly with regional growers in Gujarat, cutting unnecessary wholesale layers and delivering produce within hours of harvest.",
              },
              {
                icon: ShieldCheck,
                title: "Strict Quality Grading",
                text: "Every crate is hand-sorted and inspected for freshness, crispness, and minimum prep waste before morning dispatch.",
              },
              {
                icon: Store,
                title: "Community & Franchise Focus",
                text: "We supply institutional kitchens and empower shopkeepers through our dedicated FlashKart Franchise program.",
              },
            ].map((m) => (
              <div key={m.title} className="card-option12 p-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 grid place-items-center text-[#067a46] mb-4 border border-emerald-100">
                  <m.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2 text-slate-900">{m.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Supply Channels */}
        <section className="py-14 md:py-20 bg-[#067a46] text-white">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="text-xs uppercase font-bold tracking-[0.24em] text-amber-400 mb-2">Our Supply Reach</div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold">Who We Supply Daily</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "Hostels & PGs", count: "30+ Messes", icon: Building, desc: "Daily morning vegetable supply for student hostels & private PGs in Gandhinagar." },
                { label: "Hotels & Kitchens", count: "15+ Hotels", icon: Hotel, desc: "Chef-graded fresh produce for hotel dining, banquet halls, and restaurant pantries." },
                { label: "Retail Shops", count: "25+ Stores", icon: Store, desc: "Wholesale crates supplied directly to local grocery & vegetable shops." },
              ].map((n) => (
                <div key={n.label} className="bg-white/10 border border-white/20 rounded-3xl p-6 text-center">
                  <n.icon className="w-8 h-8 text-[#ea580c] mx-auto mb-3" />
                  <div className="font-display text-3xl font-extrabold text-white">{n.count}</div>
                  <div className="text-[#ea580c] text-sm font-bold mt-1">{n.label}</div>
                  <p className="text-xs text-emerald-100 mt-2 leading-relaxed">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-5 md:px-8">
            <div className="text-center mb-12">
              <div className="text-xs uppercase font-bold tracking-[0.24em] text-[#067a46] mb-2">Our Journey</div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900">Building a Reliable Supply Chain</h2>
            </div>
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-slate-200" />
              {milestones.map((m, i) => (
                <div key={m.year} className={`relative mb-10 md:mb-14 grid md:grid-cols-2 gap-6`}>
                  <div className={`md:pr-10 ${i % 2 === 1 ? "md:col-start-2" : ""}`}>
                    <div className="card-option12 p-6 ml-10 md:ml-0">
                      <div className="text-xs font-bold uppercase tracking-widest text-[#ea580c] mb-1">{m.year}</div>
                      <div className="font-display text-xl font-bold text-slate-900">{m.title}</div>
                      <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed">{m.text}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 top-4 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#067a46] ring-4 ring-emerald-50" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-14 md:py-20 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="max-w-2xl mb-12">
              <div className="text-xs uppercase font-bold tracking-[0.24em] text-[#067a46] mb-2">Our Standards</div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900">What FlashKart Stands For</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "100% focus on fresh vegetables and seasonal fruits.",
                "Zero unnecessary middlemen markups — direct value to kitchens.",
                "Prompt daily morning deliveries before culinary prep starts.",
                "Full support for local FlashKart Franchise entrepreneurs.",
                "Honest, transparent pricing for all partner hostels and hotels.",
                "Direct contact with founders Kaushik Patel and Om Patel.",
              ].map((v) => (
                <div key={v} className="flex items-start gap-3 bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-[#067a46] shrink-0 mt-0.5" />
                  <span className="text-slate-900 text-sm font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 md:py-20 bg-slate-50">
          <div className="mx-auto max-w-3xl px-5 md:px-8 text-center">
            <TrendingUp className="w-10 h-10 mx-auto text-[#067a46] mb-4" />
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 text-balance">
              Partner with FlashKart Today
            </h2>
            <p className="mt-4 text-slate-600 text-sm md:text-base leading-relaxed">
              Whether you need daily supply for your hostel/hotel kitchen, or want to start your own FlashKart fresh produce shop, we are ready to assist you.
            </p>
            <div className="mt-8 flex gap-3 justify-center flex-wrap">
              <Link href="/shop" className="bg-[#067a46] text-white rounded-full px-6 py-3.5 font-bold text-xs md:text-sm hover:bg-[#046338] transition">
                Explore Produce
              </Link>
              <Link href="/franchise" className="bg-[#ea580c] text-white rounded-full px-6 py-3.5 font-bold text-xs md:text-sm hover:bg-[#c2410c] transition shadow-sm">
                Franchise Opportunity
              </Link>
              <Link href="/contact" className="bg-white border border-slate-200 text-slate-800 rounded-full px-6 py-3.5 font-bold text-xs md:text-sm hover:bg-slate-50 transition">
                Contact Leadership
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
