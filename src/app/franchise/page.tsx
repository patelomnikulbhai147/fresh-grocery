"use client";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Store,
  Truck,
  ShieldCheck,
  TrendingUp,
  Users,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { FlashKartLogo } from "@/components/layout/FlashKartLogo";

export default function FranchisePage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "Gandhinagar",
    locationArea: "",
    experience: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative bg-gradient-to-br from-[#04502d] via-[#067a46] to-[#04502d] text-white py-16 md:py-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ea580c]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-7xl px-5 md:px-8 relative z-10 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white border border-white/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Start Your Own FlashKart Shop
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Grow With <span className="text-[#ea580c]">FlashKart</span>
            </h1>
            <p className="mt-4 text-emerald-50 text-base md:text-lg leading-relaxed">
              Become a FlashKart franchise partner and build your own fresh vegetables & seasonal fruits business with our established brand identity, direct supply network, and operational guidance.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="#inquiry-form"
                className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold px-7 py-3.5 rounded-full text-sm transition shadow-glow-cta flex items-center gap-2"
              >
                Apply for Franchise <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="tel:+919773271029"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-full text-sm border border-white/20 transition"
              >
                Call Om Patel (9773271029)
              </a>
            </div>
          </div>
        </section>

        {/* 7 Key Benefits Grid */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="text-xs uppercase font-bold tracking-[0.24em] text-[#067a46] mb-2">
                Why Franchise With Us
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900">
                Seven Solid Reasons to Partner with FlashKart
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: "Established Brand Identity",
                  desc: "Start with recognized FlashKart branding, logo assets, signboard designs, and marketing trust.",
                },
                {
                  icon: Truck,
                  title: "Fresh Product Supply",
                  desc: "Guaranteed daily morning supply of fresh vegetables and seasonal fruits directly to your shop location.",
                },
                {
                  icon: ShieldCheck,
                  title: "Quality-Focused Sourcing",
                  desc: "Residue-checked, sorted, and graded farm produce ensuring high customer satisfaction and low shrinkage.",
                },
                {
                  icon: Users,
                  title: "Business Guidance",
                  desc: "End-to-end guidance on shop layout, stock rotation, display techniques, and pricing strategies.",
                },
                {
                  icon: Store,
                  title: "Attractive Shop Concept",
                  desc: "Clean, inviting, modern shop visual presentation that stands out from typical local vegetable stalls.",
                },
                {
                  icon: Sparkles,
                  title: "Growth Opportunity",
                  desc: "Expand to multiple counters and cater to local hostels, PGs, and resident societies in your vicinity.",
                },
                {
                  icon: HelpCircle,
                  title: "Ongoing Support",
                  desc: "Direct access to founders Kaushik Patel and Om Patel for operational queries, logistics, and supply adjustments.",
                },
              ].map((b, i) => (
                <div
                  key={b.title}
                  className="card-option12 p-7 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#067a46] flex items-center justify-center mb-4 border border-emerald-100">
                      <b.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{b.title}</h3>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400">
                    Benefit 0{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step-by-Step Onboarding */}
        <section className="py-14 md:py-18 bg-emerald-50/50 border-y border-emerald-100">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="text-xs uppercase font-bold tracking-[0.24em] text-[#067a46] mb-2">
                Simple Onboarding
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900">
                How to Open Your FlashKart Shop
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Submit Inquiry", desc: "Fill the form or call our team with your location preference." },
                { step: "02", title: "Location Review", desc: "We evaluate footfall, resident density, and proximity to hostels/shops." },
                { step: "03", title: "Setup & Branding", desc: "Receive FlashKart shop concepts, racks layout, and branding support." },
                { step: "04", title: "Daily Supply Begins", desc: "Start receiving morning farm-fresh crates and commence retail sales." },
              ].map((s) => (
                <div key={s.step} className="card-option12 p-6">
                  <div className="font-mono text-2xl font-black text-[#ea580c] mb-2">{s.step}</div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry Form Section */}
        <section id="inquiry-form" className="py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <div className="grid lg:grid-cols-5 gap-10">
              {/* Left Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="text-xs uppercase font-bold tracking-[0.24em] text-[#067a46] mb-2">
                    Franchise Desk
                  </div>
                  <h2 className="font-display text-3xl font-extrabold text-slate-900 leading-tight">
                    Interested in a FlashKart Franchise?
                  </h2>
                  <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                    Speak directly with our leadership team. We are currently reviewing franchise locations across Gandhinagar and surrounding Gujarat regions.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <Phone className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500">Om Patel (Operations & Franchise)</div>
                      <a href="tel:+919773271029" className="font-bold text-slate-900 text-sm hover:underline">
                        +91 9773271029
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <Phone className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500">Kaushik Patel (Procurement & Sales)</div>
                      <a href="tel:+916352856495" className="font-bold text-slate-900 text-sm hover:underline">
                        +91 6352856495
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <Mail className="w-5 h-5 text-[#067a46] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500">Official Email</div>
                      <a href="mailto:flashkart.co@gmail.com" className="font-bold text-slate-900 text-sm hover:underline">
                        flashkart.co@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <MapPin className="w-5 h-5 text-[#067a46] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500">Headquarters</div>
                      <div className="font-bold text-slate-900 text-sm">Gandhinagar, Gujarat, India</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Form */}
              <div className="lg:col-span-3">
                <div className="card-option12 p-8">
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#067a46] flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">
                        Franchise Inquiry Received!
                      </h3>
                      <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                        Thank you, {formData.name}. Our franchise coordinator Om Patel (+91 9773271029) will contact you shortly with location evaluation details.
                      </p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="mt-6 text-xs font-bold text-[#067a46] underline"
                      >
                        Submit another inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <h3 className="font-display text-xl font-bold text-slate-900 mb-4">
                        Franchise Application Form
                      </h3>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Full Name *</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Anand Patel"
                          className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number *</label>
                          <input
                             required
                            type="tel"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            placeholder="10-digit mobile number"
                            className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="name@gmail.com"
                            className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">City / Town</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Gandhinagar / Ahmedabad"
                            className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Proposed Area / Sector</label>
                          <input
                            type="text"
                            value={formData.locationArea}
                            onChange={(e) => setFormData({ ...formData, locationArea: e.target.value })}
                            placeholder="e.g. Sector 21, Sargasan, Kudasan"
                            className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Retail / Business Experience</label>
                        <select
                          value={formData.experience}
                          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                          className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                        >
                          <option value="">Select experience level</option>
                          <option value="Running existing shop">Running an existing grocery/kirana shop</option>
                          <option value="New entrepreneur">New entrepreneur looking to start first shop</option>
                          <option value="Hostel/mess vendor">Hostel/Mess contractor</option>
                          <option value="Investor">Investor looking for commercial partner</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Message / Requirements</label>
                        <textarea
                          rows={3}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tell us about your proposed shop size or location details..."
                          className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#067a46] hover:bg-[#046338] text-white font-bold py-3.5 rounded-full text-sm transition shadow-md"
                      >
                        Submit Franchise Inquiry
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
