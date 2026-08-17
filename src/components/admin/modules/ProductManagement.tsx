"use client";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Package,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  X,
  Trash2,
  UploadCloud,
  Star,
  ChevronLeft,
  ChevronRight,
  Settings2
} from "lucide-react";
import { useAdminStore, productStockInfo, type AdminProduct, type ProductStatus } from "@/store/adminStore";
import { VariantManager } from "./VariantManager";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn, formatWeight } from "@/lib/utils";

/** Weight entry with a kg/g unit selector — always reports integer grams. */
export function WeightInput({ grams, onChange, className }: { grams: number; onChange: (g: number) => void; className?: string }) {
  const [unit, setUnit] = useState<"kg" | "g">(grams >= 1000 ? "kg" : "g");
  const value = unit === "kg" ? Math.round((grams / 1000) * 100) / 100 : Math.round(grams);
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <input
        type="number"
        min={0}
        step="any"
        value={value}
        onChange={(e) => {
          const v = Math.max(0, parseFloat(e.target.value) || 0);
          onChange(Math.round(unit === "kg" ? v * 1000 : v));
        }}
        className="w-24 bg-white dark:bg-zinc-900 border border-brand-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold text-sm text-brand-950 dark:text-zinc-100 outline-none focus:border-brand-500"
      />
      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value as "kg" | "g")}
        className="bg-white dark:bg-zinc-900 border border-brand-200 dark:border-zinc-700 rounded-xl px-2 py-2 text-xs font-bold text-brand-900 dark:text-zinc-200 outline-none"
      >
        <option value="kg">kg</option>
        <option value="g">g</option>
      </select>
    </div>
  );
}

/** Reads an image file and returns a compressed data URL (max 900px, WebP with JPEG fallback). */
async function compressImageToDataUrl(file: File, maxDim = 900, quality = 0.82): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Invalid image file"));
    el.src = dataUrl;
  });
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  if (scale === 1 && file.size < 300 * 1024) return dataUrl;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const webp = canvas.toDataURL("image/webp", quality);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", quality);
}

type ListFilter = "all" | "in" | "low" | "out";

const STATUS_BADGE: Record<string, string> = {
  "In Stock": "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300",
  "Low Stock": "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300",
  "Out of Stock": "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300",
  Hidden: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
  Draft: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
};

/** Display status: hidden/draft products show that; otherwise stock-derived. */
function displayStatus(p: AdminProduct): string {
  if (p.status === "Hidden" || p.status === "Draft") return p.status;
  return productStockInfo(p).status;
}

