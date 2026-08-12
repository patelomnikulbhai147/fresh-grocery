"use client";
import Image from "next/image";
import { useState } from "react";
import { Package, CalendarClock, FileText, Repeat, Building, Hotel, Store, CheckCircle2, PhoneCall } from "lucide-react";
import { bulkProducts } from "@/data/catalog";
import { useCart, useToasts } from "@/store/shop";
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
        <div className="text-xs text-purple-600 font-bold mb-2">
          <Link href="/" className="hover:text-purple-800">Home</Link> / Wholesale & Bulk Orders
        </div>
        <h1 className="font-display text-4xl md:text-6xl text-purple-950 font-black text-balance">
          Wholesale produce for <span className="italic text-amber-600">serious kitchens</span>.
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl text-sm md:text-base leading-relaxed">
          Direct farm wholesale pricing on fresh vegetables and seasonal fruits for hostels, PGs, hotel kitchens, and local retail stores across Gandhinagar.
        </p>
      </div>

      {/* Feature pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { icon: Building, label: "Hostels & PGs", sub: "Daily mess crates" },
          { icon: Hotel, label: "Hotels & Kitchens", sub: "Chef graded quality" },
          { icon: Store, label: "Retail Shops", sub: "Wholesale crates" },
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
        <div>
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
      <div className="relative aspect-[4/3] overflow-hidden bg-purple-50">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-purple-950 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
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
