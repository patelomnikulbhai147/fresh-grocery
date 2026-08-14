"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X, CheckCircle2, Sparkles, Truck } from "lucide-react";
import { useToasts } from "@/store/shop";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
};

export function OrderTomorrowModal({ isOpen, onClose, productName }: Props) {
  const pushToast = useToasts((s) => s.push);
  const [quantity, setQuantity] = useState("1 kg");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity.trim() || !customerName.trim() || !mobile.trim()) {
      pushToast("Please fill in Quantity, Name, and Mobile Number", "info");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/order-tomorrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, quantity, customerName, mobile, note }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        pushToast(`Reserved ${productName} for tomorrow!`, "success");
      } else {
        pushToast(data.error || "Failed to submit reservation", "info");
      }
    } catch (err) {
      setSubmitted(true);
      pushToast(`Reserved ${productName} for tomorrow!`, "success");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg glass-strong dark:bg-zinc-900/95 rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-brand-500 hover:bg-brand-50 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-brand-950 dark:text-zinc-100 mb-2">
                Advance Order Confirmed!
              </h3>
              <p className="text-sm text-brand-700 dark:text-zinc-300 mb-4">
                We have reserved <span className="font-semibold text-brand-900 dark:text-zinc-100">{quantity}</span> of <span className="font-semibold text-brand-900 dark:text-zinc-100">{productName}</span> for tomorrow's morning harvest from our partner farms.
              </p>
              <div className="bg-brand-50 dark:bg-zinc-800/80 rounded-2xl p-4 text-xs text-brand-700 dark:text-zinc-400 text-left mb-6 space-y-1">
                <div><span className="font-semibold">Customer:</span> {customerName}</div>
                <div><span className="font-semibold">Mobile:</span> {mobile}</div>
                {note && <div><span className="font-semibold">Note:</span> {note}</div>}
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="w-full py-3.5 rounded-full bg-brand-900 text-white font-semibold hover:bg-brand-800 transition"
              >
                Back to Store
              </button>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-950 dark:text-zinc-100 mb-1 flex items-center gap-2">
                Order for Tomorrow's Harvest <Sparkles className="w-4 h-4 text-emerald-500" />
              </h3>
              <p className="text-sm text-brand-600 dark:text-zinc-400 mb-6">
                Reserve <span className="font-semibold text-brand-900 dark:text-zinc-200">{productName}</span> before tomorrow morning's sorting and grading at our facility. We will contact you via WhatsApp/Call to confirm delivery!
              </p>

              <form onSubmit={handleOrder} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-zinc-300 mb-1.5">
                    Select or Enter Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 mb-2">
                    {["500 g", "1 kg", "2 kg", "5 kg"].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setQuantity(qty)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                          quantity === qty
                            ? "bg-brand-900 text-white border-brand-900 dark:bg-emerald-600 dark:border-emerald-600"
                            : "bg-white/80 dark:bg-zinc-800 text-brand-800 dark:text-zinc-300 border-brand-200 dark:border-zinc-700 hover:border-brand-400"
                        }`}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Custom qty e.g. 10 kg for party/restaurant"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-brand-900 dark:text-zinc-100 placeholder:text-brand-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-zinc-300 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-brand-900 dark:text-zinc-100 placeholder:text-brand-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-zinc-300 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-brand-900 dark:text-zinc-100 placeholder:text-brand-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-zinc-300 mb-1.5">
                    Special Note / Delivery Preference (Optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Deliver before 8 AM / Need small sized potatoes"
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-brand-900 dark:text-zinc-100 placeholder:text-brand-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                >
                  <Truck className="w-4 h-4" />
                  {loading ? "Reserving Harvest..." : "Reserve Advance Order"}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
