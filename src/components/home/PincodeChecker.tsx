"use client";
import { useState } from "react";
import { MapPin, Sparkles, Store, Building, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PincodeChecker() {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "no">("idle");

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) return;

    setStatus("loading");
    setTimeout(() => {
      const pinNum = parseInt(pin, 10);
      
      // Gandhinagar Sectors 1-29: 382001 to 382030, Kudasan/Sargasan: 382421
      const isGandhinagarSector = pinNum >= 382001 && pinNum <= 382030;
      const isSargasanOrKudasan = pinNum === 382421;

      if (isGandhinagarSector || isSargasanOrKudasan) {
        setStatus("ok");
      } else {
        setStatus("no");
      }
    }, 600);
  };

  return (
    <section className="py-12 md:py-16 bg-white border-b border-purple-50">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="relative rounded-[36px] bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white p-8 md:p-12 overflow-hidden shadow-soft border border-purple-800/40">
          <div aria-hidden className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
          <div aria-hidden className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />
          
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Direct Supply Network · Gandhinagar Hub
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-extrabold leading-tight">
                Check FlashKart Supply in Your Area
              </h3>
              <div className="text-purple-200 mt-3 text-sm leading-relaxed max-w-md">
                <p>FlashKart directly supplies fresh vegetables & seasonal fruits to hostels, PGs, hotels, and retail shops across Gandhinagar.</p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="font-bold text-amber-300">Active Supply Sectors & Hubs:</div>
                  <div className="pl-3 text-purple-100">• Sector 1 to Sector 29</div>
                  <div className="pl-3 text-purple-100">• Sargasan & Kudasan Hubs</div>
                  <div className="pl-3 text-purple-100">• Infocity Institutional Belt</div>
                </div>
              </div>
            </div>

            <div>
              <form onSubmit={handleCheck} className="flex items-center bg-white rounded-2xl p-1.5 shadow-lift">
                <MapPin className="w-4 h-4 text-purple-800 ml-3 shrink-0" />
                <input
                  type="text"
                  pattern="\d{6}"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setStatus("idle");
                  }}
                  placeholder="Enter 6-digit Gandhinagar pincode"
                  className="flex-1 bg-transparent outline-none px-3 py-3 text-purple-950 placeholder:text-purple-400 text-sm min-w-0 font-medium"
                />
                <button
                  type="submit"
                  disabled={status === "loading" || pin.length !== 6}
                  className="bg-amber-500 hover:bg-amber-400 disabled:bg-purple-200 text-purple-950 text-sm font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shrink-0 shadow-sm"
                >
                  {status === "loading" ? "Checking..." : "Check Supply"}
                </button>
              </form>

              <AnimatePresence mode="wait">
                {status === "ok" && (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-start gap-2.5 text-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-200">Active Supply Zone!</div>
                      <div className="text-xs text-purple-100 mt-0.5">
                        FlashKart supplies partner hostels, hotels, and retail shops in this area. Direct purchases and institutional supplies are active.
                      </div>
                    </div>
                  </motion.div>
                )}
                {status === "no" && (
                  <motion.div
                    key="no"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-start gap-2.5 text-sm"
                  >
                    <XCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-200">Expanding Network Soon</div>
                      <div className="text-xs text-purple-100 mt-0.5">
                        We currently operate in Gandhinagar Sectors 1-29, Sargasan, and Kudasan. Interested in a supply partnership or franchise? Contact us!
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
