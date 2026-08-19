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
  Truck,
  Home,
  Briefcase,
  Zap,
  Clock,
  X,
} from "lucide-react";
import { useCart } from "@/store/shop";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAdminStore, type AdminOrder, type OrderAddressSnapshot } from "@/store/adminStore";
import { useCustomerAuth } from "@/store/customerAuth";
import { useAddressBook, composeAddressLine, type SavedAddress } from "@/store/addresses";
import { computeOrderCharges, freeDeliveryHint } from "@/lib/fees";
import { isServiceablePincode } from "@/lib/serviceability";
import { AddressCard } from "@/components/address/AddressCard";
import { AddressForm, type AddressDraft } from "@/components/address/AddressForm";

/** Pack weight in grams for a cart line — falls back to parsing the label
 *  ("500 g", "1 kg") for carts persisted before grams were stored. */
/** Today's date as YYYY-MM-DD — used as the min for the scheduled-date picker. */
const todayISO = (): string => new Date().toISOString().slice(0, 10);

const lineGrams = (weight: string, grams?: number): number => {
  if (grams && grams > 0) return Math.round(grams);
  const m = /([\d.]+)\s*(kg|g)/i.exec(weight || "");
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return Math.round(m[2].toLowerCase() === "kg" ? n * 1000 : n);
};

type AddressType = "Home" | "Office" | "Other";
type DeliveryType = "Instant" | "Scheduled";
/** Order category — Retail (home customers) or Business / B2B (hostels, hotels, shops). */
type OrderCategory = "retail" | "business";

type Form = {
  name: string;
  phone: string;
  email: string;
  /** Only two choices: Retail or Business / B2B. Drives delivery-type options. */
  orderCategory: OrderCategory;
  address: string;
  city: string;
  pincode: string;
  slot: string;
  /** Preferred date — only used for Business + Scheduled orders. */
  preferredDate: string;
  /** Where the order goes — Home / Office / Other. Distinct from deliveryType. */
  deliveryAddressType: AddressType;
  /** How fast — Instant (fast) / Scheduled (pick a time slot). */
  deliveryType: DeliveryType;
  payment: "upi" | "cod" | "bank_transfer";
  coupon: string;
};

/** Delivery ADDRESS/location type — where the order is delivered. */
const addressTypeOptions: { value: AddressType; label: string; desc: string; icon: typeof Home }[] = [
  { value: "Home", label: "Home", desc: "Doorstep delivery", icon: Home },
  { value: "Office", label: "Office", desc: "Workplace delivery", icon: Briefcase },
  { value: "Other", label: "Other", desc: "Any saved location", icon: MapPin },
];

