"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, Trash2, Tag, ArrowRight, Sparkles, Package, Building } from "lucide-react";
import { useCart } from "@/store/shop";
import { formatINR, formatWeight } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { computeOrderCharges, freeDeliveryHint } from "@/lib/fees";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/store/customerAuth";
import type { DeliveryMode } from "@/data/catalog";

const TABS: { id: DeliveryMode | "all"; label: string; icon: typeof Sparkles }[] = [
  { id: "all", label: "All Items", icon: Tag },
  { id: "instant", label: "Direct Produce", icon: Sparkles },
  { id: "bulk", label: "Wholesale", icon: Package },
  { id: "subscription", label: "Supply", icon: Building },
];

export function CartDrawer() {
  const router = useRouter();
  const { isAuthenticated, openLoginModal } = useCustomerAuth();
  const isOpen = useCart((s) => s.isOpen);
  const items = useCart((s) => s.items);
  const close = useCart((s) => s.close);
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());
  const discount = useCart((s) => s.discount());
  const [tab, setTab] = useState<DeliveryMode | "all">("all");

  // Same fee source of truth as checkout — the cart preview shows the fees
  // that will apply; the server remains authoritative at order time.
  const charges = computeOrderCharges(subtotal);
  const total = charges.total;
  const freeHint = freeDeliveryHint(subtotal);

  const visible = tab === "all" ? items : items.filter((i) => i.mode === tab);
  const counts = {
    all: items.length,
    instant: items.filter((i) => i.mode === "instant").length,
    bulk: items.filter((i) => i.mode === "bulk").length,
    subscription: items.filter((i) => i.mode === "subscription").length,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white z-[70] flex flex-col shadow-lift border-l border-slate-100"
            aria-label="Cart"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#067a46]">FlashKart Order</div>
                <div className="font-display text-2xl font-black text-slate-900">
                  {items.length === 0 ? "Basket is Empty" : `${items.length} produce item${items.length > 1 ? "s" : ""}`}
                </div>
              </div>
              <button onClick={close} className="p-2 rounded-full hover:bg-slate-50 text-slate-800 transition" aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            {items.length > 0 && (
              <div className="px-5 pt-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide border-b border-slate-50">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition",
                      tab === t.id
                        ? "bg-[#067a46] text-white border-[#067a46]"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full",
                      tab === t.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    )}>{counts[t.id]}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-800 grid place-items-center mx-auto mb-4 text-2xl border border-slate-100">
                    🥦
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900">Your basket is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-6">
                    Add fresh vegetables and seasonal fruits directly from our farm-fresh catalog.
                  </p>
                  <button
                    onClick={() => { close(); router.push("/shop"); }}
                    className="px-6 py-3 bg-[#067a46] text-white text-xs font-bold rounded-full hover:bg-[#046338]"
                  >
                    Browse Fresh Produce
                  </button>
                </div>
              ) : visible.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No items in this category tab.
                </div>
              ) : (
                visible.map((it) => (
                  <div key={`${it.productId}-${it.weight}-${it.mode}`} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200 relative p-1">
                      <Image src={it.image} alt={it.name} fill className="object-contain mix-blend-multiply p-1" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display text-sm font-bold text-slate-900 truncate">{it.name}</h4>
                          <button
                            onClick={() => remove(it.productId, it.weight, it.mode)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-[#067a46] font-medium">
                          {it.weight} × {it.quantity}
                          {it.grams && (
                            <span className="text-slate-500"> · Total: {formatWeight(it.grams * it.quantity)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-0.5">
                          <button
                            onClick={() => updateQty(it.productId, it.weight, it.mode, it.quantity - 1)}
                            className="w-5 h-5 grid place-items-center rounded-full hover:bg-slate-50 text-slate-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-slate-900">{it.quantity}</span>
                          <button
                            onClick={() => updateQty(it.productId, it.weight, it.mode, it.quantity + 1)}
                            className="w-5 h-5 grid place-items-center rounded-full hover:bg-slate-50 text-slate-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="font-display font-black text-sm text-slate-900">
                          {formatINR(it.price * it.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-white space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Items Total</span>
                  <span className="font-bold text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Delivery Fee</span>
                  {charges.freeDelivery ? (
                    <span className="font-bold text-[#067a46]">FREE</span>
                  ) : (
                    <span className="font-bold text-slate-900">{formatINR(charges.deliveryFee)}</span>
                  )}
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Handling Fee</span>
                  <span className="font-bold text-slate-900">{formatINR(charges.handlingFee)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Convenience Fee</span>
                  <span className="font-bold text-slate-900">{formatINR(charges.convenienceFee)}</span>
                </div>
                {freeHint && (
                  <div className="text-[11px] font-bold text-[#067a46] bg-emerald-50 rounded-lg px-2.5 py-1.5">
                    {freeHint}
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-lg">{formatINR(total)}</span>
                </div>

                <button
                  onClick={() => {
                    close();
                    if (isAuthenticated) router.push("/checkout");
                    else openLoginModal("/checkout");
                  }}
                  className="w-full bg-[#067a46] hover:bg-[#046338] text-white font-bold py-3.5 rounded-full text-sm flex items-center justify-center gap-2 shadow-md transition"
                >
                  Proceed to Order Fulfillment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
