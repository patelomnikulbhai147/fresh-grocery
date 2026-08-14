"use client";
import { useState } from "react";
import {
  X,
  Layers,
  DollarSign,
  Boxes,
  Tag,
  Percent,
  Check,
  Sparkles,
  AlertCircle,
  Truck,
  Bookmark,
  Building2
} from "lucide-react";
import { useAdminStore, type AdminProduct, type ProductStatus, type DeliveryTimeOption, type ProductLabel } from "@/store/adminStore";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn, formatINR } from "@/lib/utils";

interface BulkActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onClearSelection: () => void;
}

const STATUS_OPTIONS: ProductStatus[] = ["Active", "Draft", "Hidden", "Out of Stock"];
const DELIVERY_OPTIONS: DeliveryTimeOption[] = ["10 Min", "20 Min", "30 Min", "45 Min", "Same Day"];
const LABEL_OPTIONS: ProductLabel[] = ["Organic", "Fresh", "Bestseller", "Trending", "New Arrival", "Seasonal"];

export function BulkActionDrawer({
  isOpen,
  onClose,
  selectedIds,
  onClearSelection
}: BulkActionDrawerProps) {
  const { products, categories, batchUpdateProductsInline } = useAdminStore();
  const { user, hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  const [actionType, setActionType] = useState<"price" | "stock" | "category" | "brand" | "status" | "delivery" | "label">("price");

  // Price state
  const [priceSubMode, setPriceSubMode] = useState<"percent_add" | "percent_sub" | "flat_add" | "flat_sub" | "set_exact">("percent_add");
  const [targetField, setTargetField] = useState<"price" | "mrp" | "both">("price");
  const [numValue, setNumValue] = useState("");

  // Stock state
  const [stockSubMode, setStockSubMode] = useState<"set_exact" | "add" | "sub">("add");
  const [stockVal, setStockVal] = useState("");

  // Category, Brand, Status, Delivery, Label states
  const [categoryValue, setCategoryValue] = useState(categories[0]?.slug || "vegetables");
  const [brandValue, setBrandValue] = useState("FlashKart Fresh");
  const [statusValue, setStatusValue] = useState<ProductStatus>("Active");
  const [deliveryValue, setDeliveryValue] = useState<DeliveryTimeOption>("30 Min");
  const [labelMode, setLabelMode] = useState<"add" | "remove">("add");
  const [labelValue, setLabelValue] = useState<ProductLabel>("Organic");

  if (!isOpen || selectedIds.length === 0) return null;

  const brandsList = Array.from(new Set(products.map((p) => p.brand)));

  const handleApply = () => {
    if (!hasPermission("products.bulk")) {
      pushToast("Permission denied: You need 'products.bulk' permission", "info");
      return;
    }

    const edits: Record<string, Partial<AdminProduct>> = {};
    const val = parseFloat(numValue) || 0;
    const sVal = parseFloat(stockVal) || 0;

    selectedIds.forEach((id) => {
      const p = products.find((x) => x.id === id);
      if (!p) return;

      const edit: Partial<AdminProduct> = {};

      if (actionType === "price") {
        if (targetField === "price" || targetField === "both") {
          const oldP = p.weights[0]?.price ?? p.price;
          let newP = oldP;
          if (priceSubMode === "percent_add") newP = Math.round(oldP * (1 + val / 100));
          else if (priceSubMode === "percent_sub") newP = Math.round(oldP * (1 - val / 100));
          else if (priceSubMode === "flat_add") newP = oldP + val;
          else if (priceSubMode === "flat_sub") newP = Math.max(0, oldP - val);
          else if (priceSubMode === "set_exact") newP = val;
          edit.price = newP;
        }
        if (targetField === "mrp" || targetField === "both") {
          const oldM = p.weights[0]?.mrp ?? p.mrp;
          let newM = oldM;
          if (priceSubMode === "percent_add") newM = Math.round(oldM * (1 + val / 100));
          else if (priceSubMode === "percent_sub") newM = Math.round(oldM * (1 - val / 100));
          else if (priceSubMode === "flat_add") newM = oldM + val;
          else if (priceSubMode === "flat_sub") newM = Math.max(0, oldM - val);
          else if (priceSubMode === "set_exact") newM = val;
          edit.mrp = newM;
        }
      } else if (actionType === "stock") {
        let newS = p.currentStock;
        if (stockSubMode === "set_exact") newS = sVal;
        else if (stockSubMode === "add") newS = p.currentStock + sVal;
        else if (stockSubMode === "sub") newS = Math.max(0, p.currentStock - sVal);
        edit.currentStock = newS;
      } else if (actionType === "category") {
        edit.category = categoryValue;
      } else if (actionType === "brand") {
        edit.brand = brandValue;
      } else if (actionType === "status") {
        edit.status = statusValue;
      } else if (actionType === "delivery") {
        edit.deliveryTime = deliveryValue;
      } else if (actionType === "label") {
        const currentLabels = p.labels || [];
        if (labelMode === "add" && !currentLabels.includes(labelValue)) {
          edit.labels = [...currentLabels, labelValue];
        } else if (labelMode === "remove" && currentLabels.includes(labelValue)) {
          edit.labels = currentLabels.filter((l) => l !== labelValue);
        }
      }

      edits[id] = edit;
    });

    batchUpdateProductsInline(
      edits,
      user?.name || "Super Admin",
      user?.role || "Super Admin",
      `Bulk operation (${actionType.toUpperCase()}) on ${selectedIds.length} items`
    );

    pushToast(`Successfully applied bulk ${actionType} to ${selectedIds.length} products! 🎉`, "success");
    onClearSelection();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-brand-100 flex items-center justify-between bg-gradient-to-r from-brand-900 to-brand-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Layers className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Bulk Operations</h3>
              <p className="text-xs text-brand-300">Applying changes to {selectedIds.length} selected products</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-brand-300 hover:text-white rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Type Selector */}
        <div className="p-4 border-b border-brand-100 bg-brand-50/50">
          <label className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-2 block">Choose Operation</label>
          <div className="grid grid-cols-3 xs:grid-cols-4 gap-1.5">
            {[
              { id: "price", label: "Price/MRP", icon: DollarSign },
              { id: "stock", label: "Stock Qty", icon: Boxes },
              { id: "status", label: "Status", icon: Check },
              { id: "category", label: "Category", icon: Tag },
              { id: "brand", label: "Brand", icon: Building2 },
              { id: "delivery", label: "Delivery", icon: Truck },
              { id: "label", label: "Labels", icon: Bookmark }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActionType(item.id as any)}
                className={cn(
                  "p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition",
                  actionType === item.id ? "bg-brand-900 text-white border-brand-900 shadow-sm font-bold" : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50 font-medium"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Config Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Price / MRP Update */}
          {actionType === "price" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-bold text-brand-900 mb-1.5 block">Target Field</label>
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                  {[
                    { id: "price", label: "Selling Price" },
                    { id: "mrp", label: "MRP" },
                    { id: "both", label: "Both Price & MRP" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTargetField(t.id as any)}
                      className={cn(
                        "py-2 px-3 rounded-xl border text-xs font-semibold transition",
                        targetField === t.id ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-brand-800 border-brand-200 hover:bg-brand-50"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-900 mb-1.5 block">Modification Method</label>
                <select
                  value={priceSubMode}
                  onChange={(e) => setPriceSubMode(e.target.value as any)}
                  className="w-full p-3 bg-white border border-brand-200 rounded-xl text-sm font-medium text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="percent_add">📈 Increase by Percentage (%)</option>
                  <option value="percent_sub">📉 Decrease by Percentage (%)</option>
                  <option value="flat_add">➕ Add Flat Amount (₹)</option>
                  <option value="flat_sub">➖ Subtract Flat Amount (₹)</option>
                  <option value="set_exact">🎯 Set Exact Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-900 mb-1.5 block">
                  {priceSubMode.includes("percent") ? "Percentage Value (%)" : "Amount in INR (₹)"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={numValue}
                    onChange={(e) => setNumValue(e.target.value)}
                    placeholder={priceSubMode.includes("percent") ? "e.g. 5 for 5%" : "e.g. 10 for ₹10"}
                    className="w-full p-3 bg-white border border-brand-200 rounded-xl text-sm font-bold text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-400">
                    {priceSubMode.includes("percent") ? "%" : "INR"}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>
                  Example: If you select <strong>Increase by 5%</strong>, a product currently priced at ₹100 will become ₹105 automatically.
                </span>
              </div>
            </div>
          )}

          {/* Stock Update */}
          {actionType === "stock" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-bold text-brand-900 mb-1.5 block">Stock Adjustment Mode</label>
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                  {[
                    { id: "add", label: "➕ Add Stock" },
                    { id: "sub", label: "➖ Subtract Stock" },
                    { id: "set_exact", label: "🎯 Set Exact Qty" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStockSubMode(s.id as any)}
                      className={cn(
                        "py-2.5 px-3 rounded-xl border text-xs font-semibold transition",
                        stockSubMode === s.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-brand-800 border-brand-200 hover:bg-brand-50"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-900 mb-1.5 block">Quantity Value</label>
                <input
                  type="number"
                  value={stockVal}
                  onChange={(e) => setStockVal(e.target.value)}
                  placeholder="Enter quantity..."
                  className="w-full p-3 bg-white border border-brand-200 rounded-xl text-sm font-bold text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* Status Update */}
          {actionType === "status" && (
            <div className="space-y-4 animate-fade-in">
              <label className="text-xs font-bold text-brand-900 mb-1.5 block">New Status for Selected Products</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusValue(st)}
                    className={cn(
                      "p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition",
                      statusValue === st ? "bg-brand-900 text-white border-brand-900 shadow-md" : "bg-white text-brand-800 border-brand-200 hover:bg-brand-50"
                    )}
                  >
                    <span>{st}</span>
                    {statusValue === st && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Update */}
          {actionType === "category" && (
            <div className="space-y-4 animate-fade-in">
              <label className="text-xs font-bold text-brand-900 mb-1.5 block">Assign New Category</label>
              <select
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value)}
                className="w-full p-3 bg-white border border-brand-200 rounded-xl text-sm font-semibold text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Brand Update */}
          {actionType === "brand" && (
            <div className="space-y-4 animate-fade-in">
              <label className="text-xs font-bold text-brand-900 mb-1.5 block">Assign New Brand</label>
              <select
                value={brandValue}
                onChange={(e) => setBrandValue(e.target.value)}
                className="w-full p-3 bg-white border border-brand-200 rounded-xl text-sm font-semibold text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {brandsList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {/* Delivery Time Update */}
          {actionType === "delivery" && (
            <div className="space-y-4 animate-fade-in">
              <label className="text-xs font-bold text-brand-900 mb-1.5 block">Set Delivery Time Promise</label>
              <div className="grid grid-cols-2 gap-2">
                {DELIVERY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDeliveryValue(opt)}
                    className={cn(
                      "p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition",
                      deliveryValue === opt ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-white text-brand-800 border-brand-200 hover:bg-brand-50"
                    )}
                  >
                    <span>⚡ {opt}</span>
                    {deliveryValue === opt && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Labels Update */}
          {actionType === "label" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-bold text-brand-900 mb-1.5 block">Label Action</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "add", label: "➕ Add Label" },
                    { id: "remove", label: "➖ Remove Label" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setLabelMode(m.id as any)}
                      className={cn(
                        "py-2.5 px-3 rounded-xl border text-xs font-semibold transition",
                        labelMode === m.id ? "bg-purple-600 text-white border-purple-600" : "bg-white text-brand-800 border-brand-200 hover:bg-brand-50"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-900 mb-1.5 block">Select Product Label</label>
                <select
                  value={labelValue}
                  onChange={(e) => setLabelValue(e.target.value as any)}
                  className="w-full p-3 bg-white border border-brand-200 rounded-xl text-sm font-semibold text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {LABEL_OPTIONS.map((lbl) => (
                    <option key={lbl} value={lbl}>🏷️ {lbl}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-brand-100 bg-white flex items-center gap-3">
          <button
            onClick={() => { onClearSelection(); onClose(); }}
            className="flex-1 py-3 rounded-xl border border-brand-200 text-brand-700 font-bold text-xs hover:bg-brand-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply to {selectedIds.length} Items</span>
          </button>
        </div>
      </div>
    </div>
  );
}
