import {
  Smartphone,
  Download,
  Zap,
  Bell,
  Star,
  ShieldCheck,
  Building,
  Store,
} from "lucide-react";

export function MobileApp() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="relative rounded-[36px] overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 p-8 md:p-14 text-white shadow-lift border border-purple-800/40">
          <div aria-hidden className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          <div aria-hidden className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                <Download className="w-3.5 h-3.5" /> FlashKart Digital Network · App Coming Soon
              </div>
              <h2 className="font-display text-3xl md:text-5xl text-balance leading-tight font-extrabold">
                Manage fresh produce orders, <span className="italic text-amber-400">anytime, anywhere.</span>
              </h2>
              <p className="text-purple-200 mt-4 max-w-lg leading-relaxed text-sm md:text-base">
                Streamlining daily vegetable and seasonal fruit supply for hostels, PGs, hotels, and retail shop owners with digital invoicing, direct booking, and instant rate sheets.
              </p>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: Zap, title: "Direct Sourcing", sub: "Farm to network" },
                  { icon: Building, title: "Hostel Orders", sub: "Daily mess plans" },
                  { icon: Store, title: "Shop Crates", sub: "Wholesale crates" },
                  { icon: Bell, title: "Price Alerts", sub: "Daily market rate" },
                  { icon: Star, title: "Best Rates", sub: "Direct farm pricing" },
                  { icon: ShieldCheck, title: "Verified Quality", sub: "Zero compromise" },
                ].map((f) => (
                  <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                    <f.icon className="w-5 h-5 text-amber-400 mb-2" />
                    <div className="text-sm font-bold">{f.title}</div>
                    <div className="text-xs text-purple-200 mt-0.5">{f.sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-5 py-3">
                  <Smartphone className="w-6 h-6 text-white/90" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-white/60">Get it on</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                  <span className="text-[10px] bg-amber-500 text-purple-950 px-2 py-0.5 rounded-full font-bold ml-2">SOON</span>
                </div>
                <div className="inline-flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-5 py-3">
                  <Smartphone className="w-6 h-6 text-white/90" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-white/60">Download on</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                  <span className="text-[10px] bg-amber-500 text-purple-950 px-2 py-0.5 rounded-full font-bold ml-2">SOON</span>
                </div>
              </div>
            </div>

            {/* Mock phone */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto w-[290px] h-[560px] rounded-[48px] bg-gradient-to-b from-purple-900 to-purple-950 p-3 shadow-lift border border-purple-700/50">
                <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-slate-50 flex flex-col justify-between">
                  <div className="bg-purple-950 text-white p-4 flex items-center justify-between">
                    <div className="text-xs font-bold">9:41</div>
                    <div className="font-display text-sm font-bold text-amber-400">FlashKart</div>
                    <div className="text-xs">100%</div>
                  </div>
                  <div className="p-4 space-y-3 flex-1 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-4 text-white shadow-sm">
                      <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">FlashKart Hub</div>
                      <div className="font-display text-lg font-bold">Gandhinagar Supply</div>
                      <div className="text-xs text-purple-200 mt-1">Hostels · Hotels · Shops</div>
                    </div>
                    <div className="bg-white rounded-2xl p-3.5 border border-purple-100 shadow-sm">
                      <div className="text-[10px] uppercase tracking-wider text-purple-700 font-bold">Today's Produce</div>
                      <div className="flex items-center justify-between mt-1.5 text-xs text-slate-800 font-semibold">
                        <span>Tomatoes, Onions, Potatoes</span>
                        <span className="text-emerald-700">In Stock</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-purple-50 p-2 rounded-xl text-purple-900 font-bold">Fresh Veggies</div>
                      <div className="bg-amber-50 p-2 rounded-xl text-amber-900 font-bold">Seasonal Fruits</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
