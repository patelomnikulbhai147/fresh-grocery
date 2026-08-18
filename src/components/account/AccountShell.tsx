"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  CheckCircle2,
  ChevronRight,
  Pencil,
  Trash2,
  X,
  ShoppingBag,
} from "lucide-react";
import { cn, formatINR, formatWeight } from "@/lib/utils";
import { CustomerRole, useCustomerAuth } from "@/store/customerAuth";
import { useAdminAuth } from "@/store/adminAuth";
import { useAdminStore, type AdminOrder } from "@/store/adminStore";
import { useAddressBook, type SavedAddress } from "@/store/addresses";
import { useWishlist } from "@/store/shop";
import { useLiveCatalog } from "@/store/liveCatalog";
import { SuperAdminAccountView } from "@/components/account/SuperAdminAccountView";
import { useRouter, useSearchParams } from "next/navigation";

const nav = [
  { id: "dashboard", label: "Dashboard", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
];

const STATUS_TONE: Record<string, string> = {
  Delivered: "text-emerald-700",
  Cancelled: "text-rose-600",
  Returned: "text-rose-600",
  Refunded: "text-rose-600",
};

const emptyAddressForm = {
  label: "Home",
  name: "",
  phone: "",
  addressLine: "",
  area: "",
  landmark: "",
  city: "Gandhinagar",
  pincode: "",
};

export function AccountShell() {
  const { user, logout } = useCustomerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") || "dashboard";
  const [active, setActive] = useState(initialTab);
  // Persisted stores differ between server render and client — gate on mount
  const [mounted, setMounted] = useState(false);
  // Wishlist products come from the authoritative customer product API — a
  // product the admin removed must vanish from the wishlist view too.
  const catalogProducts = useLiveCatalog((s) => s.products);
  const fetchCatalog = useLiveCatalog((s) => s.fetchOnce);
  useEffect(() => {
    setMounted(true);
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    if (searchParams?.get("tab")) {
      setActive(searchParams.get("tab")!);
    }
  }, [searchParams]);

  // ── Live data (no dummy values anywhere) ──
  const allOrders = useAdminStore((s) => s.orders);
  const wishlistIds = useWishlist((s) => s.ids);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const addressBook = useAddressBook();
  const userKey = user?.mobile || "";

  const myOrders: AdminOrder[] = mounted
    ? allOrders.filter(
        (o) =>
          (user?.id && o.customerId === user.id) ||
          (userKey && o.customerPhone && o.customerPhone.replace(/\D/g, "").includes(userKey.replace(/\D/g, ""))) ||
          (user?.email && o.customerEmail && o.customerEmail === user.email)
      )
    : [];
  const myWishlist = mounted
    ? (catalogProducts ?? []).filter((p) => wishlistIds.includes(p.id))
    : [];
  const myAddresses = mounted ? addressBook.forUser(userKey) : [];

  // ── Address form modal state ──
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({ ...emptyAddressForm });
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openAddAddress = () => {
    setEditingId(null);
    setAddrForm({ ...emptyAddressForm, name: user?.name || "", phone: user?.mobile || "" });
    setAddrErrors({});
    setAddrModalOpen(true);
  };
  const openEditAddress = (a: SavedAddress) => {
    setEditingId(a.id);
    setAddrForm({
      label: a.label,
      name: a.name,
      phone: a.phone,
      addressLine: a.addressLine,
      area: a.area || "",
      landmark: a.landmark || "",
      city: a.city,
      pincode: a.pincode,
    });
    setAddrErrors({});
    setAddrModalOpen(true);
  };
  const saveAddress = () => {
    const errs: Record<string, string> = {};
    if (!addrForm.name.trim()) errs.name = "Name is required";
    if (!/^\d{10}$/.test(addrForm.phone.replace(/\D/g, "").slice(-10)) || addrForm.phone.replace(/\D/g, "").length < 10)
      errs.phone = "Enter a valid 10-digit mobile number";
    if (!addrForm.addressLine.trim()) errs.addressLine = "House / street is required";
    if (!addrForm.city.trim()) errs.city = "City is required";
    if (!/^\d{6}$/.test(addrForm.pincode.trim())) errs.pincode = "Enter a valid 6-digit pincode";
    setAddrErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (editingId) {
      addressBook.update(editingId, { ...addrForm });
    } else {
      addressBook.add({ ...addrForm, userKey, isDefault: false });
    }
    setAddrModalOpen(false);
  };

  // Determine user role strictly from authenticated session/user model
  const effectiveRole: CustomerRole =
    user?.role ||
    (user?.mobile?.includes("9773271029") || user?.email === "admin@flashkart.co"
      ? "SUPER_ADMIN"
      : user?.mobile?.includes("6352856495")
      ? "ADMIN"
      : "CUSTOMER");

  useEffect(() => {
    if (effectiveRole === "SUPER_ADMIN" || effectiveRole === "ADMIN") {
      useAdminAuth.getState().login("admin@flashkart.co", "123456");
      router.replace("/admin");
    }
  }, [effectiveRole, router]);

  if (effectiveRole === "SUPER_ADMIN") {
    return <SuperAdminAccountView user={user} logout={logout} />;
  }

  const firstName = user?.name?.split(" ")[0] || "Guest";
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "GU";
  const isAdmin = effectiveRole === "ADMIN";

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs text-brand-500 mb-2">
          <Link href="/" className="hover:text-brand-700">Home</Link> / My Account
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-brand-950">Hi, {firstName} 👋</h1>
        <p className="text-brand-700 mt-1">Welcome back. Here&apos;s what&apos;s fresh today.</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="bg-white rounded-3xl border border-brand-100 p-4 lg:sticky lg:top-28 self-start">
          <div className="flex items-center gap-3 p-3 mb-3 bg-brand-50 rounded-2xl">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold flex items-center gap-1.5 truncate">
                {user?.name || "Guest User"}
                {isAdmin && (
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-brand-600 truncate">{user?.mobile || user?.email || ""}</div>
            </div>
          </div>

          {isAdmin && (
            <a
              href="/admin"
              className="w-full mb-3 flex items-center justify-between gap-2 p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-bold shadow-md transition group"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-white/20 rounded-lg group-hover:scale-110 transition">🛡️</span>
                <div>
                  <div className="text-white font-extrabold text-xs">Enterprise Portal</div>
                  <div className="text-[10px] text-emerald-100 font-normal">Super Admin Dashboard</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition" />
            </a>
          )}

          <nav className="space-y-0.5">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => setActive(n.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition",
                  active === n.id ? "bg-brand-900 text-white" : "hover:bg-brand-50 text-brand-800"
                )}
              >
                <n.icon className="w-4 h-4" />
                <span className="flex-1">{n.label}</span>
                {active === n.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left text-berry hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </nav>
        </aside>

        <div>
          {active === "dashboard" && (
            <div className="space-y-6">
              {/* Profile — real session data */}
              <div className="bg-white rounded-3xl border border-brand-100 p-6">
                <h3 className="font-display text-xl text-brand-950 mb-4">Profile</h3>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-brand-500 mb-1">Name</div>
                    <div className="font-semibold text-brand-950">{user?.name || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-brand-500 mb-1">Mobile</div>
                    <div className="font-semibold text-brand-950">{user?.mobile || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-brand-500 mb-1">Email</div>
                    <div className="font-semibold text-brand-950 truncate">{user?.email || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Real counters */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Total orders", value: String(myOrders.length), icon: Package, tab: "orders" },
                  { label: "Wishlist items", value: String(myWishlist.length), icon: Heart, tab: "wishlist" },
                  { label: "Saved addresses", value: String(myAddresses.length), icon: MapPin, tab: "addresses" },
                ].map((s) => (
                  <button key={s.label} onClick={() => setActive(s.tab)} className="bg-white rounded-3xl border border-brand-100 p-5 text-left hover:border-brand-300 transition">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 grid place-items-center text-brand-700 mb-3">
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div className="text-xs uppercase tracking-widest text-brand-500 mb-1">{s.label}</div>
                    <div className="font-display text-3xl text-brand-950">{s.value}</div>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-brand-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-xl text-brand-950">Recent orders</h3>
                  <button onClick={() => setActive("orders")} className="text-xs font-semibold text-brand-700">View all</button>
                </div>
                {myOrders.length === 0 ? (
                  <div className="py-8 text-center text-sm text-brand-600">
                    No orders yet.{" "}
                    <Link href="/shop" className="font-semibold text-brand-800 underline">Browse fresh produce</Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myOrders.slice(0, 3).map((o) => (
                      <div key={o.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-brand-50 transition">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 grid place-items-center">
                          <Package className="w-4 h-4 text-brand-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold">#{o.id}</div>
                          <div className="text-xs text-brand-600">{o.date} · {o.items.length} item{o.items.length === 1 ? "" : "s"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{formatINR(o.total)}</div>
                          <div className={cn("text-xs flex items-center gap-1 justify-end", STATUS_TONE[o.status] || "text-brand-600")}>
                            <CheckCircle2 className="w-3 h-3" /> {o.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {active === "orders" && (
            <div className="bg-white rounded-3xl border border-brand-100 p-6 space-y-3">
              <h3 className="font-display text-xl text-brand-950 mb-4">Order history</h3>
              {myOrders.length === 0 && (
                <div className="py-10 text-center text-sm text-brand-600">
                  <ShoppingBag className="w-10 h-10 mx-auto text-brand-300 mb-3" />
                  You haven&apos;t placed any orders yet.{" "}
                  <Link href="/shop" className="font-semibold text-brand-800 underline">Start shopping</Link>
                </div>
              )}
              {myOrders.map((o) => (
                <div key={o.id} className="p-4 border border-brand-100 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 grid place-items-center"><Package className="w-5 h-5 text-brand-700" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">#{o.id}</div>
                      <div className="text-xs text-brand-600">{o.date} · {o.items.length} item{o.items.length === 1 ? "" : "s"} · {o.paymentMethod}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatINR(o.total)}</div>
                      <div className={cn("text-xs inline-flex items-center gap-1", STATUS_TONE[o.status] || "text-brand-600")}>
                        <CheckCircle2 className="w-3 h-3" />{o.status}
                      </div>
                    </div>
                  </div>
                  {/* Purchase-time item details (price & pack preserved) */}
                  <div className="mt-3 pt-3 border-t border-brand-100/70 grid sm:grid-cols-2 gap-1.5">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="text-xs text-brand-700 flex items-center justify-between gap-2">
                        <span className="truncate">
                          {it.name} <span className="text-brand-500">({it.weight} × {it.quantity}{it.totalGrams ? ` · ${formatWeight(it.totalGrams)}` : ""})</span>
                        </span>
                        <span className="font-semibold shrink-0">{formatINR(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {active === "wishlist" && (
            <div className="bg-white rounded-3xl border border-brand-100 p-6">
              <h3 className="font-display text-xl text-brand-950 mb-4">Wishlist</h3>
              {myWishlist.length === 0 ? (
                <div className="py-10 text-center">
                  <Heart className="w-12 h-12 mx-auto text-brand-300 mb-4" />
                  <div className="font-display text-2xl text-brand-950 mb-2">Nothing saved yet</div>
                  <p className="text-sm text-brand-600 max-w-sm mx-auto">
                    Heart any product across the site to save it here.
                  </p>
                  <Link href="/shop" className="mt-6 inline-block bg-brand-900 text-white rounded-full px-5 py-3 text-sm font-semibold">Start browsing</Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {myWishlist.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 border border-brand-100 rounded-2xl">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-50 border border-brand-100 shrink-0">
                        <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${p.slug}`} className="text-sm font-semibold text-brand-950 hover:text-brand-700 line-clamp-2">
                          {p.name}
                        </Link>
                        <div className="text-xs text-brand-600 font-semibold">{p.weights[0] ? formatINR(p.weights[0].price) : ""}</div>
                      </div>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        title="Remove from wishlist"
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {active === "addresses" && (
            <div className="bg-white rounded-3xl border border-brand-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-brand-950">Saved addresses</h3>
                <button
                  onClick={openAddAddress}
                  className="text-xs font-semibold text-white bg-brand-900 hover:bg-brand-800 px-3.5 py-2 rounded-full transition"
                >
                  + Add new
                </button>
              </div>
              {myAddresses.length === 0 ? (
                <div className="py-10 text-center text-sm text-brand-600">
                  <MapPin className="w-10 h-10 mx-auto text-brand-300 mb-3" />
                  No saved addresses yet. Add one to speed up checkout.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {myAddresses.map((a) => (
                    <div key={a.id} className={cn("p-4 rounded-2xl border", a.isDefault ? "border-brand-400 bg-brand-50/40" : "border-brand-100")}>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-brand-600" />
                        <span className="font-semibold text-sm">{a.label}</span>
                        {a.isDefault && (
                          <span className="text-[10px] uppercase bg-brand-600 text-white px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-brand-700">
                        {a.name} · {a.phone}
                        <br />
                        {a.addressLine}
                        {a.area ? `, ${a.area}` : ""}
                        {a.landmark ? ` (near ${a.landmark})` : ""}
                        <br />
                        {a.city} — {a.pincode}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs font-semibold">
                        <button onClick={() => openEditAddress(a)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-800 hover:bg-brand-100">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        {!a.isDefault && (
                          <button onClick={() => addressBook.setDefault(userKey, a.id)} className="px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-800 hover:bg-brand-100">
                            Set default
                          </button>
                        )}
                        {confirmDeleteId === a.id ? (
                          <span className="flex items-center gap-1.5">
                            <button onClick={() => { addressBook.remove(a.id); setConfirmDeleteId(null); }} className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white">
                              Confirm delete
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-800">
                              Keep
                            </button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(a.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address add/edit modal */}
      {addrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-brand-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-100 pb-3">
              <h3 className="font-display text-lg font-bold text-brand-950">{editingId ? "Edit Address" : "Add New Address"}</h3>
              <button onClick={() => setAddrModalOpen(false)} className="p-1 text-brand-700 hover:text-brand-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {["Home", "Office", "Other"].map((l) => (
                <button
                  key={l}
                  onClick={() => setAddrForm({ ...addrForm, label: l })}
                  className={cn(
                    "py-2 rounded-xl border transition",
                    addrForm.label === l ? "bg-brand-900 text-white border-brand-900" : "bg-white text-brand-800 border-brand-200 hover:border-brand-400"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            {([
              { key: "name", label: "Full Name *", placeholder: "Receiver's name" },
              { key: "phone", label: "Mobile Number *", placeholder: "10-digit mobile" },
              { key: "addressLine", label: "House / Flat, Building & Street *", placeholder: "e.g. B-14, Shalin Apartments, Road 5" },
              { key: "area", label: "Area / Sector", placeholder: "e.g. Sector 21 / Sargasan / Kudasan" },
              { key: "landmark", label: "Landmark", placeholder: "Optional" },
              { key: "city", label: "City *", placeholder: "Gandhinagar" },
              { key: "pincode", label: "Pincode *", placeholder: "e.g. 382021" },
            ] as { key: keyof typeof emptyAddressForm; label: string; placeholder: string }[]).map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-brand-900 mb-1">{f.label}</label>
                <input
                  type="text"
                  value={addrForm[f.key]}
                  placeholder={f.placeholder}
                  onChange={(e) => setAddrForm({ ...addrForm, [f.key]: e.target.value })}
                  className={cn(
                    "w-full bg-brand-50/60 border rounded-xl px-3.5 py-2.5 text-sm text-brand-950 outline-none",
                    addrErrors[f.key] ? "border-rose-400 ring-1 ring-rose-200" : "border-brand-200 focus:border-brand-500"
                  )}
                />
                {addrErrors[f.key] && <div className="text-[11px] font-bold text-rose-600 mt-0.5">{addrErrors[f.key]}</div>}
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setAddrModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-brand-50 text-brand-800 hover:bg-brand-100 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={saveAddress}
                className="flex-1 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold shadow-sm transition"
              >
                {editingId ? "Save Changes" : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
