"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  Package,
  History,
  X,
  Pencil,
  ChevronDown
} from "lucide-react";
import { useAdminStore, productStockInfo, type AdminProduct } from "@/store/adminStore";
import { WeightInput } from "./ProductManagement";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn, formatWeight } from "@/lib/utils";

export type StockFilter = "all" | "in" | "low" | "out";

const STATUS_STYLES: Record<string, string> = {
  "In Stock": "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300",
  "Low Stock": "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300",
  "Out of Stock": "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
};

export function InventoryModule({ initialFilter = "all" }: { initialFilter?: StockFilter }) {
  const { products, stockHistory, updateProductStockGrams } = useAdminStore();
  const { user, hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);
  const canManage = hasPermission("inventory.edit");

  const [tab, setTab] = useState<"stock" | "history">("stock");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StockFilter>(initialFilter);
  const [categoryFilter, setCategoryFilter] = useState("All");
  // Products expanded to show their pack sizes
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Edit Stock modal — edits the product's ONE shared physical stock
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [draftGrams, setDraftGrams] = useState(0);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const infoOf = (p: AdminProduct) => productStockInfo(p);
  const inCount = products.filter((p) => infoOf(p).status === "In Stock").length;
  const lowCount = products.filter((p) => infoOf(p).status === "Low Stock").length;
  const outCount = products.filter((p) => infoOf(p).allOut).length;

  const visibleProducts = products.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q);
    const i = infoOf(p);
    const matchF =
      filter === "all" ||
      (filter === "in" && i.status === "In Stock") ||
      (filter === "low" && i.status === "Low Stock") ||
      (filter === "out" && i.allOut);
    const matchC = categoryFilter === "All" || p.category === categoryFilter;
    return matchQ && matchF && matchC;
  });

  // When filtering by low/out (or searching), auto-expand the pack list
  const isExpanded = (p: AdminProduct) =>
    expanded[p.id] ?? (filter === "low" || filter === "out" || query.trim().length > 0);

  const openEditor = (p: AdminProduct) => {
    setEditing(p);
    setDraftGrams(p.stockGrams ?? 0);
  };

  const saveStock = () => {
    if (!editing) return;
    if (!canManage) {
      pushToast("Permission denied: you need inventory edit access", "info");
      return;
    }
    const next = Math.max(0, Math.round(draftGrams));
    updateProductStockGrams(editing.id, next, user?.name || "Super Admin", user?.role || "Super Admin");
    pushToast(`✓ Stock updated: ${editing.name} ${formatWeight(editing.stockGrams ?? 0)} → ${formatWeight(next)}`, "success");
    setEditing(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft">
        <h2 className="font-display text-xl md:text-2xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
          <Boxes className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Stock
        </h2>
        <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">
          One physical inventory per product (in kg / g), shared by all its pack sizes. Every sale deducts the exact weight ordered.
        </p>
      </div>

      {/* Summary cards (clickable filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { f: "all" as StockFilter, label: "Products", value: products.length, icon: Package, cls: "text-brand-950 dark:text-zinc-100", sub: `${formatWeight(products.reduce((n, p) => n + (p.stockGrams ?? 0), 0))} total inventory` },
          { f: "in" as StockFilter, label: "In Stock", value: inCount, icon: CheckCircle2, cls: "text-emerald-600", sub: "Healthy products" },
          { f: "low" as StockFilter, label: "Low Stock", value: lowCount, icon: AlertTriangle, cls: "text-amber-600", sub: "Below weight threshold" },
          { f: "out" as StockFilter, label: "Out of Stock", value: outCount, icon: AlertTriangle, cls: "text-rose-600", sub: "Cannot fulfil any pack" }
        ].map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.f}
              onClick={() => { setFilter(c.f); setTab("stock"); }}
              className={cn(
                "text-left bg-white dark:bg-zinc-900 p-5 rounded-3xl border shadow-soft transition",
                filter === c.f ? "border-brand-400 ring-1 ring-brand-300" : "border-brand-100 dark:border-zinc-800 hover:border-brand-300"
              )}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                <span>{c.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <div className={cn("font-display font-bold text-2xl", c.cls)}>{c.value}</div>
              <div className="text-[11px] text-brand-600 dark:text-zinc-500 font-semibold mt-1">{c.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-200/60 dark:border-zinc-800 text-xs font-bold">
        {[
          { id: "stock" as const, label: "Stock", icon: Boxes },
          { id: "history" as const, label: "Stock History", icon: History }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-t-2xl transition border-b-2 whitespace-nowrap",
                tab === t.id
                  ? "border-brand-600 dark:border-brand-400 bg-white dark:bg-zinc-900 text-brand-950 dark:text-zinc-100 shadow-sm"
                  : "border-transparent text-brand-700 dark:text-zinc-400 hover:bg-brand-50 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "stock" && (
        <div className="space-y-4">
          {/* Search + filters */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-brand-100 dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-brand-500 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 text-xs text-brand-950 dark:text-zinc-100 outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              {([
                { id: "all", label: "All" },
                { id: "in", label: "In Stock" },
                { id: "low", label: "Low Stock" },
                { id: "out", label: "Out of Stock" }
              ] as { id: StockFilter; label: string }[]).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border transition",
                    filter === f.id
                      ? "bg-brand-900 dark:bg-brand-600 text-white border-brand-900 dark:border-brand-600"
                      : "bg-white dark:bg-zinc-800 text-brand-700 dark:text-zinc-300 border-brand-200 dark:border-zinc-700 hover:border-brand-400"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-brand-900 dark:text-zinc-200 outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Product stock table */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-50/60 dark:bg-zinc-800/80 border-b border-brand-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Pack Sizes</th>
                    <th className="py-3.5 px-4">Available Stock</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100/60 dark:divide-zinc-800 text-xs">
                  {visibleProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-brand-600 dark:text-zinc-500 font-medium">
                        No products match your search or filter.
                      </td>
                    </tr>
                  )}
                  {visibleProducts.map((p) => {
                    const i = infoOf(p);
                    const open = isExpanded(p);
                    return [
                      <tr
                        key={p.id}
                        onClick={() => setExpanded((e) => ({ ...e, [p.id]: !open }))}
                        className="hover:bg-brand-50/40 dark:hover:bg-zinc-800/40 transition cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-brand-50 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 shrink-0">
                              <Image src={p.image} alt={p.name} fill sizes="36px" className="object-cover" unoptimized />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 truncate max-w-[280px]">{p.name}</div>
                              <div className="text-[11px] text-brand-600 dark:text-zinc-500 truncate">{p.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-brand-900 dark:text-zinc-200 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            {p.weights.length} pack{p.weights.length === 1 ? "" : "s"}
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-sm text-brand-950 dark:text-zinc-100 whitespace-nowrap">{formatWeight(i.totalGrams)}</td>
                        <td className="py-3 px-4">
                          <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full inline-block whitespace-nowrap", STATUS_STYLES[i.status])}>
                            {i.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditor(p); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit Stock
                          </button>
                        </td>
                      </tr>,
                      open && (
                        <tr key={`${p.id}-detail`} className="bg-brand-50/30 dark:bg-zinc-800/30">
                          <td colSpan={5} className="px-4 pb-3 pt-1">
                            <div className="rounded-2xl border border-brand-100 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="text-[10px] font-bold uppercase tracking-wider text-brand-500 dark:text-zinc-500 border-b border-brand-100/70 dark:border-zinc-800">
                                    <th className="py-2 px-3">Pack Size</th>
                                    <th className="py-2 px-3">Pack Weight</th>
                                    <th className="py-2 px-3">Price</th>
                                    <th className="py-2 px-3">Orderable</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-100/50 dark:divide-zinc-800">
                                  {p.weights.map((w) => {
                                    const orderable = w.active !== false && i.totalGrams >= Math.max(1, w.grams);
                                    const maxPacks = Math.floor(i.totalGrams / Math.max(1, w.grams));
                                    return (
                                      <tr key={w.label}>
                                        <td className="py-2 px-3 font-semibold text-brand-900 dark:text-zinc-200 whitespace-nowrap">
                                          {w.label}
                                          {w.active === false && (
                                            <span className="ml-1.5 text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Inactive</span>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 font-semibold text-brand-800 dark:text-zinc-300 whitespace-nowrap">{formatWeight(w.grams)}</td>
                                        <td className="py-2 px-3 font-bold text-brand-950 dark:text-zinc-100 whitespace-nowrap">₹{w.price}</td>
                                        <td className="py-2 px-3">
                                          <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full inline-block whitespace-nowrap",
                                            orderable ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                                          )}>
                                            {orderable ? `Yes · up to ${maxPacks} pack${maxPacks === 1 ? "" : "s"}` : w.active === false ? "Inactive" : "Not enough stock"}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )
                    ];
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 overflow-hidden shadow-soft">
          <div className="px-6 py-4 border-b border-brand-100 dark:border-zinc-800">
            <h3 className="font-display text-lg font-bold text-brand-950 dark:text-zinc-100">Stock History</h3>
            <p className="text-xs text-brand-600 dark:text-zinc-400">Every weight change — manual edits, customer orders, and cancellations.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-50/60 dark:bg-zinc-800/80 border-b border-brand-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Change</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/60 dark:divide-zinc-800 text-xs">
                {stockHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-brand-600 dark:text-zinc-500 font-medium">
                      No stock changes recorded yet.
                    </td>
                  </tr>
                )}
                {stockHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-brand-50/40 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-brand-950 dark:text-zinc-100">{h.date} {h.time}</td>
                    <td className="py-3 px-4 font-bold text-brand-950 dark:text-zinc-100">{h.productName}</td>
                    <td className="py-3 px-4 font-semibold whitespace-nowrap">
                      <span className="text-brand-700 dark:text-zinc-300">{formatWeight(h.oldStock)}</span>
                      <span className="text-brand-400 mx-1">→</span>
                      <span className={cn("font-bold", h.newStock > h.oldStock ? "text-emerald-600" : "text-rose-600")}>{formatWeight(h.newStock)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md",
                        h.reason === "Sale" ? "bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300" :
                        h.reason === "Return" ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300" :
                        "bg-brand-100 dark:bg-zinc-800 text-brand-800 dark:text-zinc-300"
                      )}>
                        {h.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-700 dark:text-zinc-400">{h.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Stock modal — product-level physical stock in kg / g */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 border border-brand-100 dark:border-zinc-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-brand-100 dark:border-zinc-800 pb-3">
              <h3 className="font-display text-lg font-bold text-brand-950 dark:text-zinc-100">Edit Stock</h3>
              <button onClick={() => setEditing(null)} className="p-1 text-brand-700 hover:text-brand-950 dark:text-zinc-400 dark:hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-50 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 shrink-0">
                <Image src={editing.image} alt={editing.name} fill sizes="48px" className="object-cover" unoptimized />
              </div>
              <div>
                <div className="font-bold text-sm text-brand-950 dark:text-zinc-100">{editing.name}</div>
                <div className="text-xs text-brand-600 dark:text-zinc-400 font-semibold">
                  Current stock: <strong className="text-brand-950 dark:text-zinc-100">{formatWeight(editing.stockGrams ?? 0)}</strong>
                  <span className="text-brand-400"> · shared by all pack sizes</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-900 dark:text-zinc-200 mb-1.5">New Stock</label>
              <div className="flex items-center gap-3">
                <WeightInput grams={draftGrams} onChange={setDraftGrams} />
                <span className="font-display font-bold text-lg text-brand-950 dark:text-zinc-100 whitespace-nowrap">= {formatWeight(draftGrams)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-bold">
              {[
                { label: "+1 kg", g: 1000 },
                { label: "+5 kg", g: 5000 },
                { label: "+10 kg", g: 10000 },
                { label: "+25 kg", g: 25000 }
              ].map((q) => (
                <button
                  key={q.label}
                  onClick={() => setDraftGrams((v) => v + q.g)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                >
                  {q.label}
                </button>
              ))}
              <button
                onClick={() => setDraftGrams((v) => Math.max(0, v - 1000))}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition"
              >
                −1 kg
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 rounded-xl bg-brand-50 dark:bg-zinc-800 text-brand-800 dark:text-zinc-200 hover:bg-brand-100 dark:hover:bg-zinc-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={saveStock}
                disabled={!canManage}
                className="flex-1 py-2.5 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition active:scale-95"
              >
                Save Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
