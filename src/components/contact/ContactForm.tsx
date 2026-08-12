"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="bg-white rounded-3xl border border-purple-100 p-8 space-y-4 shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      {sent && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Thank you! The FlashKart leadership team will respond promptly.
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-xs font-bold text-purple-950 mb-1.5">Full Name *</div>
          <input className="input" placeholder="Your name" required />
        </label>
        <label className="block">
          <div className="text-xs font-bold text-purple-950 mb-1.5">Phone Number *</div>
          <input className="input" placeholder="10-digit mobile" required />
        </label>
      </div>
      <label className="block">
        <div className="text-xs font-bold text-purple-950 mb-1.5">Email Address</div>
        <input type="email" className="input" placeholder="you@email.com" />
      </label>
      <label className="block">
        <div className="text-xs font-bold text-purple-950 mb-1.5">Inquiry Type *</div>
        <select className="input font-medium text-slate-700">
          <option>Hostel / PG Produce Supply</option>
          <option>Hotel / Restaurant Kitchen Supply</option>
          <option>Retail Shop Produce Supply</option>
          <option>FlashKart Shop Franchise Opportunity</option>
          <option>General Inquiries</option>
        </select>
      </label>
      <label className="block">
        <div className="text-xs font-bold text-purple-950 mb-1.5">Message / Requirements *</div>
        <textarea rows={4} className="input resize-none" placeholder="Tell us how we can help you with fresh produce or franchise inquiries..." required />
      </label>
      <button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-400 text-purple-950 font-bold rounded-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-md transition"
      >
        Send Message to FlashKart <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
