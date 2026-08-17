"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/store/adminAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/modules/AdminDashboard";
import { ActivityLogsModule } from "@/components/admin/modules/ActivityLogsModule";
import { ProductManagement } from "@/components/admin/modules/ProductManagement";
import { InventoryModule } from "@/components/admin/modules/InventoryModule";
import { CategoryManagement } from "@/components/admin/modules/CategoryManagement";
import { BrandManagement } from "@/components/admin/modules/BrandManagement";
import { OrderManagement } from "@/components/admin/modules/OrderManagement";
import { CustomerCRM } from "@/components/admin/modules/CustomerCRM";
import { CouponManagement } from "@/components/admin/modules/CouponManagement";
import { ReviewManagement } from "@/components/admin/modules/ReviewManagement";
import { SupportManagement } from "@/components/admin/modules/SupportManagement";
import { BannerManagement } from "@/components/admin/modules/BannerManagement";
import { CMSManagement } from "@/components/admin/modules/CMSManagement";
import { DeliveryManagement } from "@/components/admin/modules/DeliveryManagement";
import { NotificationManagement } from "@/components/admin/modules/NotificationManagement";
import { ReportsAnalytics } from "@/components/admin/modules/ReportsAnalytics";
import { SecurityRBAC } from "@/components/admin/modules/SecurityRBAC";
import { SettingsModule } from "@/components/admin/modules/SettingsModule";
import { WhatsAppSubscribersModule } from "@/components/admin/modules/WhatsAppSubscribersModule";
import { useCustomerAuth } from "@/store/customerAuth";
import { RefreshCw, ShieldCheck, ShieldAlert, Lock, ArrowLeft } from "lucide-react";

export default function AdminPortalPage() {
  const router = useRouter();
  const { isAuthenticated: isAdminAuth, twoFactorPending, user: adminUser } = useAdminAuth();
  const { isAuthenticated: isCustomerAuth, user: customerUser } = useCustomerAuth();

  const [activeModule, setActiveModule] = useState("dashboard");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "low" | "out">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check role authorization
  const effectiveRole =
    adminUser?.role ||
    customerUser?.role ||
    (customerUser?.mobile?.includes("9773271029") || customerUser?.email === "admin@flashkart.co"
      ? "Super Admin"
      : customerUser?.mobile?.includes("6352856495")
      ? "Admin"
      : "Customer");

  const isAuthorized =
    (isAdminAuth || isCustomerAuth) &&
    (effectiveRole === "Super Admin" ||
      effectiveRole === "SUPER_ADMIN" ||
      effectiveRole === "Admin" ||
      effectiveRole === "ADMIN");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-950 via-zinc-900 to-brand-900 flex flex-col items-center justify-center p-4 text-white space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-3xl backdrop-blur-md border border-white/20 shadow-2xl animate-pulse">
          🌿
        </div>
        <div className="flex items-center gap-2 font-display font-bold text-lg text-zinc-200">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" /> Verifying Super Admin Session...
        </div>
        <p className="text-xs text-zinc-400 font-mono">Checking JWT Session & Role-Based Access Control...</p>
      </div>
    );
  }

  // ── 403 Forbidden / Access Denied for Non-Admin Users ──
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 shadow-2xl">
          <Lock className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-500/20 border border-rose-500/40 rounded-full text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldAlert className="w-4 h-4" />
          <span>403 Forbidden — Access Denied</span>
        </div>

        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-2">
          Super Admin Privileges Required
        </h1>

        <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
          You do not have administrative permissions to access the Enterprise Control Panel. This section is strictly restricted to Super Administrators.
        </p>

        <button
          onClick={() => (window.location.href = "/")}
          className="inline-flex items-center gap-2 bg-[#067a46] hover:bg-[#046338] text-white font-extrabold px-6 py-3.5 rounded-2xl text-sm transition shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>
      </div>
    );
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return (
          <AdminDashboard
            onNavigate={(mod, opts) => {
              setStockFilter(opts?.stockFilter ?? "all");
              setActiveModule(mod);
            }}
          />
        );
      case "logs":
        return <ActivityLogsModule />;
      case "products":
        return <ProductManagement />;
      case "inventory":
        return <InventoryModule key={stockFilter} initialFilter={stockFilter} />;
      case "categories":
        return <CategoryManagement />;
      case "brands":
        return <BrandManagement />;
      case "orders":
        return <OrderManagement />;
      case "customers":
        return <CustomerCRM />;
      case "coupons":
        return <CouponManagement />;
      case "reviews":
        return <ReviewManagement />;
      case "support":
        return <SupportManagement />;
      case "banners":
        return <BannerManagement />;
      case "cms":
        return <CMSManagement />;
      case "delivery":
        return <DeliveryManagement />;
      case "notifications":
        return <NotificationManagement />;
      case "reports":
        return <ReportsAnalytics />;
      case "roles":
        return <SecurityRBAC />;
      case "settings":
        return <SettingsModule />;
      case "whatsapp":
        return <WhatsAppSubscribersModule />;
      default:
        return <AdminDashboard onNavigate={(mod) => setActiveModule(mod)} />;
    }
  };

  return (
    <AdminLayout
      activeModule={activeModule}
      onSelectModule={(mod, q) => {
        setActiveModule(mod);
        if (q) setSearchQuery(q);
      }}
    >
      {renderActiveModule()}
    </AdminLayout>
  );
}
