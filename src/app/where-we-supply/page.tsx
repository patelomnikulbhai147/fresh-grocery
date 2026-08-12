"use client";
import { useState } from "react";
import {
  Building,
  Hotel,
  Store,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Percent,
} from "lucide-react";
import Link from "next/link";

export default function WhereWeSupplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [inquiryType, setInquiryType] = useState<"hostels" | "hotels" | "shops">("hostels");
  const [form, setForm] = useState({
    institutionName: "",
    contactPerson: "",
    mobile: "",
    email: "",
    dailyRequirement: "",
    address: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-purple-950 flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white py-16 md:py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="mx-auto max-w-7xl px-5 md:px-8 relative z-10 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Gandhinagar Direct Supply Hub
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Where FlashKart <span className="text-amber-400">Currently Supplies</span>
            </h1>
            <p className="mt-4 text-purple-100 text-base md:text-lg leading-relaxed">
              We specialize in reliable, high-grade daily morning supply of fresh vegetables and seasonal fruits for institutional messes, commercial hotel kitchens, and local retail stores.
            </p>
          </div>
        </section>

        {/* Direct Purchase Message Banner */}
        <section className="py-8 bg-purple-50 border-b border-purple-100">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="bg-white rounded-3xl border border-purple-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-amber-200">
                  Buy Fresh. Buy Direct.
                </div>
                <h3 className="font-display text-2xl font-bold text-purple-950">
                  Fresh Products. Better Quality. Direct From Us.
                </h3>
                <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                  Get fresh vegetables and seasonal fruits directly from FlashKart through our partner hostels, PGs, hotels, and retail shops across Gandhinagar.
                </p>
              </div>
              <Link
                href="/shop"
                className="bg-amber-500 hover:bg-amber-400 text-purple-950 font-bold px-6 py-3 rounded-full text-sm transition shadow-sm shrink-0 flex items-center gap-2"
              >
                Browse Produce Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Detailed 3 Supply Sections */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8 space-y-16">
            {/* 1. Hostels & PGs */}
            <div id="hostels-pgs" className="grid lg:grid-cols-2 gap-10 items-center scroll-mt-28">
              <div className="bg-white rounded-3xl border border-purple-100 p-8 md:p-10 shadow-soft">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center mb-6">
                  <Building className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                  Combined Segment
                </span>
                <h2 className="font-display text-3xl font-extrabold text-purple-950 mt-1 mb-3">
                  Hostels & PGs Produce Supply
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Regular, reliable morning supply of fresh vegetables and seasonal fruits for student hostels, private PGs, university messes, and resident accommodation kitchens.
                </p>
                <div className="space-y-3">
                  {[
                    "Bulk vegetable sacks (Potatoes, Onions, Tomatoes, Cabbages, Cauliflowers)",
                    "Crisp salad greens, cucumbers, carrots, and daily green chillies",
                    "Direct counter setup option where students & residents can buy fresh produce directly",
                    "Transparent weekly/monthly invoicing with verified quality checks",
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-3xl p-8 text-white shadow-lift">
                <h3 className="font-display text-2xl font-bold mb-3">Hostel Mess Manager or PG Owner?</h3>
                <p className="text-purple-200 text-sm leading-relaxed mb-6">
                  Save on kitchen procurement hassle and raw-material wastage with FlashKart's direct farm delivery at competitive wholesale pricing.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+916352856495"
                    className="bg-amber-500 hover:bg-amber-400 text-purple-950 font-bold px-6 py-3 rounded-full text-xs transition text-center"
                  >
                    Call Kaushik Patel (6352856495)
                  </a>
                  <a
                    href="#supply-inquiry"
                    onClick={() => setInquiryType("hostels")}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full text-xs text-center border border-white/20"
                  >
                    Request Supply Quotation
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Hotels */}
            <div id="hotels" className="grid lg:grid-cols-2 gap-10 items-center scroll-mt-28">
              <div className="order-2 lg:order-1 bg-gradient-to-br from-amber-700 to-amber-950 rounded-3xl p-8 text-white shadow-lift">
                <h3 className="font-display text-2xl font-bold mb-3">Executive Chef or F&B Manager?</h3>
                <p className="text-amber-100 text-sm leading-relaxed mb-6">
                  Experience consistent quality grading, zero bruises, and strict delivery timelines for all your banquet, restaurant, and breakfast service menus.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+919773271029"
                    className="bg-purple-950 hover:bg-purple-900 text-white font-bold px-6 py-3 rounded-full text-xs transition text-center"
                  >
                    Call Om Patel (9773271029)
                  </a>
                  <a
                    href="#supply-inquiry"
                    onClick={() => setInquiryType("hotels")}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full text-xs text-center border border-white/20"
                  >
                    Get Hotel Rate Sheet
                  </a>
                </div>
              </div>
              <div className="order-1 lg:order-2 bg-white rounded-3xl border border-purple-100 p-8 md:p-10 shadow-soft">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-6">
                  <Hotel className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">
                  Commercial Kitchens
                </span>
                <h2 className="font-display text-3xl font-extrabold text-purple-950 mt-1 mb-3">
                  Hotels & Kitchen Supply
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  High-grade vegetables and seasonal fruits supplied directly to hotel kitchens, fine-dining restaurants, and banquet caterers.
                </p>
                <div className="space-y-3">
                  {[
                    "Hand-graded size consistency for precise chef preparations",
                    "Seasonal fruit crates (Kesar Mangoes, Oranges, Apples, Bananas, Papayas)",
                    "Early morning scheduled kitchen delivery before 7:00 AM",
                    "GST invoices with dedicated account support",
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Shops */}
            <div id="shops" className="grid lg:grid-cols-2 gap-10 items-center scroll-mt-28">
              <div className="bg-white rounded-3xl border border-purple-100 p-8 md:p-10 shadow-soft">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-6">
                  <Store className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                  Retail Partner Network
                </span>
                <h2 className="font-display text-3xl font-extrabold text-purple-950 mt-1 mb-3">
                  Local Retail Shops & Marts Supply
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Supplying local vegetable shops, retail marts, and general stores directly from our sorting hub with daily freshness and competitive margins.
                </p>
                <div className="space-y-3">
                  {[
                    "Eliminate daily mandi early-morning trips and bidding stress",
                    "Clean, sorted crates ready for immediate retail display",
                    "Direct farm-rate margins ensuring higher store profitability",
                    "Franchise shop upgrade opportunities available",
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-3xl p-8 text-white shadow-lift">
                <h3 className="font-display text-2xl font-bold mb-3">Retail Shopkeeper in Gandhinagar?</h3>
                <p className="text-emerald-100 text-sm leading-relaxed mb-6">
                  Upgrade your store produce with FlashKart daily supply or convert your outlet into a branded FlashKart Franchise shop.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/franchise"
                    className="bg-amber-500 hover:bg-amber-400 text-purple-950 font-bold px-6 py-3 rounded-full text-xs transition text-center"
                  >
                    View Franchise Details
                  </Link>
                  <a
                    href="#supply-inquiry"
                    onClick={() => setInquiryType("shops")}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full text-xs text-center border border-white/20"
                  >
                    Apply for Shop Supply
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Supply Inquiry Form */}
        <section id="supply-inquiry" className="py-16 md:py-24 bg-white border-t border-purple-100">
          <div className="mx-auto max-w-4xl px-5 md:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="text-xs uppercase font-bold tracking-[0.24em] text-purple-700 mb-2">
                Supply Onboarding
              </div>
              <h2 className="font-display text-3xl font-extrabold text-purple-950">
                Request Daily Produce Supply
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Tell us about your institution or business and our team will get in touch with rate cards.
              </p>
            </div>

            <div className="bg-[#fafaf9] rounded-3xl border border-purple-100 p-8 shadow-soft">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-purple-950 mb-2">
                    Supply Request Received!
                  </h3>
                  <p className="text-slate-600 text-sm max-w-sm mx-auto">
                    Thank you, {form.contactPerson}. Our supply managers Kaushik Patel / Om Patel will reach out with the daily price sheet.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-xs font-bold text-purple-700 underline"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2 p-1.5 bg-purple-50 rounded-2xl border border-purple-100 max-w-md mx-auto mb-4">
                    {(["hostels", "hotels", "shops"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setInquiryType(type)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition capitalize ${
                          inquiryType === type
                            ? "bg-purple-950 text-white shadow-sm"
                            : "text-purple-800 hover:bg-purple-100/60"
                        }`}
                      >
                        {type === "hostels" ? "Hostels & PGs" : type === "hotels" ? "Hotels" : "Retail Shops"}
                      </button>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-purple-950 mb-1.5">Organization / Shop Name *</label>
                      <input
                        required
                        type="text"
                        value={form.institutionName}
                        onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                        placeholder="e.g. Infocity Student PG / Royal Hotel"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-950 mb-1.5">Contact Person *</label>
                      <input
                        required
                        type="text"
                        value={form.contactPerson}
                        onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                        placeholder="Your name"
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-purple-950 mb-1.5">Mobile Number *</label>
                      <input
                        required
                        type="tel"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-950 mb-1.5">Estimated Daily Quantity</label>
                      <input
                        type="text"
                        value={form.dailyRequirement}
                        onChange={(e) => setForm({ ...form, dailyRequirement: e.target.value })}
                        placeholder="e.g. 30 kg / day, 20 crates / week"
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-950 mb-1.5">Location / Sector in Gandhinagar</label>
                    <textarea
                      rows={2}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Sector number, landmark or locality..."
                      className="input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-purple-950 font-bold py-3.5 rounded-full text-sm transition shadow-md"
                  >
                    Send Supply Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
