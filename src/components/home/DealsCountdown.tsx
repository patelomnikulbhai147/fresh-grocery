"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/data/catalog";
import { WhatsAppSubscription } from "@/components/home/WhatsAppSubscription";

function useCountdown(target: Date) {
  const [now, setNow] = useState<number>(0);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = now === 0 ? 0 : Math.max(0, target.getTime() - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { h, m, s };
}

const Pad = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="font-display text-2xl md:text-3xl font-extrabold tabular-nums text-purple-950 bg-white border border-purple-200 rounded-2xl w-14 h-14 md:w-16 md:h-16 grid place-items-center shadow-soft">
      {String(value).padStart(2, "0")}
    </div>
    <div className="text-[10px] uppercase font-bold tracking-widest text-amber-300 mt-1.5">{label}</div>
  </div>
);

export function DealsCountdown() {
  const [target] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 0);
    return d;
  });
  const { h, m, s } = useCountdown(target);

  const deals = products
    .filter((p) => p.weights.some((w) => w.mrp > w.price))
    .slice(0, 4);

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="relative rounded-[36px] overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 p-6 md:p-10 text-white shadow-lift border border-purple-800/40">
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"
          />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8 mb-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>BEST RATES TODAY</span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-[1.05]">
                Fresh Produce Specials. <br className="hidden md:block" />
                Daily Market Rates.
              </h2>
              <p className="text-purple-200 mt-3 max-w-lg text-sm md:text-base leading-relaxed">
                Hand-picked daily specials on crisp vegetables and seasonal fruits — directly from farm hubs to your kitchen.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-purple-950">
              <Pad value={h} label="Hours" />
              <div className="text-2xl font-bold text-amber-400 opacity-70 self-start mt-4">:</div>
              <Pad value={m} label="Mins" />
              <div className="text-2xl font-bold text-amber-400 opacity-70 self-start mt-4">:</div>
              <Pad value={s} label="Secs" />
            </div>
          </div>

          {/* WhatsApp Subscription */}
          <WhatsAppSubscription />

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {deals.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="[&_article]:bg-white [&_article]:text-purple-950">
                  <ProductCard product={p} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
