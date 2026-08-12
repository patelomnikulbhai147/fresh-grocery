import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/ContactForm";
import { Mail, Phone, MapPin, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact FlashKart — Fresh Vegetables & Seasonal Fruits",
  description:
    "Contact FlashKart founders Kaushik Patel and Om Patel for produce supply to hostels, hotels, shops, or franchise partnership in Gandhinagar, Gujarat.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 md:px-8 py-14 md:py-20">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.24em] font-bold text-[#067a46] mb-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-[#ea580c]" />
            Get In Touch
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-slate-900 text-balance leading-tight">
            Connect directly with <span className="italic text-[#067a46]">FlashKart leadership</span>.
          </h1>
          <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
            Whether you manage a hostel mess, a hotel kitchen, a retail shop, or want to explore our Franchise partnership in Gujarat, we are ready to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <ContactForm />

          <div className="space-y-4">
            <div className="card-option12 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 grid place-items-center text-slate-800 shrink-0 border border-slate-200">
                <Phone className="w-5 h-5 text-[#ea580c]" />
              </div>
              <div>
                <div className="text-xs uppercase font-bold tracking-widest text-slate-500">Kaushik Patel</div>
                <div className="font-display text-xl font-bold text-slate-900 mt-0.5">
                  <a href="tel:+916352856495" className="hover:text-[#ea580c] transition">
                    +91 6352856495
                  </a>
                </div>
                <div className="text-xs text-[#067a46] font-semibold mt-0.5">Produce Sourcing & Institutional Sales</div>
              </div>
            </div>

            <div className="card-option12 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 grid place-items-center text-slate-800 shrink-0 border border-slate-200">
                <Phone className="w-5 h-5 text-[#ea580c]" />
              </div>
              <div>
                <div className="text-xs uppercase font-bold tracking-widest text-slate-500">Om Patel</div>
                <div className="font-display text-xl font-bold text-slate-900 mt-0.5">
                  <a href="tel:+919773271029" className="hover:text-[#ea580c] transition">
                    +91 9773271029
                  </a>
                </div>
                <div className="text-xs text-[#067a46] font-semibold mt-0.5">Supply Operations & Franchise Desk</div>
              </div>
            </div>

            <div className="card-option12 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 grid place-items-center text-slate-800 shrink-0 border border-slate-200">
                <Mail className="w-5 h-5 text-[#067a46]" />
              </div>
              <div>
                <div className="text-xs uppercase font-bold tracking-widest text-slate-500">Official Email</div>
                <div className="font-display text-lg font-bold text-slate-900 mt-0.5">
                  <a href="mailto:flashkart.co@gmail.com" className="hover:text-[#ea580c] transition break-all">
                    flashkart.co@gmail.com
                  </a>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Official support & business queries</div>
              </div>
            </div>

            <div className="card-option12 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 grid place-items-center text-slate-800 shrink-0 border border-slate-200">
                <MapPin className="w-5 h-5 text-[#067a46]" />
              </div>
              <div>
                <div className="text-xs uppercase font-bold tracking-widest text-slate-500">Headquarters</div>
                <div className="font-display text-lg font-bold text-slate-900 mt-0.5">Gandhinagar, Gujarat, India</div>
                <div className="text-xs text-slate-500 mt-0.5">Central sorting hub and distribution network</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
