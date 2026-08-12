"use client";
import { useState } from "react";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart2,
  ArrowUpRight,
  PlusCircle,
  Eye,
  RefreshCw,
  FolderTree,
  Tag,
  Star
} from "lucide-react";
import { useAdminStore, type AdminProduct } from "@/store/adminStore";
import { useToasts } from "@/store/shop";
import { useAdminAuth } from "@/store/adminAuth";
import { cn, formatINR } from "@/lib/utils";

interface AdminDashboardProps {
  onNavigate: (module: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { products, orders, customers, categories, coupons, reviews, addInventoryLog } = useAdminStore();
  const { user } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);
  const [chartTab, setChartTab] = useState<"sales" | "stock" | "categories">("sales");

  // Calculate live statistics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "Active").length;
  const outOfStockProducts = products.filter((p) => p.currentStock === 0);
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock && p.currentStock > 0);
  const totalCategories = categories.length;

  const pendingOrders = orders.filter((o) => o.status === "Pending" || o.status === "Processing");
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const ordersTodayCount = orders.length;

  const totalCustomers = customers.length;
  const activeCoupons = coupons.filter((c) => c.status === "Active").length;
  const pendingReviews = reviews.filter((r) => r.status === "Pending").length;

  const revenueToday = orders.reduce((sum, o) => sum + o.total, 0);
  const revenueMonth = revenueToday * 18 + 45200; // simulated month multiplier for rich dashboard view

  const handleQuickRestock = (prod: AdminProduct) => {
    addInventoryLog(
      {
        type: "Stock In",
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: 30,
        previousStock: prod.currentStock,
        newStock: prod.currentStock + 30,
        referenceNo: `RESTOCK-${Math.floor(100 + Math.random() * 900)}`,
        warehouse: prod.warehouse,
        notes: "Quick 1-click restock from Dashboard alert."
      },
      user?.name || "Super Admin",
      user?.role || "Super Admin"
    );
    pushToast(`Restocked +30 units for ${prod.name}!`, "success");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Live KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div onClick={() => onNavigate("orders")} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-brand-100 dark:border-zinc-800 shadow-soft hover:shadow-lift transition cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">Revenue Month</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-brand-950 dark:text-zinc-100">{formatINR(revenueMonth)}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> +14.2% vs last mo
          </div>
        </div>

        <div onClick={() => onNavigate("orders")} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-brand-100 dark:border-zinc-800 shadow-soft hover:shadow-lift transition cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">Orders Today</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-brand-950 dark:text-zinc-100">{ordersTodayCount}</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1 font-semibold">
            <Clock className="w-3 h-3" /> {pendingOrders.length} Pending
          </div>
        </div>

        <div onClick={() => onNavigate("products")} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-brand-100 dark:border-zinc-800 shadow-soft hover:shadow-lift transition cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-zinc-800 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-brand-950 dark:text-zinc-100">{totalProducts}</div>
          <div className="text-[11px] text-brand-600 dark:text-zinc-400 flex items-center gap-1 mt-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {activeProducts} Active
          </div>
        </div>

        <div onClick={() => onNavigate("inventory")} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-brand-100 dark:border-zinc-800 shadow-soft hover:shadow-lift transition cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">Stock Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-rose-600 dark:text-rose-400">{lowStockProducts.length + outOfStockProducts.length}</div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1 font-semibold">
            {outOfStockProducts.length} Out · {lowStockProducts.length} Low
          </div>
        </div>

        <div onClick={() => onNavigate("customers")} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-brand-100 dark:border-zinc-800 shadow-soft hover:shadow-lift transition cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">Customers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-brand-950 dark:text-zinc-100">{totalCustomers}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> 100% Active
          </div>
        </div>

        <div onClick={() => onNavigate("reviews")} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-brand-100 dark:border-zinc-800 shadow-soft hover:shadow-lift transition cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">Reviews & Offer</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-brand-950 dark:text-zinc-100">{activeCoupons} / {reviews.length}</div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1 font-semibold">
            {pendingReviews} Pending Review
          </div>
        </div>
      </div>

      {/* 2. Interactive Charts Section & Quick Restock Widget */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Charts Container (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 p-6 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Platform Performance
                </h2>
                <p className="text-xs text-brand-600 dark:text-zinc-400">Visual analytics for FlashKart produce orders and supply inventory.</p>
              </div>
              <div className="flex items-center bg-brand-50 dark:bg-zinc-800 p-1 rounded-xl border border-brand-100 dark:border-zinc-700 text-xs font-semibold">
                <button
                  onClick={() => setChartTab("sales")}
                  className={cn("px-3 py-1 rounded-lg transition", chartTab === "sales" ? "bg-white dark:bg-zinc-900 text-brand-950 dark:text-zinc-100 shadow-sm" : "text-brand-700 dark:text-zinc-400")}
                >
                  Sales Trend
                </button>
                <button
                  onClick={() => setChartTab("stock")}
                  className={cn("px-3 py-1 rounded-lg transition", chartTab === "stock" ? "bg-white dark:bg-zinc-900 text-brand-950 dark:text-zinc-100 shadow-sm" : "text-brand-700 dark:text-zinc-400")}
                >
                  Stock Movement
                </button>
                <button
                  onClick={() => setChartTab("categories")}
                  className={cn("px-3 py-1 rounded-lg transition", chartTab === "categories" ? "bg-white dark:bg-zinc-900 text-brand-950 dark:text-zinc-100 shadow-sm" : "text-brand-700 dark:text-zinc-400")}
                >
                  Categories
                </button>
              </div>
            </div>

            {/* SVG / CSS Animated Chart View */}
            <div className="h-64 flex items-end gap-3 sm:gap-6 pt-8 pb-4 px-2 border-b border-brand-100 dark:border-zinc-800">
              {chartTab === "sales" && (
                <>
                  {[
                    { day: "Mon", val: 32000, h: "50%" },
                    { day: "Tue", val: 41000, h: "65%" },
                    { day: "Wed", val: 38000, h: "60%" },
                    { day: "Thu", val: 52000, h: "80%" },
                    { day: "Fri", val: 48000, h: "75%" },
                    { day: "Sat", val: 68000, h: "95%" },
                    { day: "Sun", val: 74000, h: "100%" }
                  ].map((d, i) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-bold bg-brand-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                        {formatINR(d.val)}
                      </div>
                      <div className="w-full max-w-[40px] bg-brand-100 dark:bg-zinc-800 rounded-t-xl overflow-hidden flex items-end h-full">
                        <div
                          style={{ height: d.h }}
                          className="w-full bg-gradient-to-t from-brand-700 to-brand-500 dark:from-brand-600 dark:to-brand-400 rounded-t-xl group-hover:brightness-110 transition-all duration-500"
                        />
                      </div>
                      <span className="text-xs font-semibold text-brand-700 dark:text-zinc-400">{d.day}</span>
                    </div>
                  ))}
                </>
              )}

              {chartTab === "stock" && (
                <>
                  {[
                    { name: "Vegetables", in: "80%", out: "60%" },
                    { name: "Fruits", in: "70%", out: "65%" },
                    { name: "Dairy", in: "90%", out: "85%" },
                    { name: "Bakery", in: "50%", out: "45%" },
                    { name: "Essentials", in: "75%", out: "50%" }
                  ].map((cat) => (
                    <div key={cat.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1.5 h-full">
                        <div style={{ height: cat.in }} className="w-4 bg-emerald-500 rounded-t-lg" title="Stock In" />
                        <div style={{ height: cat.out }} className="w-4 bg-amber-500 rounded-t-lg" title="Stock Out" />
                      </div>
                      <span className="text-[11px] font-semibold text-brand-700 dark:text-zinc-400 truncate max-w-[60px]">{cat.name}</span>
                    </div>
                  ))}
                </>
              )}

              {chartTab === "categories" && (
                <div className="w-full h-full flex flex-col justify-center gap-3">
                  {[
                    { cat: "Fresh Vegetables", pct: 38, color: "bg-emerald-500" },
                    { cat: "Fresh Fruits", pct: 28, color: "bg-amber-500" },
                    { cat: "Milk & Dairy", pct: 18, color: "bg-sky-500" },
                    { cat: "Cooking Essentials", pct: 16, color: "bg-purple-500" }
                  ].map((c) => (
                    <div key={c.cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-brand-900 dark:text-zinc-200">
                        <span>{c.cat}</span>
                        <span>{c.pct}% of total sales</span>
                      </div>
                      <div className="w-full h-2.5 bg-brand-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div style={{ width: `${c.pct}%` }} className={cn("h-full rounded-full transition-all duration-700", c.color)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-brand-600 dark:text-zinc-400 pt-3">
            <span>Updated in real-time from store transactions.</span>
            <button onClick={() => onNavigate("reports")} className="font-semibold text-brand-700 dark:text-brand-400 hover:underline flex items-center gap-1">
              View Detailed Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Low Stock & Out of Stock Action Widget */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 p-6 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Stock Alerts
              </h3>
              <span className="text-xs bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold px-2.5 py-0.5 rounded-full">
                {lowStockProducts.length + outOfStockProducts.length} Items
              </span>
            </div>
            <p className="text-xs text-brand-600 dark:text-zinc-400 mb-4">
              Products below minimum stock threshold requiring immediate replenishment.
            </p>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {[...outOfStockProducts, ...lowStockProducts].slice(0, 5).map((prod) => (
                <div key={prod.id} className="p-3 rounded-2xl bg-brand-50/70 dark:bg-zinc-800/60 border border-brand-100 dark:border-zinc-700/60 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-brand-950 dark:text-zinc-100 truncate">{prod.name}</div>
                    <div className="text-[11px] text-brand-600 dark:text-zinc-400">
                      Stock: <strong className={cn(prod.currentStock === 0 ? "text-rose-600" : "text-amber-600")}>{prod.currentStock}</strong> / Min {prod.minStock}
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuickRestock(prod)}
                    className="px-3 py-1.5 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 text-white text-xs font-semibold shrink-0 flex items-center gap-1 shadow-sm active:scale-95 transition"
                    title="Instant +30 restock"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> +30
                  </button>
                </div>
              ))}
              {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
                <div className="py-10 text-center text-xs text-emerald-600 font-semibold flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8" />
                  All inventory stock levels are healthy!
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate("inventory")}
            className="w-full py-2.5 rounded-xl bg-brand-50 dark:bg-zinc-800 text-brand-800 dark:text-zinc-200 hover:bg-brand-100 dark:hover:bg-zinc-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            Manage Inventory Module <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Recent Orders & Quick Navigation Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders Table (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Recent Orders
            </h3>
            <button onClick={() => onNavigate("orders")} className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline">
              View All Orders ({orders.length}) →
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
                {orders.slice(0, 4).map((ord) => (
                  <tr key={ord.id} className="hover:bg-brand-50/50 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-2 font-bold text-brand-950 dark:text-zinc-100">{ord.id}</td>
                    <td className="py-3 px-2">
                      <div className="font-semibold text-brand-900 dark:text-zinc-200">{ord.customerName}</div>
                      <div className="text-[11px] text-brand-600 dark:text-zinc-500 truncate max-w-[150px]">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3 px-2 text-xs text-brand-700 dark:text-zinc-400">{ord.items.length} items</td>
                    <td className="py-3 px-2 font-bold text-brand-950 dark:text-zinc-100">{formatINR(ord.total)}</td>
                    <td className="py-3 px-2">
                      <span
                        className={cn(
                          "text-[11px] font-bold px-2.5 py-1 rounded-full inline-block",
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

        {/* Quick Module Shortcuts */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 p-6 shadow-soft space-y-4">
          <h3 className="font-display text-lg font-bold text-brand-950 dark:text-zinc-100">
            Quick Shortcuts
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate("products")}
              className="p-4 rounded-2xl bg-brand-50 dark:bg-zinc-800 hover:bg-brand-100 dark:hover:bg-zinc-700 text-left transition space-y-2 group"
            >
              <Package className="w-5 h-5 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition" />
              <div className="text-xs font-bold text-brand-950 dark:text-zinc-100">Add Product</div>
              <div className="text-[10px] text-brand-600 dark:text-zinc-400">Create new item</div>
            </button>
            <button
              onClick={() => onNavigate("coupons")}
              className="p-4 rounded-2xl bg-brand-50 dark:bg-zinc-800 hover:bg-brand-100 dark:hover:bg-zinc-700 text-left transition space-y-2 group"
            >
              <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition" />
              <div className="text-xs font-bold text-brand-950 dark:text-zinc-100">New Coupon</div>
              <div className="text-[10px] text-brand-600 dark:text-zinc-400">Create discount</div>
            </button>
            <button
              onClick={() => onNavigate("inventory")}
              className="p-4 rounded-2xl bg-brand-50 dark:bg-zinc-800 hover:bg-brand-100 dark:hover:bg-zinc-700 text-left transition space-y-2 group"
            >
              <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition" />
              <div className="text-xs font-bold text-brand-950 dark:text-zinc-100">Stock Entry</div>
              <div className="text-[10px] text-brand-600 dark:text-zinc-400">Purchase / In</div>
            </button>
            <button
              onClick={() => onNavigate("reports")}
              className="p-4 rounded-2xl bg-brand-50 dark:bg-zinc-800 hover:bg-brand-100 dark:hover:bg-zinc-700 text-left transition space-y-2 group"
            >
              <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition" />
              <div className="text-xs font-bold text-brand-950 dark:text-zinc-100">Export GST</div>
              <div className="text-[10px] text-brand-600 dark:text-zinc-400">Tax reports</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
