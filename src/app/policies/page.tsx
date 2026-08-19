import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileText, Truck, RotateCcw, XCircle, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Policies — Privacy, Terms, Delivery & Refunds",
  description:
    "FlashKart policies: privacy policy, terms of service, delivery policy, returns & refunds, and order cancellation for fresh produce supply in Gandhinagar.",
};

const sections = [
  {
    id: "privacy",
    icon: Lock,
    title: "Privacy Policy",
    body: [
      "FlashKart collects only the information needed to fulfil your order — your name, mobile number, delivery address, and order details. We use it to process deliveries, provide support, and share order updates.",
      "We do not sell your personal information to third parties. Contact and address details are shared only with our own delivery and dispatch team to complete your order.",
      "You can request correction or deletion of your saved addresses and account details at any time by contacting us.",
    ],
  },
  {
    id: "terms",
    icon: FileText,
    title: "Terms of Service",
    body: [
      "By placing an order on FlashKart you confirm that the details you provide are accurate and that the delivery address falls within our current serviceable areas (Gandhinagar and parts of Ahmedabad).",
      "Prices, product availability, and delivery/handling charges are shown at checkout and may change based on daily market rates and stock. The amount confirmed at checkout is the amount payable.",
      "FlashKart supplies fresh vegetables and seasonal fruits for both retail (home) customers and business / B2B partners such as hostels, PGs, hotels, and shops.",
    ],
  },
  {
    id: "delivery",
    icon: Truck,
    title: "Delivery Policy",
    body: [
      "We deliver fresh produce daily within our serviceable pincodes. Retail orders are fulfilled as instant delivery; business / B2B orders can be scheduled for a preferred date and time window.",
      "Delivery, handling, and convenience charges (where applicable) are shown transparently at checkout. Free delivery may apply above the qualifying order value shown in your basket.",
      "If a delivery cannot be completed due to an incorrect address or unavailability at the location, our team will contact you to reschedule.",
    ],
  },
  {
    id: "returns",
    icon: RotateCcw,
    title: "Returns & Refunds",
    body: [
      "Because our produce is fresh and perishable, we ask you to check your order at the time of delivery. If any item is damaged, spoiled, or incorrect, report it to our team within 24 hours with a photo.",
      "Approved issues are resolved with a replacement on your next delivery or a refund/credit for the affected item.",
      "Refunds for prepaid orders are processed to the original payment method within a few working days once approved.",
    ],
  },
  {
    id: "cancellation",
    icon: XCircle,
    title: "Cancellation Policy",
    body: [
      "You can cancel an order before it is dispatched at no charge. Once an order is out for delivery it can no longer be cancelled.",
      "For scheduled business / B2B supply, please inform us as early as possible so we can adjust the day's dispatch.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#04502d] via-[#067a46] to-[#04502d] text-white py-16 md:py-24">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ea580c]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-5 md:px-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.24em] text-white mb-3 bg-[#ea580c] px-3.5 py-1 rounded-full shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Our Policies
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight text-balance">
              Clear, Fair <span className="text-[#ea580c]">Policies.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-emerald-50 max-w-2xl mx-auto leading-relaxed">
              How FlashKart handles your data, orders, delivery, refunds, and cancellations — written plainly.
            </p>
          </div>
        </section>

        {/* Quick nav */}
        <section className="py-8 border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-5xl px-5 md:px-8 flex flex-wrap gap-2.5 justify-center">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#067a46] bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 px-3.5 py-2 rounded-full transition"
              >
                <s.icon className="w-3.5 h-3.5" /> {s.title}
              </a>
            ))}
          </div>
        </section>

        {/* Sections */}
        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-4xl px-5 md:px-8 space-y-10">
            {sections.map((s) => (
              <div key={s.id} id={s.id} className="card-option12 p-7 md:p-9 scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-11 h-11 rounded-2xl bg-emerald-50 grid place-items-center text-[#067a46] border border-emerald-100 shrink-0">
                    <s.icon className="w-5 h-5" />
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900">{s.title}</h2>
                </div>
                <div className="space-y-3">
                  {s.body.map((p, i) => (
                    <p key={i} className="text-slate-600 text-sm md:text-[15px] leading-relaxed">{p}</p>
                  ))}
                </div>
              </div>
            ))}

            <div className="text-center text-xs text-slate-500 pt-2">
              Questions about any policy?{" "}
              <Link href="/contact" className="font-bold text-[#067a46] hover:text-[#046338] underline underline-offset-4">
                Contact our team
              </Link>
              .
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
