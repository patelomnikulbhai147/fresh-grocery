"use client";
import Image from "next/image";
import { useState } from "react";
import { Package, CalendarClock, FileText, Repeat, Building, Hotel, Store, CheckCircle2, PhoneCall } from "lucide-react";
import { bulkProducts } from "@/data/catalog";
import { useCart, useToasts } from "@/store/shop";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function BulkPage() {
  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);
  const [date, setDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [slot, setSlot] = useState("6am-9am");
  const slots = ["6 AM – 9 AM", "9 AM – 12 PM", "2 PM – 5 PM", "5 PM – 8 PM"];

  return (
    <div>
      <div className="mb-10">
        <div className="text-xs text-purple-600 font-bold mb-3">
          <Link href="/" className="hover:text-purple-800">Home</Link> / FlashKart Business
        </div>

        {/* Business Hero */}
        <div className="relative overflow-hidden bg-[#1d1237] rounded-[24px] p-6 sm:p-10 text-white shadow-lg">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ea580c]/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-emerald-200 text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4">
              FlashKart Business
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black leading-[1.12] text-balance">
              Bulk Orders. <span className="text-[#fb923c]">Better Prices.</span>
              <br className="hidden sm:block" /> Reliable Supply.
            </h1>
            <p className="mt-3 text-purple-100/80 max-w-2xl text-sm md:text-base leading-relaxed">
              Wholesale pricing, quantity tiers and scheduled supply — for hotels, restaurants,
              hostels, PGs, cafes, caterers, offices, schools, retailers and shops across Gandhinagar.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm font-semibold text-emerald-100">
              {["Best Prices Guaranteed", "Bulk Discounts", "Scheduled Delivery", "GST Invoice", "Dedicated Support"].map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" /> {b}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <a
                href="#bulk-catalogue"
                className="inline-flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold px-7 py-3.5 rounded-xl text-sm sm:text-base transition shadow-md active:scale-[0.98]"
              >
                Start Bulk Order
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feature pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { icon: Building, label: "Hostels & PGs", sub: "Daily mess crates" },
          { icon: Hotel, label: "Hotels & Restaurants", sub: "Chef graded quality" },
          { icon: Store, label: "Shops & Retailers", sub: "Wholesale crates" },
          { icon: FileText, label: "GST Billing", sub: "Transparent accounts" },
        ].map((f) => (
          <div key={f.label} className="bg-white rounded-2xl border border-purple-100 p-4 flex items-start gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 grid place-items-center text-purple-800 shrink-0">
              <f.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs md:text-sm text-purple-950">{f.label}</div>
              <div className="text-[11px] text-slate-500">{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule + Products */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div id="bulk-catalogue" className="scroll-mt-24">
          <h2 className="font-display text-2xl font-bold text-purple-950 mb-5">Pick Wholesale Items</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {bulkProducts.map((p) => {
              const w = p.weights.find((w) => w.bulk) ?? p.weights[0];
              const bulk = w.bulk;
              if (!bulk) return null;
              return (
                <BulkCard
                  key={p.id}
                  product={p}
                  onAdd={(q) => {
                    add(p, p.weights.indexOf(w), "bulk", { deliveryDate: date, quantity: q } as any);
                    for (let i = 1; i < q; i++) {
                      add(p, p.weights.indexOf(w), "bulk", { deliveryDate: date });
                    }
                    push(`${q} × ${p.name} added to wholesale order`);
                  }}
                  moq={bulk.moq}
                  unitPrice={bulk.unit}
                  discount={bulk.discount}
                />
              );
            })}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 self-start space-y-4">
          <div className="bg-white rounded-3xl border border-purple-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="w-4 h-4 text-purple-700" />
              <h3 className="font-display text-lg font-bold text-purple-950">Supply Schedule</h3>
            </div>
            <label className="block">
              <div className="text-xs font-bold text-purple-950 mb-1.5">Preferred Date</div>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            </label>
            <div className="mt-3">
              <div className="text-xs font-bold text-purple-950 mb-1.5">Time Window</div>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-bold transition",
                      slot === s ? "bg-purple-950 text-white border-purple-950" : "border-purple-100 hover:border-purple-300 text-purple-900"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div id="corporate" className="bg-gradient-to-br from-purple-950 to-indigo-950 rounded-3xl p-6 text-white shadow-soft">
            <Building className="w-6 h-6 text-amber-400 mb-3" />
            <div className="font-display text-xl font-bold mb-2">Institutional Inquiries</div>
            <p className="text-purple-200 text-xs leading-relaxed mb-4">
              Consolidated weekly/monthly billing with custom harvest grading for hostels, hotels, and retail stores in Gandhinagar.
            </p>
            <a
              href="tel:+916352856495"
              className="inline-flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-purple-950 rounded-full py-2.5 text-xs font-bold transition"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call Kaushik Patel
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

function BulkCard({
  product,
  onAdd,
  moq,
  unitPrice,
  discount,
}: {
  product: (typeof bulkProducts)[number];
  onAdd: (qty: number) => void;
  moq: number;
  unitPrice: number;
  discount: number;
}) {
  const [qty, setQty] = useState(moq);
  return (
    <div className="bg-white rounded-3xl border border-purple-100 overflow-hidden flex flex-col shadow-sm">
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          sizes="(max-width: 768px) 90vw, 400px"
          containPadding="p-3"
        />
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-purple-950 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
          <Package className="w-3 h-3" /> WHOLESALE · {discount}% OFF
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="font-display text-lg font-bold text-purple-950">{product.name}</div>
        <div className="text-xs text-slate-500 mt-0.5">{product.tagline}</div>
        <div className="mt-4 flex items-baseline gap-2">
          <div className="font-display text-2xl font-black text-purple-950">{formatINR(unitPrice)}</div>
          <div className="text-[11px] text-slate-500">per unit · MOQ {moq}</div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => setQty(Math.max(moq, qty - 1))} className="w-9 h-9 rounded-full bg-purple-50 text-purple-900 font-bold grid place-items-center">
            -
          </button>
          <div className="flex-1 text-center font-bold text-xs text-purple-950">{qty} units</div>
          <button onClick={() => setQty(qty + 1)} className="w-9 h-9 rounded-full bg-purple-950 text-white font-bold grid place-items-center">+</button>
        </div>
        <button
          onClick={() => onAdd(qty)}
          className="mt-4 bg-amber-500 hover:bg-amber-400 text-purple-950 rounded-full py-2.5 text-xs font-bold transition shadow-sm"
        >
          Add to Wholesale · {formatINR(unitPrice * qty)}
        </button>
      </div>
    </div>
  );
}
