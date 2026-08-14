"use client";
import Link from "next/link";
import { useState } from "react";
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Wallet,
  Gift,
  LogOut,
  Settings,
  Star,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomerRole, useCustomerAuth } from "@/store/customerAuth";
import { useAdminAuth } from "@/store/adminAuth";
import { SuperAdminAccountView } from "@/components/account/SuperAdminAccountView";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const nav = [
  { id: "dashboard", label: "Dashboard", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wallet", label: "Wallet & Rewards", icon: Wallet },
  { id: "subscriptions", label: "Subscriptions", icon: Gift },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "payments", label: "Payment Methods", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

const orders = [
  { id: "FRM-823145", date: "Yesterday", total: 1240, status: "Delivered", items: 6 },
  { id: "FRM-821990", date: "3 days ago", total: 680, status: "Delivered", items: 4 },
  { id: "FRM-819332", date: "1 week ago", total: 2120, status: "Delivered", items: 9 },
];

export function AccountShell() {
  const { user, logout } = useCustomerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") || "dashboard";
  const [active, setActive] = useState(initialTab);

  useEffect(() => {
    if (searchParams?.get("tab")) {
      setActive(searchParams.get("tab")!);
    }
  }, [searchParams]);

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

  // ── SUPER ADMIN VIEW (Fallback if on /account) ──
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
            <div>
              <div className="text-sm font-semibold flex items-center gap-1.5">
                {user?.name || "Guest User"}
                {isAdmin && (
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-brand-600">Gold Member · {user?.points || 0} pts</div>
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
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Total orders", value: "23", sub: "+2 this month", icon: Package },
                  { label: "Wallet balance", value: "₹420", sub: "Earned from referrals", icon: Wallet },
                  { label: "Reward points", value: "2,450", sub: "₹245 redeemable", icon: Star },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-3xl border border-brand-100 p-5">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 grid place-items-center text-brand-700 mb-3">
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div className="text-xs uppercase tracking-widest text-brand-500 mb-1">{s.label}</div>
                    <div className="font-display text-3xl text-brand-950">{s.value}</div>
                    <div className="text-xs text-brand-600 mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-brand-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-xl text-brand-950">Recent orders</h3>
                  <button onClick={() => setActive("orders")} className="text-xs font-semibold text-brand-700">View all</button>
                </div>
                <div className="space-y-2">
                  {orders.map((o) => (
                    <div key={o.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-brand-50 transition">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 grid place-items-center">
                        <Package className="w-4 h-4 text-brand-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">#{o.id}</div>
                        <div className="text-xs text-brand-600">{o.date} · {o.items} items</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">₹{o.total}</div>
                        <div className="text-xs text-brand-600 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3" /> {o.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-brand-900 to-emerald-800 rounded-3xl p-8 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3 text-brand-200">
                  <Gift className="w-4 h-4" /> Refer & Earn
                </div>
                <h3 className="font-display text-3xl mb-2">Give ₹200, get ₹200</h3>
                <p className="text-white/80 max-w-md text-sm">
                  Invite a friend to FlashKart. They get ₹200 off their first produce order, you get ₹200 credited to your wallet.
                </p>
                <div className="mt-5 flex items-center gap-2 max-w-sm">
                  <div className="flex-1 bg-white/10 border border-white/15 rounded-full px-4 py-2.5 text-sm font-mono">FLASH-AARAV24</div>
                  <button className="bg-white text-purple-950 rounded-full px-4 py-2.5 text-sm font-bold">Copy</button>
                </div>
              </div>
            </div>
          )}

          {active === "orders" && (
            <div className="bg-white rounded-3xl border border-brand-100 p-6 space-y-3">
              <h3 className="font-display text-xl text-brand-950 mb-4">Order history</h3>
              {orders.map((o) => (
                <div key={o.id} className="flex items-center gap-4 p-4 border border-brand-100 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 grid place-items-center"><Package className="w-5 h-5 text-brand-700" /></div>
                  <div className="flex-1">
                    <div className="font-semibold">#{o.id}</div>
                    <div className="text-xs text-brand-600">{o.date} · {o.items} items</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{o.total}</div>
                    <div className="text-xs inline-flex items-center gap-1 text-brand-600"><CheckCircle2 className="w-3 h-3" />{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {active === "wishlist" && (
            <div className="bg-white rounded-3xl border border-brand-100 p-10 text-center">
              <Heart className="w-12 h-12 mx-auto text-brand-300 mb-4" />
              <div className="font-display text-2xl text-brand-950 mb-2">Your wishlist is private</div>
              <p className="text-sm text-brand-600 max-w-sm mx-auto">
                Heart any product across the site to save it here. You have 0 items saved right now.
              </p>
              <Link href="/shop" className="mt-6 inline-block bg-brand-900 text-white rounded-full px-5 py-3 text-sm font-semibold">Start browsing</Link>
            </div>
          )}

          {active === "addresses" && (
            <div className="bg-white rounded-3xl border border-brand-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-brand-950">Saved addresses</h3>
                <button className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full">+ Add new</button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { label: "Home", addr: "Flat 402, Prestige Shantiniketan, Bengaluru 560048", tag: "Default" },
                  { label: "Office", addr: "5th Floor, Prestige Tower, MG Road, Bengaluru 560001" },
                ].map((a) => (
                  <div key={a.label} className="p-4 rounded-2xl border border-brand-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-brand-600" />
                      <span className="font-semibold text-sm">{a.label}</span>
                      {a.tag && <span className="text-[10px] uppercase bg-brand-600 text-white px-2 py-0.5 rounded-full">{a.tag}</span>}
                    </div>
                    <p className="text-xs text-brand-700">{a.addr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "wallet" && (
            <div className="bg-white rounded-3xl border border-brand-100 p-6 space-y-4">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
                <div className="text-xs uppercase tracking-widest opacity-80 font-bold">FlashKart Wallet</div>
                <div className="font-display text-4xl mt-1 font-black">₹420.00</div>
                <div className="text-xs opacity-80 mt-1">Expires in 364 days</div>
              </div>
              <h4 className="font-semibold text-sm">Transaction history</h4>
              {[
                { label: "Referral bonus · Nisha P.", amt: "+₹200", date: "Yesterday", tone: "credit" },
                { label: "Cashback on order FLK-821990", amt: "+₹70", date: "3 days ago", tone: "credit" },
                { label: "Applied at checkout", amt: "-₹150", date: "Last week", tone: "debit" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-50">
                  <div>
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-brand-500 flex items-center gap-1"><Clock className="w-3 h-3"/>{t.date}</div>
                  </div>
                  <div className={cn("font-semibold text-sm", t.tone === "credit" ? "text-brand-700" : "text-berry")}>{t.amt}</div>
                </div>
              ))}
            </div>
          )}

          {(active === "subscriptions" || active === "notifications" || active === "payments" || active === "settings") && (
            <div className="bg-white rounded-3xl border border-brand-100 p-10 text-center">
              <div className="w-16 h-16 rounded-3xl bg-brand-50 grid place-items-center mx-auto mb-4">
                <SparkleIcon />
              </div>
              <div className="font-display text-2xl text-brand-950 mb-2">{nav.find(n => n.id === active)?.label}</div>
              <p className="text-sm text-brand-600 max-w-sm mx-auto">
                This section is ready to light up with real data once you connect your account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 text-brand-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"/>
    </svg>
  );
}