export function ProductManagement() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useAdminStore();
  const { user, hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  const canCreate = hasPermission("products.create");
  const canEdit = hasPermission("products.edit");
  const canDelete = hasPermission("products.delete");

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ListFilter>("all");
  const [catFilter, setCatFilter] = useState("All");

  // Manage / Add modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [formData, setFormData] = useState<Partial<AdminProduct>>({});
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(false);

  // ── Summary (product-level, variant-aware) ──
  const infoOf = (p: AdminProduct) => productStockInfo(p);
  const lowCount = products.filter((p) => { const i = infoOf(p); return !i.allOut && i.anyLow; }).length;
  const outCount = products.filter((p) => infoOf(p).allOut).length;
  const activeCount = products.filter((p) => p.status !== "Hidden" && p.status !== "Draft" && !infoOf(p).allOut).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));
      const i = infoOf(p);
      const matchF =
        filter === "all" ||
        (filter === "in" && !i.allOut && !i.anyLow) ||
        (filter === "low" && !i.allOut && i.anyLow) ||
        (filter === "out" && i.allOut);
      const matchC = catFilter === "All" || p.category === catFilter;
      return matchQ && matchF && matchC;
    });
  }, [products, query, filter, catFilter]);

  // ── Manage / Add ──
  const openAdd = () => {
    if (!canCreate) { pushToast("Permission denied: you need product create access", "info"); return; }
    setEditingProduct(null);
    // Technical fields are auto-generated and kept out of the daily workflow
    setFormData({
      name: "",
      slug: "",
      sku: `FRM-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `890100${Math.floor(1000 + Math.random() * 9000)}`,
      category: categories[0]?.slug || "vegetables",
      subcategory: "Fresh Produce",
      brand: "FlashKart Fresh",
      tagline: "Farm fresh produce",
      description: "",
      image: "/images/categories/vegetables.png",
      gallery: ["/images/categories/vegetables.png"],
      weights: [{ label: "500 g", grams: 500, price: 0, mrp: 0, active: true }],
      stockGrams: 0,
      minStockGrams: 2000,
      costPrice: 0,
      taxPercent: 5,
      marginPercent: 0,
      currentStock: 0,
      reservedStock: 0,
      availableStock: 0,
      minStock: 15,
      maxStock: 250,
      warehouse: "Gandhinagar Central Hub",
      batchNumber: `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: "Active",
      labels: ["Fresh"],
      badge: "None",
      deliveryTime: "Morning",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      ogImage: "/images/categories/vegetables.png",
      benefits: [],
      storage: "Store in a cool dry place or refrigerate.",
      origin: "Gujarat, India",
      rating: 0,
      reviews: 0,
      modes: ["instant"]
    });
    setConfirmDeleteProduct(false);
    setIsEditorOpen(true);
  };

  const openManage = (p: AdminProduct) => {
    if (!canEdit) { pushToast("Permission denied: you need product edit access", "info"); return; }
    setEditingProduct(p);
    setFormData({ ...p });
    setConfirmDeleteProduct(false);
    setIsEditorOpen(true);
  };

  // ── Images ──
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const handleImageFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) { pushToast("Please choose image files (PNG, JPG or WebP)", "info"); return; }
    setIsUploadingImages(true);
    try {
      const dataUrls: string[] = [];
      for (const f of imageFiles) dataUrls.push(await compressImageToDataUrl(f));
      setFormData((prev) => {
        const gallery = [...(prev.gallery || []), ...dataUrls];
        const image = prev.image && prev.image.startsWith("data:") ? prev.image : dataUrls[0];
        return { ...prev, image, ogImage: image, gallery };
      });
      pushToast(`✓ ${dataUrls.length} image${dataUrls.length > 1 ? "s" : ""} uploaded`, "success");
    } catch {
      pushToast("✕ Could not process that image. Please try another file.", "info");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const setPrimaryImage = (idx: number) => {
    setFormData((prev) => {
      const g = prev.gallery || [];
      return { ...prev, image: g[idx], ogImage: g[idx] };
    });
  };
  const deleteImage = (idx: number) => {
    setFormData((prev) => {
      const g = (prev.gallery || []).filter((_, i) => i !== idx);
      const removed = (prev.gallery || [])[idx];
      const image = prev.image === removed ? g[0] || "/images/categories/vegetables.png" : prev.image;
      return { ...prev, gallery: g, image, ogImage: image };
    });
  };
  const moveImage = (idx: number, dir: -1 | 1) => {
    setFormData((prev) => {
      const g = [...(prev.gallery || [])];
      const j = idx + dir;
      if (j < 0 || j >= g.length) return prev;
      [g[idx], g[j]] = [g[j], g[idx]];
      return { ...prev, gallery: g };
    });
  };

  // ── Save ──
  const handleSave = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const u = user?.name || "Super Admin";
    const r = user?.role || "Super Admin";
    if (!formData.name || formData.name.trim() === "") { pushToast("Product name is required", "info"); return; }
    const w = formData.weights || [];
    if (w.length === 0) { pushToast("Add at least one pack size", "info"); return; }
    if (w.some((v) => !v.label || v.label.trim() === "")) { pushToast("Every pack size needs a name", "info"); return; }
    if (w.some((v) => v.price < 0 || v.mrp < 0 || v.grams <= 0)) { pushToast("Every pack needs a positive weight; prices cannot be negative", "info"); return; }

    // ONE shared physical stock in integer grams — status derives from it
    const stockGrams = Math.max(0, Math.round(formData.stockGrams ?? 0));
    const minStockGrams = Math.max(0, Math.round(formData.minStockGrams ?? 2000));
    const info = productStockInfo({ weights: w, stockGrams, minStockGrams });
    const keepHidden = formData.status === "Hidden" || formData.status === "Draft";
    const payload: Partial<AdminProduct> = {
      ...formData,
      slug: formData.slug && formData.slug !== "" ? formData.slug : (formData.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      weights: w,
      stockGrams,
      minStockGrams,
      currentStock: stockGrams,
      stock: stockGrams,
      availableStock: stockGrams,
      status: (keepHidden ? formData.status : info.allOut ? "Out of Stock" : "Active") as ProductStatus
    };
    if (editingProduct) {
      updateProduct(editingProduct.id, payload, u, r);
      pushToast(`✓ Saved "${formData.name}"`, "success");
    } else {
      addProduct(payload as Omit<AdminProduct, "id">, u, r);
      pushToast(`✓ Created "${formData.name}"`, "success");
    }
    setIsEditorOpen(false);
  };

  const handleDeleteProduct = () => {
    if (!editingProduct || !canDelete) return;
    deleteProduct(editingProduct.id, user?.name || "Super Admin", user?.role || "Super Admin");
    pushToast(`Deleted "${editingProduct.name}"`, "info");
    setIsEditorOpen(false);
  };

  const formInfo = productStockInfo({
    weights: formData.weights || [],
    stockGrams: formData.stockGrams ?? 0,
    minStockGrams: formData.minStockGrams ?? 2000
  });

  const priceFrom = (p: AdminProduct) => {
    const active = p.weights.filter((w) => w.active !== false);
    return active.length ? Math.min(...active.map((w) => w.price)) : 0;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Products
          </h2>
          <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">
            One row per product. Pack sizes, prices, stock and images are managed inside each product.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: products.length, icon: Package, cls: "text-brand-950 dark:text-zinc-100", f: "all" as ListFilter },
          { label: "Active", value: activeCount, icon: CheckCircle2, cls: "text-emerald-600", f: "in" as ListFilter },
          { label: "Low Stock", value: lowCount, icon: AlertTriangle, cls: "text-amber-600", f: "low" as ListFilter },
          { label: "Out of Stock", value: outCount, icon: AlertTriangle, cls: "text-rose-600", f: "out" as ListFilter }
        ].map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => setFilter(c.f)}
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
            </button>
          );
        })}
      </div>

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
          ] as { id: ListFilter; label: string }[]).map((f) => (
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
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-brand-900 dark:text-zinc-200 outline-none"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Product table (desktop) — ONE ROW PER PRODUCT */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-50/60 dark:bg-zinc-800/80 border-b border-brand-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Variants</th>
                <th className="py-3.5 px-4">Price From</th>
                <th className="py-3.5 px-4">Available Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/60 dark:divide-zinc-800 text-xs">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-600 dark:text-zinc-500 font-medium">
                    No products match your search or filter.
                  </td>
                </tr>
              )}
              {visible.map((p) => {
                const i = infoOf(p);
                const st = displayStatus(p);
                return (
                  <tr key={p.id} className="hover:bg-brand-50/40 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-brand-50 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 shrink-0">
                          <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" unoptimized />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 truncate max-w-[280px]">{p.name}</div>
                          <div className="text-[11px] text-brand-600 dark:text-zinc-500 truncate">{p.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-900 dark:text-zinc-200 whitespace-nowrap">
                      {i.packCount} pack{i.packCount === 1 ? "" : "s"}
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-950 dark:text-zinc-100 whitespace-nowrap">₹{priceFrom(p)}</td>
                    <td className="py-3 px-4 font-bold text-sm text-brand-950 dark:text-zinc-100 whitespace-nowrap">{formatWeight(i.totalGrams)}</td>
                    <td className="py-3 px-4">
                      <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full inline-block whitespace-nowrap", STATUS_BADGE[st] || STATUS_BADGE["In Stock"])}>
                        {st}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openManage(p)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                      >
                        <Settings2 className="w-3.5 h-3.5" /> Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product cards (mobile) */}
      <div className="md:hidden space-y-3">
        {visible.length === 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-brand-100 dark:border-zinc-800 p-8 text-center text-xs text-brand-600 dark:text-zinc-500 font-medium">
            No products match your search or filter.
          </div>
        )}
        {visible.map((p) => {
          const i = infoOf(p);
          const st = displayStatus(p);
          return (
            <div key={p.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-brand-100 dark:border-zinc-800 p-4 shadow-sm flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-50 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 shrink-0">
                <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" unoptimized />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 truncate">{p.name}</div>
                <div className="text-[11px] text-brand-600 dark:text-zinc-400 font-semibold">
                  {i.packCount} pack{i.packCount === 1 ? "" : "s"} · ₹{priceFrom(p)} · {formatWeight(i.totalGrams)}
                </div>
                <span className={cn("mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block", STATUS_BADGE[st] || STATUS_BADGE["In Stock"])}>
                  {st}
                </span>
              </div>
              <button
                onClick={() => openManage(p)}
                className="px-3 py-2 rounded-xl bg-brand-900 dark:bg-brand-600 text-white text-[11px] font-bold shrink-0 active:scale-95 transition"
              >
                Manage
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Manage / Add Product modal ── */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-brand-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-3xl w-full border border-brand-100 dark:border-zinc-800 shadow-2xl my-4"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 rounded-t-3xl z-10">
              <h3 className="font-display text-lg font-bold text-brand-950 dark:text-zinc-100">
                {editingProduct ? `Manage: ${editingProduct.name}` : "Add Product"}
              </h3>
              <button type="button" onClick={() => setIsEditorOpen(false)} className="p-1.5 text-brand-700 hover:text-brand-950 dark:text-zinc-400 dark:hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 text-xs">
              {/* PRODUCT INFORMATION */}
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400 mb-3">Product Information</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Vine-Ripened Fresh Tomatoes"
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-semibold text-sm text-brand-950 dark:text-zinc-100 outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Category</label>
                    <select
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-semibold text-brand-950 dark:text-zinc-100 outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Status</label>
                    <select
                      value={formData.status === "Hidden" || formData.status === "Draft" ? formData.status : "Active"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-semibold text-brand-950 dark:text-zinc-100 outline-none"
                    >
                      <option value="Active">Active (visible to customers)</option>
                      <option value="Hidden">Hidden</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Short description shown on the product page."
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl p-3 text-brand-950 dark:text-zinc-100 outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* PRODUCT IMAGES */}
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400 mb-3">Product Images</h4>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.length) handleImageFiles(e.target.files); e.target.value = ""; }}
                />
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.length) handleImageFiles(e.dataTransfer.files); }}
                  className="cursor-pointer border-2 border-dashed border-brand-200 dark:border-zinc-700 hover:border-brand-500 rounded-2xl p-5 text-center transition mb-4"
                >
                  <UploadCloud className="w-6 h-6 text-brand-500 mx-auto mb-1" />
                  <div className="font-bold text-brand-900 dark:text-zinc-200">{isUploadingImages ? "Uploading..." : "Upload images"}</div>
                  <div className="text-[11px] text-brand-600 dark:text-zinc-500">Click or drag & drop — first upload becomes the main image</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(formData.gallery || []).map((src, idx) => {
                    const isPrimary = formData.image === src;
                    return (
                      <div key={`${idx}-${src.slice(0, 40)}`} className={cn("relative w-24 rounded-xl border-2 overflow-hidden group", isPrimary ? "border-emerald-500" : "border-brand-100 dark:border-zinc-700")}>
                        <div className="relative w-full aspect-square bg-brand-50 dark:bg-zinc-800">
                          <Image src={src} alt={`Image ${idx + 1}`} fill sizes="96px" className="object-cover" unoptimized />
                        </div>
                        {isPrimary && (
                          <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5" /> Main
                          </span>
                        )}
                        <div className="flex items-center justify-between px-1 py-1 bg-brand-50/80 dark:bg-zinc-800/80 text-brand-700 dark:text-zinc-300">
                          <button type="button" onClick={() => moveImage(idx, -1)} title="Move left" className="p-0.5 hover:text-brand-950 disabled:opacity-30" disabled={idx === 0}>
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          {!isPrimary && (
                            <button type="button" onClick={() => setPrimaryImage(idx)} title="Set as main image" className="p-0.5 hover:text-emerald-600">
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button type="button" onClick={() => deleteImage(idx)} title="Delete image" className="p-0.5 hover:text-rose-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => moveImage(idx, 1)} title="Move right" className="p-0.5 hover:text-brand-950 disabled:opacity-30" disabled={idx === (formData.gallery || []).length - 1}>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* PACK SIZES / VARIANTS */}
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400 mb-3">Pack Sizes / Variants</h4>
                <VariantManager
                  weights={formData.weights || []}
                  onChange={(w) => setFormData({ ...formData, weights: w })}
                  preview={{ name: formData.name, image: formData.image, category: formData.category, subcategory: formData.subcategory }}
                />
              </section>

              {/* INVENTORY — one shared physical stock for all pack sizes */}
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400 mb-3">Product Stock</h4>
                <div className="bg-brand-50/70 dark:bg-zinc-800/60 border border-brand-100 dark:border-zinc-700 rounded-2xl p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-brand-900 dark:text-zinc-200">Available Stock</div>
                      <div className="text-[11px] text-brand-600 dark:text-zinc-400">
                        ONE physical inventory shared by all pack sizes — each sale deducts the pack&apos;s weight.
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <WeightInput
                        grams={formData.stockGrams ?? 0}
                        onChange={(g) => setFormData({ ...formData, stockGrams: g })}
                      />
                      <span className="font-display font-bold text-xl text-brand-950 dark:text-zinc-100 whitespace-nowrap">
                        = {formatWeight(formData.stockGrams ?? 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-100 dark:border-zinc-700 pt-4">
                    <div>
                      <div className="font-bold text-brand-900 dark:text-zinc-200">Minimum Stock (Low-Stock Alert)</div>
                      <div className="text-[11px] text-brand-600 dark:text-zinc-400">Below this weight the product shows as Low Stock.</div>
                    </div>
                    <WeightInput
                      grams={formData.minStockGrams ?? 2000}
                      onChange={(g) => setFormData({ ...formData, minStockGrams: g })}
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-brand-100 dark:border-zinc-700 pt-4">
                    <div className="font-bold text-brand-900 dark:text-zinc-200">Status</div>
                    <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full", STATUS_BADGE[formInfo.status])}>
                      {formInfo.status}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-brand-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900 rounded-b-3xl">
              <div>
                {editingProduct && canDelete && (
                  confirmDeleteProduct ? (
                    <span className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-rose-600">Delete permanently?</span>
                      <button type="button" onClick={handleDeleteProduct} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold">Yes, delete</button>
                      <button type="button" onClick={() => setConfirmDeleteProduct(false)} className="px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-zinc-800 font-bold text-brand-800 dark:text-zinc-200">No</button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setConfirmDeleteProduct(true)} className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Delete Product
                    </button>
                  )
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-brand-50 dark:bg-zinc-800 text-brand-800 dark:text-zinc-200 hover:bg-brand-100 dark:hover:bg-zinc-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 text-white text-xs font-bold shadow-sm transition active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
