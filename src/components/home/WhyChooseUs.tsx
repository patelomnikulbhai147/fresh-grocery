"use client";
import { ShieldCheck, Percent, Leaf, Truck, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Best Quality",
    tagline: "Rigorous Hand-Selection",
    text: "Carefully selected and graded fresh produce with zero compromise on crispness, taste, and nutrition.",
    accent: "from-purple-100 to-purple-50",
    iconColor: "text-purple-700",
  },
  {
    icon: Percent,
    title: "Best Rates",
    tagline: "Fair & Transparent Pricing",
    text: "Competitive and wholesale rates enabled by direct farm sourcing, passing genuine savings to our partners and buyers.",
    accent: "from-amber-100 to-amber-50",
    iconColor: "text-amber-700",
  },
  {
    icon: Leaf,
    title: "Fresh Products",
    tagline: "Vegetables & Seasonal Fruits",
    text: "Exclusively focused on high-quality daily vegetables and naturally ripened seasonal fruits.",
    accent: "from-emerald-100 to-emerald-50",
    iconColor: "text-emerald-700",
  },
  {
    icon: Truck,
    title: "Direct Supply",
    tagline: "Business-Focused Supply",
    text: "Dedicated fulfillment for hostels, PGs, hotel commercial kitchens, and local retail stores without intermediaries.",
    accent: "from-indigo-100 to-indigo-50",
    iconColor: "text-indigo-700",
  },
  {
    icon: Users,
    title: "Trust & Service",
    tagline: "Long-Term Partnerships",
    text: "Dedicated personal support from founders Kaushik Patel and Om Patel to ensure seamless daily supply operations.",
    accent: "from-rose-100 to-rose-50",
    iconColor: "text-rose-700",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24 bg-purple-50/40 relative">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.24em] font-bold text-purple-700 mb-2 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Why FlashKart
          </div>
          <h2 className="font-display text-3xl md:text-5xl text-purple-950 text-balance leading-tight">
            Five core commitments that make us <span className="italic text-amber-600">reliable</span>.
          </h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
            Good Food • Good Price • Good Life. We bridge the gap between quality farms and Gandhinagar’s kitchens and stores.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="group relative rounded-3xl border border-purple-100 p-6 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${b.accent} grid place-items-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <b.icon className={`w-6 h-6 ${b.iconColor}`} strokeWidth={2} />
                </div>
                <div className="font-display text-lg font-bold text-purple-950 mb-1">{b.title}</div>
                <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2">{b.tagline}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{b.text}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-50 text-[10px] font-mono text-purple-400">
                0{i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
