"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
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
import { useAdminStore, type AdminOrder } from "@/store/adminStore";
import { useCustomerAuth } from "@/store/customerAuth";
import { useAddressBook } from "@/store/addresses";
import { cities } from "@/data/catalog";
import { computeOrderCharges, freeDeliveryHint } from "@/lib/fees";

/** Serviceability from the live city configuration (same source as the pincode checker). */
const isServiceablePincode = (pin: string): boolean =>
  cities.some((c) => c.live && (c.pincode || []).some((prefix) => pin.startsWith(prefix)));

/** Pack weight in grams for a cart line — falls back to parsing the label
 *  ("500 g", "1 kg") for carts persisted before grams were stored. */
const lineGrams = (weight: string, grams?: number): number => {
  if (grams && grams > 0) return Math.round(grams);
  const m = /([\d.]+)\s*(kg|g)/i.exec(weight || "");
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return Math.round(m[2].toLowerCase() === "kg" ? n * 1000 : n);
};

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
  const [stockError, setStockError] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Form>({
    defaultValues: { payment: "cod", slot: "morning-early", fulfillmentType: "partner_counter", city: "Gandhinagar" },
  });

  // ── Saved addresses (per logged-in user) ──
  const { user, isAuthenticated } = useCustomerAuth();
  const addressBook = useAddressBook();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const savedAddresses = mounted && isAuthenticated && user?.mobile ? addressBook.forUser(user.mobile) : [];
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);

  // Default address prefills the form once on mount
  useEffect(() => {
    if (!mounted || !isAuthenticated || !user?.mobile) return;
    const def = addressBook.defaultFor(user.mobile);
    if (def && !selectedAddrId) applyAddress(def.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const pincodeValue = (watch("pincode") || "").trim();

  const applyAddress = (id: string) => {
    const a = addressBook.addresses.find((x) => x.id === id);
    if (!a) return;
    setSelectedAddrId(id);
    setValue("name", a.name);
    setValue("phone", a.phone);
    setValue("address", `${a.addressLine}${a.area ? `, ${a.area}` : ""}${a.landmark ? ` (near ${a.landmark})` : ""}`);
    setValue("city", a.city);
    setValue("pincode", a.pincode);
  };

  // Coupon validation against the real admin-managed coupon system (no hardcoded codes)
  const coupons = useAdminStore((s) => s.coupons);
  const placeCustomerOrder = useAdminStore((s) => s.placeCustomerOrder);
  const coupon = watch("coupon");
  const code = (coupon || "").trim().toUpperCase();
  const matchedCoupon =
    code.length > 0
      ? coupons.find(
          (c) =>
            c.code.toUpperCase() === code &&
            c.status === "Active" &&
            new Date(c.expiryDate) >= new Date(new Date().toDateString()) &&
            subtotal >= (c.minCartValue || 0)
        )
      : undefined;
  const couponOk = !!matchedCoupon;
  const couponAmt = matchedCoupon
    ? matchedCoupon.type === "Percentage Discount"
      ? Math.min(
          Math.round((subtotal * matchedCoupon.discountValue) / 100),
          matchedCoupon.maxDiscountCap || Number.MAX_SAFE_INTEGER
        )
      : Math.min(matchedCoupon.discountValue, matchedCoupon.maxDiscountCap || matchedCoupon.discountValue)
    : 0;

  // Fee structure — single source of truth (lib/fees). The server re-computes
  // the SAME way and is authoritative on the payable amount; this is display.
  const charges = computeOrderCharges(subtotal, couponAmt);
  const total = charges.total;
  const freeHint = freeDeliveryHint(subtotal);

  const onSubmit = async (data: Form) => {
    if (items.length === 0) return;
    // Serviceability: pincode must be inside a live delivery area
    if (!isServiceablePincode(data.pincode.trim())) {
      setStockError(`We are currently not providing delivery in pincode ${data.pincode.trim()}. Serviceable areas: Gandhinagar (3820xx / 3824xx) and Ahmedabad (3800xx).`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStockError("");

    const id = `FLK-${Math.floor(Math.random() * 900000 + 100000)}`;
    const now = new Date();
    const order: AdminOrder = {
      id,
      date: `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
      createdAt: now.toISOString(),
      // Link the order to the logged-in account (delivery contact may differ)
      customerId: user?.id,
      customerName: data.name,
      customerEmail: data.email || "",
      customerPhone: data.phone,
      shippingAddress: `${data.address}, ${data.city} - ${data.pincode}`,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        image: i.image,
        weight: i.weight,
        price: i.price, // purchase-time price preserved on the order
        quantity: i.quantity,
      })),
      subtotal,
      discount: couponAmt,
      deliveryFee: charges.deliveryFee,
      handlingFee: charges.handlingFee,
      convenienceFee: charges.convenienceFee,
      tax: 0,
      total,
      status: "Pending",
      paymentStatus: "Pending",
      paymentMethod:
        data.payment === "cod" ? "Cash on Delivery" : data.payment === "upi" ? "UPI" : "Wallet",
      deliverySlot: slots.find((s) => s.value === data.slot)?.label || data.slot,
      invoiceNo: `INV-${id}`,
    };

    // BACKEND gate first: the server re-validates every line against the
    // authoritative product database (product still customer-visible, enough
    // shared weight stock), deducts the weight atomically, and stores the
    // order server-side so the admin panel sees it from any device. An
    // inactive product lingering in an old cart is rejected HERE.
    let gate: any = null;
    try {
      const res = await fetch("/api/checkout/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            grams: lineGrams(i.weight, i.grams),
            quantity: i.quantity,
            label: i.weight,
          })),
          order,
        }),
      });
      gate = await res.json().catch(() => null);
      if (!res.ok || !gate?.success) {
        setStockError(gate?.message || "Could not verify stock right now. Please try again.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    } catch {
      setStockError("Could not verify stock right now. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // The SERVER is authoritative on the payable amount — overwrite the order's
    // money fields with the server-computed breakdown before recording it.
    if (gate.charges) {
      order.subtotal = gate.charges.subtotal;
      order.discount = gate.charges.couponDiscount;
      order.deliveryFee = gate.charges.deliveryFee;
      order.handlingFee = gate.charges.handlingFee;
      order.convenienceFee = gate.charges.convenienceFee;
      order.mrpSavings = gate.charges.mrpSavings;
      order.total = gate.charges.total;
    }

    // Align the local mirror with the server's pre-order stock so the local
    // placement below lands on exactly the server's post-order value.
    if (Array.isArray(gate.products)) {
      useAdminStore.setState((s) => ({
        products: s.products.map((p) => {
          const hit = gate.products.find((x: any) => x.id === p.id);
          return hit
            ? { ...p, stockGrams: hit.before, currentStock: hit.before, availableStock: hit.before, stock: hit.before }
            : p;
        }),
      }));
    }

    // Local mirror of the same placement (order history + stock in this browser).
    const result = placeCustomerOrder(order);
    if (!result.ok) {
      setStockError(result.message || "Some items in your cart are no longer available.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Optionally save this address to the customer's address book
    if (saveAddress && isAuthenticated && user?.mobile) {
      addressBook.add({
        userKey: user.mobile,
        label: "Home",
        name: data.name,
        phone: data.phone,
        addressLine: data.address,
        city: data.city,
        pincode: data.pincode.trim(),
        isDefault: false,
      });
    }
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
        {stockError && (
          <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl px-4 py-3">
            ✕ {stockError}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-8">
          {/* Fulfillment Details */}
          <section className="card-option12 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <Building className="w-5 h-5 text-[#067a46]" />
              <h2 className="font-display text-xl font-bold text-slate-900">Fulfillment & Location Details</h2>
            </div>

            {/* Saved addresses — one click fills the form */}
            {savedAddresses.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-bold text-slate-700 mb-2">Deliver to a saved address</div>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => applyAddress(a.id)}
                      className={cn(
                        "text-left px-3.5 py-2.5 rounded-2xl border text-xs transition max-w-[260px]",
                        selectedAddrId === a.id
                          ? "border-[#067a46] bg-emerald-50 ring-2 ring-emerald-100"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#067a46]" /> {a.label}
                        {a.isDefault && <span className="text-[9px] uppercase bg-[#067a46] text-white px-1.5 py-0.5 rounded-full">Default</span>}
                      </div>
                      <div className="text-slate-600 truncate mt-0.5">{a.addressLine}, {a.city} — {a.pincode}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode *</label>
                <input
                  {...register("pincode", { required: true, pattern: /^\d{6}$/ })}
                  maxLength={6}
                  inputMode="numeric"
                  className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                  placeholder="e.g. 382021"
                />
                {errors.pincode && (
                  <div className="text-[11px] font-bold text-rose-600 mt-1">Enter a valid 6-digit pincode</div>
                )}
                {pincodeValue && /^\d{6}$/.test(pincodeValue) && (
                  <div className={cn("text-[11px] font-bold mt-1", isServiceablePincode(pincodeValue) ? "text-[#067a46]" : "text-rose-600")}>
                    {isServiceablePincode(pincodeValue)
                      ? "✓ Delivery available in this area"
                      : "✕ Currently not providing in this area"}
                  </div>
                )}
              </div>
              <div />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Address / Campus / Shop Location *</label>
              <textarea {...register("address", { required: true })} rows={2} className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none" placeholder="Specific sector, hostel building name, hotel or shop landmark in Gandhinagar..." />
            </div>

            {mounted && isAuthenticated && (
              <label className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="accent-[#067a46] w-4 h-4"
                />
                Save this address to my account for next time
              </label>
            )}
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
            {/* Cash on Delivery only for now — online payment options return when the gateway goes live */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { id: "cod", label: "Cash on Delivery", desc: "Pay in cash when your order arrives" },
              ].map((p) => (
                <label key={p.id} className="p-4 rounded-2xl border border-[#067a46] ring-2 ring-emerald-100 cursor-pointer bg-emerald-50/60 transition">
                  <input type="radio" value={p.id} defaultChecked {...register("payment")} className="accent-[#067a46] mb-2" />
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
                  placeholder="Coupon code (e.g. FRESH20)"
                  className="input text-xs uppercase focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                />
              </div>
              {couponOk && matchedCoupon && (
                <div className="text-[11px] text-[#067a46] font-bold mt-1">
                  ✓ {matchedCoupon.title} applied — you save {formatINR(couponAmt)}
                </div>
              )}
              {code.length > 0 && !couponOk && (
                <div className="text-[11px] text-rose-600 font-bold mt-1">
                  ✕ Invalid or expired code, or minimum order value not met
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Total</span>
                <span className="font-bold text-slate-900">{formatINR(subtotal)}</span>
              </div>
              {couponAmt > 0 && (
                <div className="flex justify-between text-[#067a46] font-bold">
                  <span>Coupon Discount</span>
                  <span>- {formatINR(couponAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                {charges.freeDelivery ? (
                  <span className="font-bold text-[#067a46]">FREE</span>
                ) : (
                  <span className="font-bold text-slate-900">{formatINR(charges.deliveryFee)}</span>
                )}
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Handling Fee</span>
                <span className="font-bold text-slate-900">{formatINR(charges.handlingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Convenience Fee</span>
                <span className="font-bold text-slate-900">{formatINR(charges.convenienceFee)}</span>
              </div>
              {freeHint ? (
                <div className="text-[11px] font-bold text-[#067a46] bg-emerald-50 rounded-lg px-2.5 py-1.5">
                  {freeHint}
                </div>
              ) : (
                <div className="text-[11px] font-bold text-[#067a46] bg-emerald-50 rounded-lg px-2.5 py-1.5">
                  🎉 FREE delivery unlocked
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total</span>
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
