import type { Metadata } from "next";
import Link from "next/link";
import { farmers } from "@/data/catalog";
import Image from "next/image";
import { MapPin, Award, Leaf, Sprout, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Farmers · The people behind your basket",
  description:
    "Meet the 140+ small farms we partner with across Gujarat. Trace every basket back to the grower.",
  alternates: { canonical: "/farmers" },
};

export default function Page() {
  return (
    <div className="min-h-screen">
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url(/placeholder.jpg)" }} />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950/80 to-brand-900/40" />
          <div className="relative mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-36 text-white max-w-3xl">
            <div className="text-xs uppercase tracking-[0.24em] text-brand-200 mb-3">Our farmers</div>
            <h1 className="font-display text-4xl md:text-6xl leading-tight text-balance">
              Every basket has a <span className="italic text-cta-300">name behind it</span>.
            </h1>
            <p className="mt-5 text-lg text-white/90 max-w-2xl leading-relaxed">
              FlashKart partners directly with regional growers across Gujarat — no middlemen,
              no cold-storage shortcuts, no compromise. Fresh vegetables and seasonal fruits sourced for our partner hostels, hotels, and retail shops.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-8 grid md:grid-cols-4 gap-4">
            {[
              { icon: Sprout, value: "140+", label: "Partner farms" },
              { icon: MapPin, value: "23", label: "Districts" },
              { icon: ShieldCheck, value: "100%", label: "Residue tested" },
              { icon: Award, value: "48 hrs", label: "Farmer payout" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-3xl border border-brand-100 p-6">
                <s.icon className="w-6 h-6 text-brand-700 mb-3" />
                <div className="font-display text-4xl text-brand-950">{s.value}</div>
                <div className="text-sm text-brand-700 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-5 md:px-8 space-y-10">
            {farmers.map((f, i) => (
              <article key={f.name} className={`grid lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                  <Image src={f.image} alt={f.name} fill className="object-cover" />
                  <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 glass-strong text-brand-900 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Award className="w-3 h-3 text-cta-500" /> {f.certification}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-brand-600 mb-2">{f.farm}</div>
                  <h2 className="font-display text-3xl md:text-4xl text-brand-950">{f.name}</h2>
                  <div className="flex items-center gap-1.5 text-sm text-brand-600 mt-2">
                    <MapPin className="w-4 h-4" /> {f.location} · Since {f.since}
                  </div>
                  <blockquote className="mt-5 font-display text-xl md:text-2xl italic leading-snug text-brand-900">
                    "{f.quote}"
                  </blockquote>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {f.produce.map((p) => (
                      <span key={p} className="inline-flex items-center gap-1 bg-brand-50 text-brand-800 text-xs px-3 py-1.5 rounded-full">
                        <Leaf className="w-3 h-3" /> {p}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm text-brand-700">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> Paid within 48 hours of delivery
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-3xl px-5 md:px-8 text-center">
            <h2 className="font-display text-3xl md:text-5xl text-brand-950 text-balance">
              Want to partner with us?
            </h2>
            <p className="mt-4 text-brand-700">
              If you farm within 200 km of Ahmedabad or Gandhinagar and share our commitment to
              residue-free produce, we'd love to hear from you.
            </p>
            <div className="mt-6 flex gap-3 justify-center flex-wrap">
              <Link href="/contact" className="bg-cta-500 hover:bg-cta-600 text-white rounded-full px-6 py-3.5 font-semibold text-sm shadow-glow-cta">Apply to partner</Link>
              <Link href="/shop" className="bg-white border border-brand-200 rounded-full px-6 py-3.5 font-semibold text-sm">Shop their produce</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
