import { Leaf, ShieldCheck, Sparkles, Star, Store, Building } from "lucide-react";

const messages = [
  { icon: Sparkles, text: "FlashKart • Fresh. Fast. Reliable." },
  { icon: ShieldCheck, text: "Best Quality • Best Rate • Best Service" },
  { icon: Leaf, text: "Fresh Vegetables & Seasonal Fruits" },
  { icon: Building, text: "Currently Supplying Hostels, PGs, Hotels & Shops" },
  { icon: Store, text: "Grow With FlashKart • Franchise Opportunities" },
  { icon: Star, text: "Buy Fresh • Buy Direct • Gandhinagar, Gujarat" },
];

export function BrandMarquee() {
  const repeated = [...messages, ...messages, ...messages];

  return (
    <div className="relative border-y border-purple-100 bg-purple-50/70 overflow-hidden py-3.5 select-none">
      <div className="flex marquee whitespace-nowrap">
        {repeated.map((m, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-3 px-6 text-xs md:text-sm text-purple-950 font-bold tracking-wide"
          >
            <m.icon className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{m.text}</span>
            <span className="text-purple-300 ml-3">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
