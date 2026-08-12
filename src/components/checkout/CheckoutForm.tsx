"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  MapPin,
  CalendarClock,
  CreditCard,
  Building,
  Store,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/store/shop";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Form = {
  name: string;
  phone: string;
  email: string;
  fulfillmentType: "partner_counter" | "hostel_mess" | "hotel_kitchen" | "shop_crate";
  address: string;
  city: string;
  pincode: string;
  slot: string;
  payment: "upi" | "cod" | "bank_transfer";
  coupon: string;
};

const slots = [
  { label: "Morning · 6:30 – 8:30 AM (Early Mess/Kitchen)", value: "morning-early" },
  { label: "Morning · 9:00 – 11:00 AM (Daily Market Slot)", value: "morning-regular" },
  { label: "Afternoon · 2:00 – 4:00 PM (Prep Shift)", value: "afternoon" },
  { label: "Evening · 5:00 – 7:00 PM (Dinner Shift)", value: "evening" },
];

export function CheckoutForm() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    defaultValues: { payment: "upi", slot: "morning-early", fulfillmentType: "partner_counter", city: "Gandhinagar" },
  });

  const coupon = watch("coupon");
  const couponOk = coupon?.toUpperCase() === "FLASH20" || coupon?.toUpperCase() === "FLASHKART10";
  const couponAmt = couponOk ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal - couponAmt);

  const onSubmit = () => {
    const id = `FLK-${Math.floor(Math.random() * 900000 + 100000)}`;
    setOrderId(id);
    setPlaced(true);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (placed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 text-[#067a46] grid place-items-center mb-6 border border-emerald-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-slate-900 font-black mb-3">Order Confirmed!</h1>
        <p className="text-slate-600 mb-6 text-sm md:text-base leading-relaxed">
          Thank you for choosing FlashKart. Your fresh produce order has been scheduled. Our Gandhinagar dispatch desk will coordinate fulfillment with your location.
        </p>
        <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-800 border border-slate-200 font-mono font-bold rounded-full px-5 py-2.5 text-sm mb-6">
          Order ID: #{orderId}
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="/track" className="bg-slate-800 hover:bg-slate-700 text-white rounded-full px-6 py-3 text-xs font-bold transition">
            Track Order Status
          </a>
          <a href="/shop" className="bg-[#067a46] hover:bg-[#046338] text-white rounded-full px-6 py-3 text-xs font-bold transition">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-8">
        <div className="text-xs text-[#067a46] font-bold mb-2"><Link href="/" className="hover:text-[#046338]">Home</Link> / Order Fulfillment</div>
        <h1 className="font-display text-3xl md:text-5xl font-black text-slate-900">Confirm Fresh Produce Order</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-8">
          {/* Fulfillment Details */}
          <section className="card-option12 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <Building className="w-5 h-5 text-[#067a46]" />
              <h2 className="font-display text-xl font-bold text-slate-900">Fulfillment & Location Details</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                <input {...register("name", { required: true })} className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number *</label>
                <input {...register("phone", { required: true })} className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none" placeholder="10-digit mobile" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Order Type / Category</label>
                <select {...register("fulfillmentType")} className="input font-medium text-slate-700 focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none">
                  <option value="partner_counter">Direct Partner Counter Pickup</option>
                  <option value="hostel_mess">Hostel / PG Mess Supply</option>
                  <option value="hotel_kitchen">Hotel / Commercial Kitchen Supply</option>
                  <option value="shop_crate">Retail Shop Crates</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">City / Sector in Gandhinagar</label>
                <input {...register("city")} defaultValue="Gandhinagar" className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none" placeholder="Gandhinagar (Sector 1-29 / Sargasan / Kudasan)" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Address / Campus / Shop Location *</label>
              <textarea {...register("address", { required: true })} rows={2} className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none" placeholder="Specific sector, hostel building name, hotel or shop landmark in Gandhinagar..." />
            </div>
          </section>

          {/* Time Slot */}
          <section className="card-option12 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="w-5 h-5 text-[#067a46]" />
              <h2 className="font-display text-xl font-bold text-slate-900">Preferred Supply Time Window</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {slots.map((s) => (
                <label key={s.value} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-[#067a46] cursor-pointer bg-slate-50 transition">
                  <input type="radio" value={s.value} {...register("slot")} className="accent-[#067a46]" />
                  <span className="text-xs font-bold text-slate-800">{s.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Payment Method */}
          <section className="card-option12 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#067a46]" />
              <h2 className="font-display text-xl font-bold text-slate-900">Payment Mode</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { id: "upi", label: "UPI / QR Code", desc: "Instant UPI on fulfillment" },
                { id: "cod", label: "Cash on Pickup / Supply", desc: "Direct cash settlement" },
                { id: "bank_transfer", label: "Institutional Invoicing", desc: "For Hostels & Hotels" },
              ].map((p) => (
                <label key={p.id} className="p-4 rounded-2xl border border-slate-200 hover:border-[#067a46] cursor-pointer bg-slate-50 transition">
                  <input type="radio" value={p.id} {...register("payment")} className="accent-[#067a46] mb-2" />
                  <div className="text-xs font-bold text-slate-800">{p.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary Box */}
        <div className="space-y-4">
          <div className="card-option12 p-6 sticky top-28">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Order Summary ({items.length} items)
            </h3>

            <div className="space-y-2.5 max-h-64 overflow-y-auto mb-4 pr-1">
              {items.map((it) => (
                <div key={`${it.productId}-${it.weight}`} className="flex justify-between text-xs text-slate-700">
                  <span className="truncate pr-2">{it.quantity} × {it.name} ({it.weight})</span>
                  <span className="font-bold text-slate-900 shrink-0">{formatINR(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="pt-3 border-t border-slate-100 mb-4">
              <div className="flex gap-2">
                <input
                  {...register("coupon")}
                  placeholder="Coupon code (e.g. FLASH20)"
                  className="input text-xs uppercase focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                />
              </div>
              {couponOk && (
                <div className="text-[11px] text-[#067a46] font-bold mt-1">✓ 10% Partner Discount Applied</div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatINR(subtotal)}</span>
              </div>
              {couponAmt > 0 && (
                <div className="flex justify-between text-[#067a46] font-bold">
                  <span>Discount</span>
                  <span>- {formatINR(couponAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={items.length === 0}
              className="w-full mt-6 bg-[#067a46] hover:bg-[#046338] disabled:bg-slate-300 text-white font-bold py-3.5 rounded-full text-sm shadow-md transition"
            >
              Confirm FlashKart Order
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
