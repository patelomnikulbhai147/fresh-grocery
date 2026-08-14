"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lock, Loader2, Tag, Clock, Bell } from "lucide-react";

/* ─── WhatsApp SVG ─────────────────────────────────────────────────────── */
function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.123 1.534 5.855L.057 23.885a.75.75 0 00.921.921l6.03-1.477A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.958 9.958 0 01-5.145-1.424l-.369-.22-3.825.937.954-3.717-.241-.383A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

/* ─── Data ─────────────────────────────────────────────────────────────── */
const COUNTRY_CODES = [
  { code: "+91",  flag: "🇮🇳" },
  { code: "+1",   flag: "🇺🇸" },
  { code: "+44",  flag: "🇬🇧" },
  { code: "+61",  flag: "🇦🇺" },
  { code: "+971", flag: "🇦🇪" },
  { code: "+65",  flag: "🇸🇬" },
];

const BENEFITS = [
  { icon: Tag,   title: "Heavy Discounts",  desc: "Receive only today's biggest offers",       color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { icon: Clock, title: "Daily Reminder",   desc: "Get notified before deals expire",            color: "text-blue-600 bg-blue-50 border-blue-100" },
  { icon: Bell,  title: "Instant Alerts",   desc: "Be the first to know about flash sales",     color: "text-violet-600 bg-violet-50 border-violet-100" },
];

/* ─── Component ────────────────────────────────────────────────────────── */
export function WhatsAppSubscription() {
  const [countryCode, setCountryCode] = useState("+91");
  const [phone,       setPhone]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");
  const [focused,     setFocused]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch("/api/whatsapp/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: digits, countryCode }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setPhone("");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="my-8"
    >
      {/* ── Premium white card ── */}
      <div
        className="bg-white rounded-[24px] border border-[#F1F1F1] overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}
      >
        <AnimatePresence mode="wait">

          {/* ────────────── SUCCESS ────────────── */}
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center text-center px-8 py-14"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-lg"
                style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="font-display text-2xl font-bold text-[#111111] mb-2">
                You&apos;re subscribed! 🎉
              </h3>
              <p className="text-[#6B7280] max-w-sm leading-relaxed text-sm">
                We&apos;ll send today&apos;s biggest discounts on WhatsApp before midnight.
                Get ready for amazing deals!
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 text-xs text-[#9CA3AF] hover:text-[#6B7280] underline underline-offset-4 transition"
              >
                Subscribe another number
              </button>
            </motion.div>

          ) : (

            /* ────────────── FORM ────────────── */
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Top section */}
              <div className="px-7 pt-8 pb-7 md:px-10 md:pt-10 md:pb-8">

                {/* Header row */}
                <div className="flex items-start gap-5 mb-8">
                  {/* WhatsApp icon badge */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                    style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}
                  >
                    <WaIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3
                      className="font-display font-bold leading-snug text-xl md:text-2xl"
                      style={{ color: "#111111" }}
                    >
                      Never miss today&apos;s biggest deals!
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                      Subscribe with WhatsApp and receive today&apos;s highest discounts before midnight.
                    </p>
                  </div>
                </div>

                {/* Input row */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div
                    className="flex rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                      border: focused ? "1.5px solid #25D366" : "1.5px solid #E5E7EB",
                      boxShadow: focused ? "0 0 0 4px rgba(37,211,102,0.12)" : "none",
                    }}
                  >
                    {/* Country code */}
                    <div className="relative shrink-0 border-r" style={{ borderColor: focused ? "#25D366" : "#E5E7EB" }}>
                      <select
                        id="wa-country-code"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="appearance-none h-14 sm:h-16 pl-3 pr-7 sm:pl-4 sm:pr-8 min-w-[84px] sm:min-w-[100px] bg-[#FAFAFA] text-[#111111] text-sm font-semibold focus:outline-none cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Phone input */}
                    <input
                      id="wa-phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => { setError(""); setPhone(e.target.value); }}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="Enter WhatsApp number"
                      maxLength={15}
                      className="flex-1 min-w-0 h-14 sm:h-16 px-3.5 sm:px-5 bg-white text-[#111111] placeholder:text-[#9CA3AF] text-sm focus:outline-none"
                    />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-500 text-xs font-medium pl-1 flex items-center gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Subscribe button */}
                  <motion.button
                    id="wa-subscribe-btn"
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { y: -2, boxShadow: "0 12px 32px rgba(37,211,102,0.35)" } : {}}
                    whileTap={!loading ? { y: 0 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-full h-14 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
                    style={{
                      background: loading ? "#128C7E" : "linear-gradient(135deg,#25D366,#128C7E)",
                      boxShadow: "0 8px 24px rgba(37,211,102,0.25)",
                    }}
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing...</>
                    ) : (
                      <><WaIcon className="w-4 h-4" /> Subscribe on WhatsApp</>
                    )}
                  </motion.button>
                </form>

                {/* Privacy */}
                <p className="flex items-center justify-center gap-1.5 mt-4 text-xs" style={{ color: "#9CA3AF" }}>
                  <Lock className="w-3 h-3 shrink-0" />
                  We respect your privacy. No spam. Only important discount alerts.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#F1F1F1] to-transparent mx-7 md:mx-10" />

              {/* Benefit cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-7 pt-6 pb-8 md:px-10 md:pb-10">
                {BENEFITS.map((b) => (
                  <motion.div
                    key={b.title}
                    whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="flex items-start gap-4 bg-white border rounded-[18px] p-5 cursor-default"
                    style={{
                      borderColor: "#F1F1F1",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 ${b.color}`}>
                      <b.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "#111111" }}>{b.title}</div>
                      <div className="text-xs mt-1 leading-snug" style={{ color: "#6B7280" }}>{b.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
