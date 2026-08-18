"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Plus, Minus, Calendar, CheckCircle2, Sparkles, Building } from "lucide-react";
import { subscriptionProducts, type Product } from "@/data/catalog";
import { useCart, useToasts } from "@/store/shop";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui/ProductImage";

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SubscriptionPage() {
  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);

  return (
    <div>
      <div className="mb-10">
        <div className="text-xs text-purple-600 font-bold mb-2">
          <Link href="/" className="hover:text-purple-800">Home</Link> / Regular Kitchen Produce Supply
        </div>
        <h1 className="font-display text-4xl md:text-6xl text-purple-950 font-black text-balance">
          Scheduled daily produce for <span className="italic text-amber-600">hostels & kitchens</span>.
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl text-sm md:text-base leading-relaxed">
          Daily morning supply of fresh vegetables, leafy greens, and seasonal fruits for hostel messes, PG accommodations, and hotel kitchens across Gandhinagar.
        </p>
      </div>

      {/* How it works */}
      <div className="grid md:grid-cols-5 gap-3 mb-14">
        {[
          { step: "01", title: "Select Produce", desc: "Choose staple veggies & fruits" },
          { step: "02", title: "Set Daily Quantity", desc: "Per kg or crate packs" },
          { step: "03", title: "Select Days", desc: "Daily or specific days" },
          { step: "04", title: "Scheduled Delivery", desc: "Before 7:30 AM morning" },
          { step: "05", title: "Simple Billing", desc: "Weekly / monthly accounts" },
        ].map((s) => (
          <div key={s.step} className="bg-white rounded-2xl border border-purple-100 p-4 shadow-sm">
            <div className="text-xs font-mono font-bold text-amber-600 mb-1">{s.step}</div>
            <div className="font-display text-base font-bold text-purple-950">{s.title}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Products */}
      <h2 className="font-display text-2xl md:text-3xl font-bold text-purple-950 mb-5">Select Regular Produce Items</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subscriptionProducts.map((p: Product) => (
          <SubscriptionProductCard
            key={p.id}
            product={p}
            onAdd={(days) => {
              add(p, 0, "subscription", { days } as any);
              push(`${p.name} added to scheduled supply`);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SubscriptionProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (days: string[]) => void;
}) {
  const [qty, setQty] = useState(1);
  const [days, setDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  const w = product.weights[0];
  const price = w.subscription ?? w.price;

  const toggleDay = (d: string) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const monthly = price * qty * Math.max(1, days.length) * 4;

  return (
    <div className="bg-white rounded-3xl border border-purple-100 p-5 flex flex-col justify-between shadow-soft">
      <div>
        <div className="relative aspect-[4/3] rounded-2xl mb-4 bg-slate-50 overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.name}
            sizes="(max-width: 768px) 90vw, 360px"
            containPadding="p-3"
          />
          <div className="absolute top-2.5 left-2.5 z-10 bg-purple-950 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Building className="w-3 h-3" /> REGULAR SUPPLY
          </div>
        </div>
        <h3 className="font-display text-lg font-bold text-purple-950">{product.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{product.tagline}</p>

        <div className="mt-3 flex items-baseline gap-2">
          <div className="font-display text-xl font-bold text-purple-950">{formatINR(price)}</div>
          <div className="text-[11px] text-slate-500">per {w.label}</div>
        </div>

        {/* Days selector */}
        <div className="mt-4">
          <div className="text-[11px] font-bold text-purple-950 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-700" /> Supply Days:
          </div>
          <div className="flex gap-1">
            {DAY_OPTIONS.map((d) => {
              const active = days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={cn(
                    "flex-1 py-1 rounded-lg text-[10px] font-bold transition",
                    active ? "bg-purple-950 text-white" : "bg-purple-50 text-purple-900 hover:bg-purple-100"
                  )}
                >
                  {d[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-purple-50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-purple-50 rounded-full p-0.5 border border-purple-100">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-6 h-6 grid place-items-center rounded-full hover:bg-purple-200 text-purple-950 font-bold">
            -
          </button>
          <span className="w-5 text-center text-xs font-bold text-purple-950">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="w-6 h-6 grid place-items-center rounded-full hover:bg-purple-200 text-purple-950 font-bold">
            +
          </button>
        </div>

        <button
          onClick={() => onAdd(days)}
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-purple-950 font-bold py-2 rounded-full text-xs transition shadow-sm"
        >
          Add to Supply Schedule
        </button>
      </div>
    </div>
  );
}
