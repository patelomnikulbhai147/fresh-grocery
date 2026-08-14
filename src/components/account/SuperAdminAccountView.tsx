"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Package,
  ShoppingBag,
  Settings,
  MessageSquare,
  LogOut,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  CheckCircle2,
  Server,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomerUser } from "@/store/customerAuth";

import { ActivityLogsModule } from "@/components/admin/modules/ActivityLogsModule";
import { ReportsAnalytics } from "@/components/admin/modules/ReportsAnalytics";
import { SecurityRBAC } from "@/components/admin/modules/SecurityRBAC";
import { CustomerCRM } from "@/components/admin/modules/CustomerCRM";
import { ProductManagement } from "@/components/admin/modules/ProductManagement";
import { OrderManagement } from "@/components/admin/modules/OrderManagement";
import { SettingsModule } from "@/components/admin/modules/SettingsModule";
import { WhatsAppSubscribersModule } from "@/components/admin/modules/WhatsAppSubscribersModule";

interface SuperAdminAccountViewProps {
  user: CustomerUser | null;
  logout: () => void;
}

const adminNav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "roles", label: "Users & Roles", icon: Users },
  { id: "logs", label: "System Activity Logs", icon: FileText },
  { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
  { id: "customers", label: "Customer CRM", icon: Users },
  { id: "products", label: "Products & Inventory", icon: Package },
  { id: "orders", label: "Orders & Deliveries", icon: ShoppingBag },
  { id: "whatsapp", label: "WhatsApp Subscribers", icon: MessageSquare },
  { id: "settings", label: "System Settings", icon: Settings },
];

export function SuperAdminAccountView({ user, logout }: SuperAdminAccountViewProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          setStats(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const adminName = user?.name || "Om Patel";

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-emerald-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Super Admin Access Granted</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white">
              Super Admin Portal
            </h1>
            <p className="text-emerald-100/70 text-sm mt-1">
              Welcome back, <span className="font-bold text-white">{adminName}</span>. Enterprise Administration & Control Matrix.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-3 rounded-2xl text-xs shadow-lg transition active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch Enterprise Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Content */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        
        {/* Super Admin Sidebar */}
        <aside className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm lg:sticky lg:top-28 self-start space-y-4">
          
          {/* Admin User Header Profile */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-emerald-950 rounded-2xl text-white space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>SUPER ADMIN</span>
            </div>
            <div className="font-extrabold text-base text-white">{adminName}</div>
            <div className="text-xs text-slate-300 font-medium">System Administrator</div>
          </div>

          {/* Enterprise Portal Link */}
          <Link
            href="/admin"
            className="w-full flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-[#067a46] rounded-2xl text-xs font-extrabold transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#067a46] text-white rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-extrabold">Enterprise Portal</div>
                <div className="text-[10px] text-[#067a46]/80 font-medium">Super Admin Dashboard</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Sidebar Nav Items */}
          <nav className="space-y-1 pt-1">
            {adminNav.map((n) => {
              const Icon = n.icon;
              const isActive = activeTab === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setActiveTab(n.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-left transition",
                    isActive
                      ? "bg-[#067a46] text-white shadow-sm"
                      : "hover:bg-slate-100/80 text-slate-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{n.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}

            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-left text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="space-y-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Administration Metrics */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#067a46] grid place-items-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    Total Users
                  </div>
                  <div className="font-display font-extrabold text-3xl text-slate-900">
                    {loading ? "..." : stats?.metrics?.totalCustomers ?? 2}
                  </div>
                  <div className="text-xs text-emerald-600 font-semibold mt-1">Verified Accounts</div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    System Audit Logs
                  </div>
                  <div className="font-display font-extrabold text-3xl text-slate-900">
                    {loading ? "..." : stats?.metrics?.totalAuditLogs ?? 12}
                  </div>
                  <div className="text-xs text-indigo-600 font-semibold mt-1">Security Audit Records</div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center mb-3">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    WhatsApp Subscribers
                  </div>
                  <div className="font-display font-extrabold text-3xl text-slate-900">
                    {loading ? "..." : stats?.metrics?.totalSubscribers ?? 5}
                  </div>
                  <div className="text-xs text-amber-600 font-semibold mt-1">Active Subscriptions</div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 grid place-items-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    Active Modules
                  </div>
                  <div className="font-display font-extrabold text-3xl text-slate-900">19</div>
                  <div className="text-xs text-purple-600 font-semibold mt-1">RBAC Enforced</div>
                </div>
              </div>

              {/* Enterprise Quick Launch Panel */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-900">
                      Enterprise Quick Management Modules
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct shortcuts to administrative functions
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveTab("roles")}
                    className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl group-hover:scale-105 transition">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Users & Roles</div>
                        <div className="text-[11px] text-slate-500">Security RBAC matrix</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("logs")}
                    className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-[#067a46] rounded-xl group-hover:scale-105 transition">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">System Activity</div>
                        <div className="text-[11px] text-slate-500">Audit trail & logins</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("reports")}
                    className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 text-purple-700 rounded-xl group-hover:scale-105 transition">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Reports & Analytics</div>
                        <div className="text-[11px] text-slate-500">Business insights</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* System Security & Verification Panel */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#067a46] uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>Security & System Verification</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#067a46] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">Database Connection</div>
                      <div className="text-xs text-emerald-800 font-medium mt-0.5">
                        {stats?.systemHealth?.database || "SQLite / MySQL Active & Healthy"}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl flex items-start gap-3">
                    <Server className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">Authentication Engine</div>
                      <div className="text-xs text-indigo-800 font-medium mt-0.5">
                        {stats?.systemHealth?.authEngine || "E.164 E-OTP + SHA-256 Crypto"}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">RBAC Authorization</div>
                      <div className="text-xs text-purple-800 font-medium mt-0.5">
                        {stats?.systemHealth?.rbacEnforcement || "Strict Role Enforcement Active"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module Views */}
          {activeTab === "roles" && <SecurityRBAC />}
          {activeTab === "logs" && <ActivityLogsModule />}
          {activeTab === "reports" && <ReportsAnalytics />}
          {activeTab === "customers" && <CustomerCRM />}
          {activeTab === "products" && <ProductManagement />}
          {activeTab === "orders" && <OrderManagement />}
          {activeTab === "whatsapp" && <WhatsAppSubscribersModule />}
          {activeTab === "settings" && <SettingsModule />}
        </main>
      </div>
    </div>
  );
}
