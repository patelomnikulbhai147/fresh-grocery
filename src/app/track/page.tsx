import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  CheckCircle2,
  Circle,
  Package,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  Sparkles,
  Building,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Track Produce Order · FlashKart",
  robots: { index: false, follow: false },
};

const steps = [
  { id: "confirmed", label: "Produce order confirmed & scheduled", time: "6:15 AM", done: true },
  { id: "harvest", label: "Farm harvest & grading at Gandhinagar Hub", time: "6:45 AM", done: true },
  { id: "dispatch", label: "En route to partner location / counter", time: "7:20 AM", done: true, current: true },
  { id: "received", label: "Fulfilled at location", time: "Est. 7:50 AM", done: false },
];

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-purple-950 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl px-5 md:px-8 py-10 md:py-14">
        <div className="mb-8">
          <div className="text-xs text-purple-600 font-bold mb-2">
            <a href="/" className="hover:text-purple-800">Home</a> / Track Order
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-black text-purple-950">Order #FLK-823145</h1>
          <p className="text-slate-600 mt-1 text-sm font-medium">Gandhinagar Hub Sourcing · Scheduled Morning Dispatch</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-purple-950 to-indigo-950 text-white rounded-3xl p-6 shadow-lift border border-purple-800/40 relative overflow-hidden">
              <div aria-hidden className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-amber-500/20 blur-2xl" />
              <div className="relative flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-amber-300">Live Supply Status</div>
                  <div className="font-display text-2xl font-bold mt-1">Produce crates in transit</div>
                  <div className="text-xs text-purple-200 mt-1">Scheduled arrival · 7:50 AM (Gandhinagar Sector Hub)</div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:+919773271029"
                    className="bg-amber-500 hover:bg-amber-400 text-purple-950 rounded-full px-5 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Dispatch Desk
                  </a>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-soft">
              <h3 className="font-display text-lg font-bold text-purple-950 mb-5">Fulfillment Progress</h3>
              <div className="relative">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-purple-100" />
                {steps.map((s) => (
                  <div key={s.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
                    <div className="relative z-10">
                      {s.done ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white grid place-items-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : s.current ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-purple-950 grid place-items-center pulse-ring">
                          <Circle className="w-3 h-3" fill="currentColor" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-purple-200 bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-xs md:text-sm text-purple-950">{s.label}</div>
                      <div className="text-[11px] text-purple-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {s.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-3xl border border-purple-100 p-5 shadow-soft">
              <h4 className="font-bold text-xs uppercase tracking-wider text-purple-950 mb-3">Supply Coordinator</h4>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-900 grid place-items-center font-bold text-sm">
                  OP
                </div>
                <div>
                  <div className="font-bold text-sm text-purple-950">Om Patel</div>
                  <div className="text-xs text-purple-700">FlashKart Gandhinagar Hub</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-purple-50 rounded-xl text-xs text-purple-900 flex items-center gap-2 border border-purple-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Quality Verified & Farm Graded
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-purple-100 p-5 shadow-soft">
              <h4 className="font-bold text-xs uppercase tracking-wider text-purple-950 mb-3">Partner Destination</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Partner Counter / Kitchen Mess<br />
                Infocity Sector Hub, Gandhinagar 382009
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-purple-100 p-5 shadow-soft">
              <h4 className="font-bold text-xs uppercase tracking-wider text-purple-950 mb-3">Ordered Fresh Produce</h4>
              <div className="space-y-2 text-xs">
                {[
                  { n: "Vine-Ripened Tomatoes", q: "5 kg" },
                  { n: "Farm-Fresh Potatoes", q: "10 kg" },
                  { n: "Red Onions", q: "10 kg" },
                  { n: "Fresh Baby Spinach", q: "4 bunches" },
                  { n: "Seasonal Kesar Mangoes", q: "3 kg" },
                ].map((i) => (
                  <div key={i.n} className="flex justify-between text-slate-700">
                    <span className="font-medium">{i.n}</span>
                    <span className="font-bold text-purple-950">{i.q}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
