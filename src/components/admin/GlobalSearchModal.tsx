"use client";
import { useState, useEffect } from "react";
import { Search, Package, ShoppingBag, Users, Tag, FolderTree, X, ArrowRight, FileText } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: string, searchQuery?: string) => void;
}

export function GlobalSearchModal({ isOpen, onClose, onSelectModule }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const { products, orders, customers, categories, coupons } = useAdminStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery("");
          onSelectModule("search_trigger"); // just opens
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onSelectModule]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const productResults = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const orderResults = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.invoiceNo.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const customerResults = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      ).slice(0, 4)
    : [];

  const categoryResults = q
    ? categories.filter((cat) => cat.name.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const couponResults = q
    ? coupons.filter((cpn) => cpn.code.toLowerCase().includes(q) || cpn.title.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const hasResults = productResults.length > 0 || orderResults.length > 0 || customerResults.length > 0 || categoryResults.length > 0 || couponResults.length > 0;

  const handleJump = (mod: string, searchVal?: string) => {
    onSelectModule(mod, searchVal);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-brand-950/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-brand-100 dark:border-zinc-800 overflow-hidden"
        >
          {/* Input Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-100 dark:border-zinc-800 bg-brand-50/40 dark:bg-zinc-800/40">
            <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
            <input
              type="text"
              placeholder="Search across Products, SKUs, Barcodes, Orders, Invoices, Customers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-sm md:text-base text-brand-950 dark:text-zinc-100 outline-none placeholder:text-brand-700/50 dark:placeholder:text-zinc-500"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded-lg text-brand-700 hover:bg-brand-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border border-brand-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-brand-600 dark:text-zinc-400">
              ESC
            </span>
          </div>

          {/* Results Area */}
          <div className="max-h-[65vh] overflow-y-auto p-4 space-y-6">
            {!q ? (
              <div className="text-center py-12 text-brand-700 dark:text-zinc-400 space-y-2">
                <Search className="w-10 h-10 mx-auto text-brand-300 dark:text-zinc-600" />
                <p className="text-sm font-medium">Type to search the FlashKart database</p>
                <p className="text-xs text-brand-600 dark:text-zinc-500">Supports SKU, Barcode, Order ID, Invoice Number, Customer Email, and Coupon codes.</p>
              </div>
            ) : !hasResults ? (
              <div className="text-center py-12 text-brand-700 dark:text-zinc-400">
                <p className="text-sm font-medium">No results found for &quot;{query}&quot;</p>
                <p className="text-xs text-brand-600 dark:text-zinc-500 mt-1">Try searching by SKU (e.g., FLK-SKU-1000) or Customer Name.</p>
              </div>
            ) : (
              <>
                {/* Products */}
                {productResults.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400 mb-2 px-2">
                      <Package className="w-3.5 h-3.5" /> Products ({productResults.length})
                    </div>
                    <div className="space-y-1">
                      {productResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleJump("products", p.sku)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-brand-50 dark:hover:bg-zinc-800/80 transition group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-brand-700 dark:text-brand-400">
                              SKU
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-brand-950 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                                {p.name}
                              </div>
                              <div className="text-xs text-brand-600 dark:text-zinc-400">
                                {p.sku} · Barcode: {p.barcode} · Stock: {p.currentStock}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-brand-700 dark:text-zinc-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            View Product <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orders */}
                {orderResults.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400 mb-2 px-2">
                      <ShoppingBag className="w-3.5 h-3.5" /> Orders & Invoices ({orderResults.length})
                    </div>
                    <div className="space-y-1">
                      {orderResults.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => handleJump("orders", o.id)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-brand-50 dark:hover:bg-zinc-800/80 transition group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-brand-950 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                                {o.id} — {o.invoiceNo}
                              </div>
                              <div className="text-xs text-brand-600 dark:text-zinc-400">
                                Customer: {o.customerName} · ₹{o.total} · Status: {o.status}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-brand-700 dark:text-zinc-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            View Order <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customers */}
                {customerResults.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400 mb-2 px-2">
                      <Users className="w-3.5 h-3.5" /> Customers ({customerResults.length})
                    </div>
                    <div className="space-y-1">
                      {customerResults.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleJump("customers", c.email)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-brand-50 dark:hover:bg-zinc-800/80 transition group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-semibold text-sm">
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-brand-950 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                                {c.name}
                              </div>
                              <div className="text-xs text-brand-600 dark:text-zinc-400">
                                {c.email} · {c.phone} · Wallet: ₹{c.walletBalance}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-brand-700 dark:text-zinc-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            View Profile <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories & Coupons */}
                {(categoryResults.length > 0 || couponResults.length > 0) && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400 mb-2 px-2">
                      <FolderTree className="w-3.5 h-3.5" /> Categories & Offers
                    </div>
                    <div className="space-y-1">
                      {categoryResults.map((cat) => (
                        <button
                          key={cat.slug}
                          onClick={() => handleJump("categories", cat.name)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-brand-50 dark:hover:bg-zinc-800/80 transition group text-left"
                        >
                          <div className="text-sm font-semibold text-brand-950 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                            Category: {cat.name} ({cat.count} items)
                          </div>
                          <span className="text-xs font-medium text-brand-700 dark:text-zinc-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            Open <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                      {couponResults.map((cpn) => (
                        <button
                          key={cpn.id}
                          onClick={() => handleJump("coupons", cpn.code)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-brand-50 dark:hover:bg-zinc-800/80 transition group text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-bold text-brand-950 dark:text-zinc-100">{cpn.code}</span>
                            <span className="text-xs text-brand-600 dark:text-zinc-400">— {cpn.title}</span>
                          </div>
                          <span className="text-xs font-medium text-brand-700 dark:text-zinc-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            Open <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-brand-50/60 dark:bg-zinc-800/60 border-t border-brand-100 dark:border-zinc-800 flex items-center justify-between text-xs text-brand-600 dark:text-zinc-400">
            <span>Pro Tip: Press <strong className="text-brand-950 dark:text-zinc-200">Ctrl+K</strong> anywhere to toggle quick search.</span>
            <button onClick={onClose} className="font-semibold hover:underline">Close</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
