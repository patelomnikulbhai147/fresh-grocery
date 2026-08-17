"use client";
import {
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  PlusCircle,
  Eye,
  Boxes,
  FolderTree
} from "lucide-react";
import { useAdminStore, productStockInfo } from "@/store/adminStore";
import { useToasts } from "@/store/shop";
import { useAdminAuth } from "@/store/adminAuth";
import { cn, formatINR, formatWeight } from "@/lib/utils";

interface AdminDashboardProps {
  onNavigate: (module: string, opts?: { stockFilter?: "all" | "in" | "low" | "out" }) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { products, orders, customers, updateProductStockGrams } = useAdminStore();
  const { user } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  // Live statistics — everything here is computed from real store data
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "Active").length;
  const pendingOrders = orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Weight-based product status (same rule as Products & Stock screens):
  // Out of Stock when remaining grams can't fulfil any active pack; Low below the weight threshold.
  const lowProducts = products.filter((p) => productStockInfo(p).status === "Low Stock");
  const outProducts = products.filter((p) => productStockInfo(p).allOut);

  const handleQuickRestock = (p: (typeof products)[number]) => {
    const prev = p.stockGrams ?? 0;
    const next = prev + 5000; // +5 kg
    updateProductStockGrams(p.id, next, user?.name || "Super Admin", user?.role || "Super Admin");
    pushToast(`✓ Stock updated: ${p.name} ${formatWeight(prev)} → ${formatWeight(next)}`, "success");
  };

  const cards = [
    {
      label: "Products",
      value: String(totalProducts),
      sub: `${activeProducts} active`,
      icon: Package,
      tint: "bg-brand-50 dark:bg-zinc-800 text-brand-600 dark:text-brand-400",
      onClick: () => onNavigate("products")
    },
    {
      label: "Orders",
      value: String(orders.length),
      sub: `${pendingOrders} pending`,
      icon: ShoppingBag,
      tint: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
      onClick: () => onNavigate("orders")
    },
    {
      label: "Customers",
      value: String(customers.length),
      sub: "registered",
      icon: Users,
      tint: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
      onClick: () => onNavigate("customers")
    },
    {
      label: "Revenue",
      value: formatINR(totalRevenue),
      sub: `across ${orders.length} orders`,
      icon: IndianRupee,
      tint: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
      onClick: () => onNavigate("orders")
    },
    {
      label: "Low Stock",
      value: String(lowProducts.length),
      sub: "products need restocking",
      icon: AlertTriangle,
      tint: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
      valueClass: "text-amber-600",
      onClick: () => onNavigate("inventory", { stockFilter: "low" })
    },
    {
      label: "Out of Stock",
      value: String(outProducts.length),
      sub: "products unavailable",
      icon: AlertTriangle,
      tint: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400",
      valueClass: "text-rose-600",
      onClick: () => onNavigate("inventory", { stockFilter: "out" })
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={c.onClick}
              className="text-left bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-brand-100 dark:border-zinc-800 shadow-soft hover:shadow-lift transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">{c.label}</span>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition", c.tint)}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={cn("font-display font-bold text-2xl text-brand-950 dark:text-zinc-100 truncate", c.valueClass)}>{c.value}</div>
              <div className="text-[11px] text-brand-600 dark:text-zinc-400 mt-1 font-semibold">{c.sub}</div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Recent Orders
            </h3>
            <button onClick={() => onNavigate("orders")} className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline">
              View All ({orders.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Items</th>
                  <th className="py-3 px-2">Total</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/60 dark:divide-zinc-800 text-sm">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-brand-600 dark:text-zinc-500 font-medium">
                      No orders yet.
                    </td>
                  </tr>
                )}
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-brand-50/50 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-2 font-bold text-brand-950 dark:text-zinc-100 whitespace-nowrap">{ord.id}</td>
                    <td className="py-3 px-2">
                      <div className="font-semibold text-brand-900 dark:text-zinc-200">{ord.customerName}</div>
                      <div className="text-[11px] text-brand-600 dark:text-zinc-500 truncate max-w-[150px]">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3 px-2 text-xs text-brand-700 dark:text-zinc-400 whitespace-nowrap">{ord.items.length} items</td>
                    <td className="py-3 px-2 font-bold text-brand-950 dark:text-zinc-100 whitespace-nowrap">{formatINR(ord.total)}</td>
                    <td className="py-3 px-2">
                      <span
                        className={cn(
                          "text-[11px] font-bold px-2.5 py-1 rounded-full inline-block whitespace-nowrap",
                          ord.status === "Delivered" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" :
                          ord.status === "Out for Delivery" ? "bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300" :
                          "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        )}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => onNavigate("orders")}
                        className="p-1.5 rounded-lg bg-brand-50 dark:bg-zinc-800 text-brand-700 dark:text-zinc-300 hover:bg-brand-100 dark:hover:bg-zinc-700 transition"
                        title="View Order"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 p-6 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock
              </h3>
              <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full">
                {lowProducts.length + outProducts.length} products
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {[...outProducts, ...lowProducts].slice(0, 6).map((p) => (
                <div key={p.id} className="p-3 rounded-2xl bg-brand-50/70 dark:bg-zinc-800/60 border border-brand-100 dark:border-zinc-700/60 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-brand-950 dark:text-zinc-100 truncate">{p.name}</div>
                    <div className="text-[11px] text-brand-600 dark:text-zinc-400">
                      Available: <strong className={cn((p.stockGrams ?? 0) === 0 ? "text-rose-600" : "text-amber-600")}>{formatWeight(p.stockGrams ?? 0)}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuickRestock(p)}
                    className="px-3 py-1.5 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 text-white text-xs font-semibold shrink-0 flex items-center gap-1 shadow-sm active:scale-95 transition"
                    title="Add 5 kg"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> +5 kg
                  </button>
                </div>
              ))}
              {lowProducts.length === 0 && outProducts.length === 0 && (
                <div className="py-10 text-center text-xs text-emerald-600 font-semibold flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8" />
                  All stock levels are healthy!
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate("inventory", { stockFilter: "low" })}
            className="w-full py-2.5 rounded-xl bg-brand-50 dark:bg-zinc-800 text-brand-800 dark:text-zinc-200 hover:bg-brand-100 dark:hover:bg-zinc-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            View All Low Stock <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 p-6 shadow-soft space-y-4">
        <h3 className="font-display text-lg font-bold text-brand-950 dark:text-zinc-100">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate("products")}
            className="p-4 rounded-2xl bg-brand-50 dark:bg-zinc-800 hover:bg-brand-100 dark:hover:bg-zinc-700 text-left transition space-y-2 group"
          >
            <Package className="w-5 h-5 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-brand-950 dark:text-zinc-100">+ Add Product</div>
            <div className="text-[10px] text-brand-600 dark:text-zinc-400">Create a new item</div>
          </button>
          <button
            onClick={() => onNavigate("inventory")}
            className="p-4 rounded-2xl bg-brand-50 dark:bg-zinc-800 hover:bg-brand-100 dark:hover:bg-zinc-700 text-left transition space-y-2 group"
          >
            <Boxes className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-brand-950 dark:text-zinc-100">Manage Stock</div>
            <div className="text-[10px] text-brand-600 dark:text-zinc-400">Update stock levels</div>
          </button>
          <button
            onClick={() => onNavigate("orders")}
            className="p-4 rounded-2xl bg-brand-50 dark:bg-zinc-800 hover:bg-brand-100 dark:hover:bg-zinc-700 text-left transition space-y-2 group"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-brand-950 dark:text-zinc-100">View Orders</div>
            <div className="text-[10px] text-brand-600 dark:text-zinc-400">Track & fulfil orders</div>
          </button>
          <button
            onClick={() => onNavigate("categories")}
            className="p-4 rounded-2xl bg-brand-50 dark:bg-zinc-800 hover:bg-brand-100 dark:hover:bg-zinc-700 text-left transition space-y-2 group"
          >
            <FolderTree className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-brand-950 dark:text-zinc-100">Add Category</div>
            <div className="text-[10px] text-brand-600 dark:text-zinc-400">Organise the catalog</div>
          </button>
        </div>
      </div>
    </div>
  );
}
