"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  Boxes,
  FolderTree,
  Tag,
  ShoppingBag,
  Users,
  Percent,
  Star,
  Image as ImageIcon,
  LayoutTemplate,
  Truck,
  Bell,
  BarChart3,
  Settings,
  History,
  ShieldCheck,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  CheckCircle2,
  MessageSquare,
  MessageCircleMore,
} from "lucide-react";
import { useAdminAuth, type AdminRole } from "@/store/adminAuth";
import { useCustomerAuth } from "@/store/customerAuth";
import { useAdminStore, productStockInfo } from "@/store/adminStore";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  activeModule: string;
  onSelectModule: (module: string, searchQuery?: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number | string;
  badgeTone?: "red" | "amber" | "emerald";
  permission: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AdminLayout({ children, activeModule, onSelectModule }: AdminLayoutProps) {
  const router = useRouter();
  const { user, logout, switchRole, toggle2FA } = useAdminAuth();
  const { logout: customerLogout } = useCustomerAuth();
  const { orders, products, activityLogs } = useAdminStore();

  const handleSignOut = () => {
    logout();         // clear adminAuth session
    customerLogout(); // clear customerAuth session
    setIsProfileMenuOpen(false);
    router.push("/"); // go to main homepage
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  // Calculate live badge numbers
  const pendingOrdersCount = orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;
  const lowStockCount = products.filter((p) => productStockInfo(p).status === "Low Stock").length;
  const outOfStockCount = products.filter((p) => productStockInfo(p).allOut).length;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Simplified control-center navigation: only modules that exist and work.
  // (Reviews, Support, Banners, CMS, Delivery Zones and Notifications modules
  // remain in the codebase but are intentionally out of the main navigation.)
  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "products.view" }
      ]
    },
    {
      title: "Catalog",
      items: [
        { id: "products", label: "Products", icon: Package, badge: outOfStockCount > 0 ? `${outOfStockCount} OOS` : undefined, badgeTone: "red", permission: "products.view" },
        { id: "categories", label: "Categories", icon: FolderTree, permission: "categories.view" },
        { id: "brands", label: "Brands", icon: Tag, permission: "brands.view" }
      ]
    },
    {
      title: "Inventory",
      items: [
        { id: "inventory", label: "Stock", icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined, badgeTone: "amber", permission: "inventory.view" }
      ]
    },
    {
      title: "Orders",
      items: [
        { id: "orders", label: "Orders", icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeTone: "amber", permission: "orders.view" },
        { id: "customers", label: "Customers", icon: Users, permission: "customers.view" }
      ]
    },
    {
      title: "Marketing",
      items: [
        { id: "whatsapp", label: "WhatsApp", icon: MessageCircleMore, permission: "notifications.view" },
        { id: "coupons", label: "Coupons & Offers", icon: Percent, permission: "coupons.view" }
      ]
    },
    {
      title: "Reports",
      items: [
        { id: "reports", label: "Reports & Analytics", icon: BarChart3, permission: "reports.view" }
      ]
    },
    {
      title: "System",
      items: [
        { id: "roles", label: "Users & Roles", icon: ShieldCheck, permission: "roles.view" },
        { id: "logs", label: "Activity Logs", icon: History, badge: activityLogs.length > 0 ? activityLogs.length : undefined, badgeTone: "emerald", permission: "logs.view" },
        { id: "settings", label: "Settings", icon: Settings, permission: "settings.view" }
      ]
    }
  ];

  const rolesList: AdminRole[] = [
    "Super Admin",
    "Admin",
    "Inventory Manager",
    "Marketing Manager",
    "Delivery Manager",
    "Customer Support",
    "Read Only"
  ];

  const handleNavClick = (id: string) => {
    onSelectModule(id);
    setIsSidebarOpen(false);
  };

  const activeItemLabel = navGroups.flatMap((g) => g.items).find((i) => i.id === activeModule)?.label || "Dashboard";

  return (
    <div className={cn("min-h-screen bg-cream-50 dark:bg-zinc-950 text-brand-950 dark:text-zinc-100 font-sans transition-colors duration-200 flex flex-col", isDarkMode && "dark")}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-brand-100 dark:border-zinc-800 h-16 px-4 md:px-6 flex items-center justify-between gap-4 shadow-soft">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-brand-700 dark:text-zinc-300 hover:bg-brand-50 dark:hover:bg-zinc-800 transition"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center text-amber-400 font-display font-black text-lg shadow-sm">
              ⚡
            </div>
            <div className="hidden xs:block">
              <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-purple-950 dark:text-zinc-100 flex items-center gap-1.5">
                FlashKart <span className="text-[10px] font-sans font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">Admin</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar Button */}
        <div className="flex-1 max-w-md hidden sm:block min-w-0">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-brand-50/70 dark:bg-zinc-800/70 border border-brand-200/60 dark:border-zinc-700/60 text-sm text-brand-700 dark:text-zinc-400 hover:border-brand-400 dark:hover:border-brand-500 transition shadow-sm group"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Search className="w-4 h-4 text-brand-500 dark:text-brand-400 group-hover:scale-110 transition shrink-0" />
              <span className="truncate">Search products, SKUs, orders, invoices...</span>
            </span>
            <kbd className="hidden md:inline-block text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded border border-brand-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-brand-600 dark:text-zinc-300">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, RBAC Switcher, Theme, Profile */}
        <div className="flex items-center gap-1 xs:gap-2 md:gap-3">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 rounded-xl text-brand-700 dark:text-zinc-300 hover:bg-brand-50 dark:hover:bg-zinc-800 transition"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Fixed Super Admin Role Badge — Non-editable / No Dropdown */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 text-[#067a46] dark:text-emerald-300 text-xs font-extrabold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#067a46] dark:text-emerald-400 shrink-0" />
            <span className="hidden md:inline">Super Admin</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-brand-700 dark:text-zinc-300 hover:bg-brand-50 dark:hover:bg-zinc-800 transition"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
              className="p-2 rounded-xl text-brand-700 dark:text-zinc-300 hover:bg-brand-50 dark:hover:bg-zinc-800 transition relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {(pendingOrdersCount > 0 || lowStockCount > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cta-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
              )}
            </button>
            {isNotifMenuOpen && (
              <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-brand-100 dark:border-zinc-800 p-3 z-50 space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-brand-100 dark:border-zinc-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-900 dark:text-zinc-200">System Notifications</span>
                  <span className="text-[10px] bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-semibold">Live</span>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {pendingOrdersCount > 0 && (
                    <div onClick={() => { handleNavClick("orders"); setIsNotifMenuOpen(false); }} className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 cursor-pointer hover:bg-amber-100/70 transition">
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-200">📦 {pendingOrdersCount} Pending Orders</div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-300/80">Requires driver assignment and dispatch.</div>
                    </div>
                  )}
                  {lowStockCount > 0 && (
                    <div onClick={() => { handleNavClick("inventory"); setIsNotifMenuOpen(false); }} className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 cursor-pointer hover:bg-rose-100/70 transition">
                      <div className="text-xs font-bold text-rose-900 dark:text-rose-200">⚠️ {lowStockCount} Products Low in Stock</div>
                      <div className="text-[11px] text-rose-700 dark:text-rose-300/80">Stock dropped below minimum threshold.</div>
                    </div>
                  )}
                  {pendingOrdersCount === 0 && lowStockCount === 0 && (
                    <div className="py-6 text-center text-xs text-brand-600 dark:text-zinc-500">
                      All systems normal. No pending alerts.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-brand-50 dark:hover:bg-zinc-800 transition border border-transparent hover:border-brand-200 dark:hover:border-zinc-700"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-brand-700 dark:text-zinc-400 hidden sm:block" />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-brand-100 dark:border-zinc-800 p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 bg-brand-50 dark:bg-zinc-800/80 rounded-xl mb-1">
                  <div className="text-xs font-bold text-brand-950 dark:text-zinc-100">{user?.name}</div>
                  <div className="text-[11px] text-brand-600 dark:text-zinc-400 truncate">{user?.email}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-200 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
                    <ShieldCheck className="w-3 h-3" /> {user?.role}
                  </div>
                </div>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-brand-800 dark:text-zinc-300 hover:bg-brand-50 dark:hover:bg-zinc-800 transition"
                >
                  <span className="flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5" /> Open Storefront</span>
                  <span className="text-[10px] text-brand-500">Live Web</span>
                </a>
                <button
                  onClick={() => { toggle2FA(); setIsProfileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-brand-800 dark:text-zinc-300 hover:bg-brand-50 dark:hover:bg-zinc-800 transition"
                >
                  <span>Two-Factor Auth (2FA)</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.2 rounded", user?.twoFactorEnabled ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700")}>
                    {user?.twoFactorEnabled ? "ENABLED" : "DISABLED"}
                  </span>
                </button>
                <div className="border-t border-brand-100 dark:border-zinc-800 my-1" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar and Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-brand-950/40 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-zinc-900 border-r border-brand-100 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out shrink-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Mobile Header in Drawer */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-brand-100 dark:border-zinc-800 lg:hidden">
            <span className="font-display font-bold text-lg text-purple-950 dark:text-zinc-100">FlashKart Menu</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-brand-700 dark:text-zinc-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-brand-500 dark:text-zinc-500 mb-1">
                  {group.title}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = activeModule === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition group",
                          isActive
                            ? "bg-brand-900 dark:bg-brand-600 text-white shadow-soft font-semibold"
                            : "text-brand-800 dark:text-zinc-400 hover:bg-brand-50 dark:hover:bg-zinc-800/70 hover:text-brand-950 dark:hover:text-zinc-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn("w-4 h-4 shrink-0 transition", isActive ? "text-white" : "text-brand-600 dark:text-zinc-500 group-hover:text-brand-900 dark:group-hover:text-zinc-200")} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                              isActive
                                ? "bg-white/20 text-white"
                                : item.badgeTone === "red"
                                ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                                : item.badgeTone === "amber"
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer Support Card */}
          <div className="p-4 border-t border-brand-100 dark:border-zinc-800 bg-brand-50/50 dark:bg-zinc-900 space-y-3">
            <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl border border-brand-100 dark:border-zinc-700 text-xs space-y-2 shadow-sm">
              <div className="flex items-center justify-between font-bold text-brand-950 dark:text-zinc-100">
                <span>System Health</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 100% OK
                </span>
              </div>
              <div className="text-[11px] text-brand-600 dark:text-zinc-400 leading-relaxed">
                PostgreSQL connected · API latency 18ms · Auth JWT active.
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold border border-rose-200 dark:border-rose-900/50 transition shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-cream-50 dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Breadcrumb / Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-brand-200/50 dark:border-zinc-800">
              <div>
                <div className="text-xs text-brand-600 dark:text-zinc-500 font-medium flex items-center gap-1.5">
                  <span>FlashKart Admin</span> <ChevronRight className="w-3 h-3" /> <span className="text-purple-950 dark:text-zinc-300 font-bold">{activeItemLabel}</span>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-950 dark:text-zinc-100 mt-0.5">
                  {activeItemLabel}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-zinc-400">
                <span>Active Session:</span>
                <span className="font-semibold text-brand-900 dark:text-zinc-200 px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 shadow-sm">
                  {user?.name || "Super Admin"}
                </span>
              </div>
            </div>

            {/* Dynamic Module Content */}
            <div className="min-h-[70vh]">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Global Keyboard Accessible Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectModule={(mod, q) => onSelectModule(mod, q)}
      />
    </div>
  );
}