/** Delivery SPEED/type — how the order is fulfilled. Distinct from address type. */
const deliveryTypeOptions: { value: DeliveryType; label: string; desc: string; icon: typeof Zap }[] = [
  { value: "Instant", label: "Instant", desc: "Fast delivery", icon: Zap },
  { value: "Scheduled", label: "Scheduled", desc: "Pick a time slot", icon: Clock },
];

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
    defaultValues: {
      payment: "cod",
      slot: "morning-early",
      // Default order category: Retail (home customers).
      orderCategory: "retail",
      preferredDate: "",
      city: "Gandhinagar",
      // Default delivery state: Home address + Instant delivery (never blank).
      deliveryAddressType: "Home",
      deliveryType: "Instant",
    },
  });

  // ── Saved addresses (per logged-in user) ──
  const { user, isAuthenticated } = useCustomerAuth();
  const addressBook = useAddressBook();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const savedAddresses = mounted && isAuthenticated && user?.mobile ? addressBook.forUser(user.mobile) : [];
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addrPickerOpen, setAddrPickerOpen] = useState(false);
  const [addrFormOpen, setAddrFormOpen] = useState(false);
  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddrId) || null;

  // Default address prefills the form once on mount
  useEffect(() => {
    if (!mounted || !isAuthenticated || !user?.mobile) return;
    const def = addressBook.defaultFor(user.mobile);
    if (def && !selectedAddrId) applyAddress(def.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const pincodeValue = (watch("pincode") || "").trim();
  // Delivery selections (default Home + Instant) — drive the selected-card UI.
  const addressType = watch("deliveryAddressType");
  const deliveryType = watch("deliveryType");
  // Order category (Retail / Business) governs which delivery types are offered.
  const orderCategory = watch("orderCategory");
  // Retail = Instant only. If the customer switches back to Retail while
  // "Scheduled" is selected, snap the delivery type back to Instant so no
  // scheduled date/time controls linger.
  useEffect(() => {
    if (orderCategory === "retail" && deliveryType !== "Instant") {
      setValue("deliveryType", "Instant");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCategory]);
  // Scheduled controls appear only for Business + Scheduled.
  const showSchedule = orderCategory === "business" && deliveryType === "Scheduled";
  // Delivery-type choices: Retail gets Instant only; Business gets both.
  const availableDeliveryTypes =
    orderCategory === "business" ? deliveryTypeOptions : deliveryTypeOptions.filter((o) => o.value === "Instant");

  const applyAddress = (id: string) => {
    const a = addressBook.addresses.find((x) => x.id === id);
    if (!a) return;
    setSelectedAddrId(id);
    setValue("name", a.name);
    setValue("phone", a.phone);
    setValue("address", composeAddressLine(a));
    setValue("city", a.city);
    setValue("pincode", a.pincode);
    // Sync the delivery ADDRESS type card to the saved address's label.
    const t = /home/i.test(a.label) ? "Home" : /work|office/i.test(a.label) ? "Office" : "Other";
    setValue("deliveryAddressType", t as any);
  };

  /** Snapshot the delivery address that will be frozen onto the order (§25). */
  const buildAddressSnapshot = (data: Form): { snapshot: OrderAddressSnapshot; lat?: number; lng?: number } => {
    if (selectedAddress) {
      const a = selectedAddress;
      return {
        snapshot: {
          fullName: a.name, mobile: a.phone, houseNumber: a.houseNumber, buildingName: a.buildingName,
          floor: a.floor, street: a.street, area: a.area, landmark: a.landmark, city: a.city,
          state: a.state, pincode: a.pincode, addressType: a.label, latitude: a.latitude, longitude: a.longitude,
        },
        lat: a.latitude, lng: a.longitude,
      };
    }
    // Guest / manually-typed address — no map coordinates.
    return {
      snapshot: {
        fullName: data.name, mobile: data.phone, area: data.address, city: data.city,
        state: "Gujarat", pincode: data.pincode, addressType: data.deliveryAddressType,
      },
    };
  };

  /** Save a newly-added address to the book and select it for this order. */
  const handleSaveNewAddress = (draft: AddressDraft) => {
    if (!user?.mobile) return;
    const created = addressBook.add({ ...draft, addressLine: composeAddressLine(draft), userKey: user.mobile });
    if (draft.isDefault) addressBook.setDefault(user.mobile, created.id);
    applyAddress(created.id);
    setAddrFormOpen(false);
    setAddrPickerOpen(false);
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

    // Scheduled delivery applies only to Business / B2B orders.
    const scheduled = data.orderCategory === "business" && data.deliveryType === "Scheduled";

    const addr = buildAddressSnapshot(data);
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
      // Delivery selections — two distinct concepts, never blank (default Home + Instant).
      deliveryAddressType: data.deliveryAddressType || "Home",
      deliveryType: data.deliveryType || "Instant",
      // Order category (Retail / Business). Business + Scheduled carries a preferred date.
      orderCategory: data.orderCategory || "retail",
      preferredDate: scheduled ? data.preferredDate : undefined,
      // Structured address SNAPSHOT + exact coordinates, frozen onto the order (§11).
      deliveryAddressDetails: addr.snapshot,
      deliveryLat: addr.lat,
      deliveryLng: addr.lng,
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
      deliverySlot: scheduled ? (slots.find((s) => s.value === data.slot)?.label || data.slot) : "Instant delivery",
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
    // Address book save (§Bug 6):
    //  • First-time visitor with NO saved address yet → auto-save their first
    //    address (once), even if the checkbox is unticked, and make it default.
    //  • Returning customers keep the normal manual "save this address" flow.
    //  • Never auto-save when an existing saved address was selected (no dupes).
    const isFirstTimeAddress =
      isAuthenticated && !!user?.mobile && !selectedAddress && savedAddresses.length === 0;
    if ((saveAddress || isFirstTimeAddress) && isAuthenticated && user?.mobile && !selectedAddress) {
      addressBook.add({
        userKey: user.mobile,
        label: data.deliveryAddressType || "Home",
        name: data.name,
        phone: data.phone,
        addressLine: data.address,
        city: data.city,
        pincode: data.pincode.trim(),
        isDefault: isFirstTimeAddress,
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

            {/* Delivering to — the selected saved address, with Change / Add (§24) */}
            {mounted && isAuthenticated && (
              <div className="mb-5">
                {selectedAddress ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-slate-700">Delivering to</div>
                      <button type="button" onClick={() => setAddrPickerOpen(true)} className="text-xs font-bold text-[#067a46] hover:text-[#046338]">Change Address</button>
                    </div>
                    <AddressCard address={selectedAddress} compact />
                  </div>
                ) : savedAddresses.length > 0 ? (
                  <button type="button" onClick={() => setAddrPickerOpen(true)} className="w-full text-left px-4 py-3 rounded-2xl border border-slate-200 hover:border-[#067a46] text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#067a46]" /> Choose a delivery address
                  </button>
                ) : (
                  <button type="button" onClick={() => { setAddrFormOpen(true); }} className="w-full text-left px-4 py-3 rounded-2xl border-2 border-dashed border-[#067a46]/40 bg-emerald-50/40 hover:bg-emerald-50 text-sm font-bold text-[#067a46] flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> + Add Delivery Address
                  </button>
                )}
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Order Type</label>
                <select {...register("orderCategory")} className="input font-medium text-slate-700 focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none">
                  <option value="retail">Retail (Home)</option>
                  <option value="business">Business / B2B</option>
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

          {/* Delivery — address type (Home) + delivery type (Instant) */}
          <section className="card-option12 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <Truck className="w-5 h-5 text-[#067a46]" />
              <h2 className="font-display text-xl font-bold text-slate-900">Delivery</h2>
            </div>

            {/* Delivery Address Type — where the order goes (default: Home) */}
            <div className="mb-6">
              <div className="text-xs font-bold text-slate-700 mb-2.5">Delivery Address</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {addressTypeOptions.map((o) => {
                  const active = addressType === o.value;
                  const Icon = o.icon;
                  return (
                    <label
                      key={o.value}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition",
                        active
                          ? "border-[#067a46] bg-emerald-50 ring-2 ring-emerald-100"
                          : "border-slate-200 bg-slate-50 hover:border-[#067a46]"
                      )}
                    >
                      <input type="radio" value={o.value} {...register("deliveryAddressType")} className="accent-[#067a46]" />
                      <span className={cn("grid place-items-center w-9 h-9 rounded-xl shrink-0", active ? "bg-[#067a46] text-white" : "bg-white text-[#067a46] border border-slate-200")}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800">{o.label}</span>
                        <span className="block text-[10px] text-slate-500">{o.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Delivery Type — how fast. Retail: Instant only. Business: Instant + Scheduled. */}
            <div>
              <div className="text-xs font-bold text-slate-700 mb-2.5">Delivery Type</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableDeliveryTypes.map((o) => {
                  const active = deliveryType === o.value;
                  const Icon = o.icon;
                  return (
                    <label
                      key={o.value}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition",
                        active
                          ? "border-[#067a46] bg-emerald-50 ring-2 ring-emerald-100"
                          : "border-slate-200 bg-slate-50 hover:border-[#067a46]"
                      )}
                    >
                      <input type="radio" value={o.value} {...register("deliveryType")} className="accent-[#067a46]" />
                      <span className={cn("grid place-items-center w-9 h-9 rounded-xl shrink-0", active ? "bg-[#067a46] text-white" : "bg-white text-[#067a46] border border-slate-200")}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800">{o.label}</span>
                        <span className="block text-[10px] text-slate-500">{o.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Preferred Date + Time — shown ONLY for Business / B2B + Scheduled.
              Retail (Instant only) and Business + Instant never see these controls. */}
          {showSchedule && (
            <section className="card-option12 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="w-5 h-5 text-[#067a46]" />
                <h2 className="font-display text-xl font-bold text-slate-900">Preferred Date &amp; Time</h2>
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Date *</label>
                <input
                  type="date"
                  min={todayISO()}
                  {...register("preferredDate", { required: showSchedule })}
                  className="input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                />
                {errors.preferredDate && (
                  <div className="text-[11px] font-bold text-rose-600 mt-1">Please pick a delivery date</div>
                )}
              </div>
              <div className="text-xs font-bold text-slate-700 mb-2.5">Preferred Time Window</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {slots.map((s) => (
                  <label key={s.value} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-[#067a46] cursor-pointer bg-slate-50 transition">
                    <input type="radio" value={s.value} {...register("slot")} className="accent-[#067a46]" />
                    <span className="text-xs font-bold text-slate-800">{s.label}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

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

      {/* Address picker — choose a saved address or add a new one (§24) */}
      {addrPickerOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50" onClick={() => setAddrPickerOpen(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">Select Delivery Address</h3>
              <button type="button" onClick={() => setAddrPickerOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="space-y-2.5">
              {savedAddresses.map((a) => (
                <AddressCard
                  key={a.id}
                  address={a}
                  compact
                  selected={selectedAddrId === a.id}
                  onSelect={() => { applyAddress(a.id); setAddrPickerOpen(false); }}
                />
              ))}
            </div>
            <button type="button" onClick={() => { setAddrPickerOpen(false); setAddrFormOpen(true); }} className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-[#067a46]/40 bg-emerald-50/40 hover:bg-emerald-50 text-sm font-bold text-[#067a46] flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" /> + Add New Address
            </button>
          </div>
        </div>
      )}

      {/* Add-new address form (with map picker) */}
      {addrFormOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/50" onClick={() => setAddrFormOpen(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">Add New Address</h3>
              <button type="button" onClick={() => setAddrFormOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <AddressForm
              defaultName={user?.name || ""}
              defaultPhone={user?.mobile || ""}
              onSave={handleSaveNewAddress}
              onCancel={() => setAddrFormOpen(false)}
            />
          </div>
        </div>
      )}
    </form>
  );
}
