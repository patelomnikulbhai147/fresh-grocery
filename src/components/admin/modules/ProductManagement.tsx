"use client";
import { useState, useMemo } from "react";
import {
  Package,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  Archive,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  DollarSign,
  Boxes,
  Tag,
  Image as ImageIcon,
  FileText,
  Percent,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  ScanLine,
  History,
  Table,
  Grid,
  TrendingUp,
  Zap,
  Award,
  SlidersHorizontal,
  Save
} from "lucide-react";
import { useAdminStore, type AdminProduct, type ProductStatus, type ProductLabel, type ProductBadge, type DeliveryTimeOption } from "@/store/adminStore";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn, formatINR } from "@/lib/utils";
import { SpreadsheetProductTable } from "./SpreadsheetProductTable";
import { BulkActionDrawer } from "./BulkActionDrawer";
import { PriceStockHistoryModal } from "./PriceStockHistoryModal";
import { BarcodeScannerModal } from "./BarcodeScannerModal";

export function ProductManagement() {
  const { products, categories, addProduct, updateProduct, deleteProduct, duplicateProduct, archiveProduct, restoreProduct, bulkUpdateProducts, importProductsCSV } = useAdminStore();
  const { user, hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  // High-Speed Inventory View Mode & Modals
  const [viewMode, setViewMode] = useState<"spreadsheet" | "standard">("spreadsheet");
  const [autoSave, setAutoSave] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<AdminProduct | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<"all" | "low_stock" | "oos" | "high_margin" | "low_margin">("all");

  // Table Filters & Search
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [labelFilter, setLabelFilter] = useState("All");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Bulk Edit Form state
  const [bulkPriceChange, setBulkPriceChange] = useState("");
  const [bulkPriceType, setBulkPriceType] = useState<"percent_add" | "percent_sub" | "flat_add" | "flat_sub">("percent_sub");
  const [bulkStockAdd, setBulkStockAdd] = useState("");
  const [bulkCatAssign, setBulkCatAssign] = useState("");

  // Product Editor Modal
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "stock" | "specs" | "images" | "labels" | "seo">("general");

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<AdminProduct>>({});

  const canCreate = hasPermission("products.create");
  const canEdit = hasPermission("products.edit");
  const canDelete = hasPermission("products.delete");
  const canBulk = hasPermission("products.bulk");

  const brandsList = useMemo(() => Array.from(new Set(products.map((p) => p.brand))), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQ =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(query.toLowerCase()));
      const matchCat = catFilter === "All" || p.category === catFilter;
      const matchStatus = statusFilter === "All" || p.status === statusFilter;
      const matchBrand = brandFilter === "All" || p.brand === brandFilter;
      const matchLabel = labelFilter === "All" || (p.labels && p.labels.includes(labelFilter as ProductLabel));

      let matchQuick = true;
      if (quickFilter === "low_stock") matchQuick = p.currentStock <= (p.minStock || 15) && p.currentStock > 0;
      else if (quickFilter === "oos") matchQuick = p.currentStock <= 0;
      else if (quickFilter === "high_margin") matchQuick = (p.marginPercent || 0) >= 25;
      else if (quickFilter === "low_margin") matchQuick = (p.marginPercent || 0) < 15;

      return matchQ && matchCat && matchStatus && matchBrand && matchLabel && matchQuick;
    });
  }, [products, query, catFilter, statusFilter, brandFilter, labelFilter, quickFilter]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(paginatedProducts.map((p) => p.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) setSelectedIds((prev) => [...prev, id]);
    else setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  // Open Editor for Add
  const handleOpenAdd = () => {
    if (!canCreate) {
      pushToast("Permission denied: You need 'products.create' permission", "info");
      return;
    }
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      sku: `FRM-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `890100${Math.floor(1000 + Math.random() * 9000)}`,
      category: categories[0]?.slug || "vegetables",
      subcategory: "Fresh Produce",
      brand: "FlashKart Fresh",
      tagline: "Farm fresh produce",
      description: "Hand-picked daily from partner farms, tested for high quality.",
      image: "/images/categories/vegetables.png",
      gallery: ["/images/categories/vegetables.png"],
      weights: [{ label: "1 unit (500g)", grams: 500, price: 90, mrp: 110 }],
      costPrice: 65,
      taxPercent: 5,
      marginPercent: 28,
      currentStock: 50,
      reservedStock: 0,
      availableStock: 50,
      minStock: 15,
      maxStock: 250,
      warehouse: "Gandhinagar Central Hub",
      batchNumber: `BATCH-2026-${Math.floor(100 + Math.random()*900)}`,
      status: "Active",
      labels: ["Fresh", "Organic"],
      badge: "Discount",
      deliveryTime: "Morning",
      seoTitle: "Fresh Produce Online at FlashKart",
      seoDescription: "Buy farm-fresh produce directly from FlashKart.",
      seoKeywords: "fresh vegetables, seasonal fruits, flashkart",
      ogImage: "/images/categories/vegetables.png",
      benefits: ["100% Pesticide Free", "Harvested This Morning", "Rich in Vitamins"],
      storage: "Store in a cool dry place or refrigerate.",
      origin: "Anand, Gujarat, India",
      rating: 4.8,
      reviews: 14,
      modes: ["instant", "subscription"]
    });
    setActiveTab("general");
    setIsEditorOpen(true);
  };

  // Open Editor for Edit
  const handleOpenEdit = (prod: AdminProduct) => {
    if (!canEdit) {
      pushToast("Permission denied: You need 'products.edit' permission", "info");
      return;
    }
    setEditingProduct(prod);
    setFormData({ ...prod });
    setActiveTab("general");
    setIsEditorOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const u = user?.name || "Super Admin";
    const r = user?.role || "Super Admin";

    if (!formData.name || !formData.sku) {
      pushToast("Product Name and SKU are required fields", "info");
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData as Partial<AdminProduct>, u, r);
      pushToast(`Updated product "${formData.name}" successfully!`, "success");
    } else {
      addProduct(formData as Omit<AdminProduct, "id">, u, r);
      pushToast(`Created product "${formData.name}" successfully!`, "success");
    }
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!canDelete) {
      pushToast("Permission denied: You need 'products.delete' permission", "info");
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      deleteProduct(id, user?.name || "Super Admin", user?.role || "Super Admin");
      pushToast(`Deleted "${name}"`, "info");
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleDuplicate = (id: string) => {
    if (!canCreate) {
      pushToast("Permission denied: You need 'products.create' permission", "info");
      return;
    }
    duplicateProduct(id, user?.name || "Super Admin", user?.role || "Super Admin");
    pushToast("Product duplicated successfully as Draft!", "success");
  };

  const handleBulkAction = (actionType: "activate" | "deactivate" | "delete" | "archive") => {
    if (!canBulk) {
      pushToast("Permission denied: You need 'products.bulk' permission", "info");
      return;
    }
    if (selectedIds.length === 0) return;
    const u = user?.name || "Super Admin";
    const r = user?.role || "Super Admin";

    if (actionType === "delete") {
      if (window.confirm(`Permanently delete ${selectedIds.length} selected products?`)) {
        selectedIds.forEach((id) => deleteProduct(id, u, r));
        setSelectedIds([]);
        pushToast("Bulk delete completed", "info");
      }
      return;
    }

    const statusMap: Record<string, ProductStatus> = {
      activate: "Active",
      deactivate: "Draft",
      archive: "Hidden"
    };

    bulkUpdateProducts(selectedIds, { status: statusMap[actionType] }, actionType.toUpperCase(), u, r);
    pushToast(`Bulk ${actionType} applied on ${selectedIds.length} items!`, "success");
    setSelectedIds([]);
  };

  const handleApplyBulkEdit = () => {
    if (selectedIds.length === 0) return;
    const u = user?.name || "Super Admin";
    const r = user?.role || "Super Admin";

    const updates: Partial<AdminProduct> = {};

    if (bulkCatAssign) {
      updates.category = bulkCatAssign;
    }

    // Apply via custom updater if stock or price changed
    selectedIds.forEach((id) => {
      const p = products.find((x) => x.id === id);
      if (!p) return;
      const itemUpdates: Partial<AdminProduct> = { ...updates };

      if (bulkStockAdd) {
        const addVal = parseInt(bulkStockAdd, 10);
        if (!isNaN(addVal)) {
          const newStk = Math.max(0, p.currentStock + addVal);
          itemUpdates.currentStock = newStk;
          itemUpdates.availableStock = newStk - p.reservedStock;
          itemUpdates.status = newStk > 0 ? "Active" : "Out of Stock";
        }
      }

      if (bulkPriceChange) {
        const val = parseFloat(bulkPriceChange);
        if (!isNaN(val)) {
          const curPrice = p.weights[0]?.price ?? 100;
          let newPrice = curPrice;
          if (bulkPriceType === "percent_add") newPrice = Math.round(curPrice * (1 + val / 100));
          if (bulkPriceType === "percent_sub") newPrice = Math.round(curPrice * (1 - val / 100));
          if (bulkPriceType === "flat_add") newPrice = Math.round(curPrice + val);
          if (bulkPriceType === "flat_sub") newPrice = Math.max(1, Math.round(curPrice - val));

          const newWeights = [...p.weights];
          if (newWeights[0]) {
            newWeights[0] = { ...newWeights[0], price: newPrice };
          }
          itemUpdates.weights = newWeights;
          const cp = p.costPrice;
          itemUpdates.marginPercent = Math.round(((newPrice - cp) / newPrice) * 100);
        }
      }

      updateProduct(id, itemUpdates, u, r);
    });

    pushToast(`Bulk edit successfully applied to ${selectedIds.length} products!`, "success");
    setIsBulkEditOpen(false);
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      pushToast("No products to export", "info");
      return;
    }
    const headers = ["SKU", "Barcode", "Name", "Category", "Brand", "Selling Price", "MRP", "Cost Price", "Margin %", "Stock", "Status", "Delivery Time"];
    const rows = filteredProducts.map((p) => {
      const w = p.weights[0] || { price: 0, mrp: 0 };
      return [
        `"${p.sku}"`,
        `"${p.barcode}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${p.brand}"`,
        w.price,
        w.mrp,
        p.costPrice,
        `"${p.marginPercent}%"`,
        p.currentStock,
        `"${p.status}"`,
        `"${p.deliveryTime}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flashkart_products_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    pushToast(`Exported ${filteredProducts.length} products to CSV!`, "success");
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    pushToast(`Reading "${file.name}"...`, "info");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          pushToast("CSV file is empty or only contains headers", "info");
          return;
        }
        const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
        const importedList: Partial<AdminProduct>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
          const vals = row.map((v) => v.replace(/^"|"$/g, "").trim());
          const obj: any = {};
          headers.forEach((h, idx) => {
            const v = vals[idx];
            if (v !== undefined && v !== "") {
              if (h.includes("price") || h.includes("mrp") || h.includes("stock") || h === "cost price" || h === "margin %") {
                const num = parseFloat(v.replace("%", "").replace("₹", ""));
                if (!isNaN(num)) {
                  if (h === "selling price" || h === "price") obj.price = num;
                  else if (h === "mrp") obj.mrp = num;
                  else if (h === "cost price" || h === "cost") obj.costPrice = num;
                  else if (h === "stock" || h === "current stock") obj.currentStock = num;
                  else if (h === "margin %" || h === "margin") obj.marginPercent = num;
                }
              } else if (h === "sku") obj.sku = v;
              else if (h === "barcode") obj.barcode = v;
              else if (h === "name" || h === "product name") obj.name = v;
              else if (h === "category") obj.category = v;
              else if (h === "brand") obj.brand = v;
              else if (h === "status") obj.status = v as any;
              else if (h === "delivery time" || h === "delivery") obj.deliveryTime = v as any;
            }
          });
          if (obj.sku || obj.barcode || obj.name) {
            importedList.push(obj);
          }
        }

        const { updatedCount, createdCount } = importProductsCSV(
          importedList,
          user?.name || "Super Admin",
          user?.role || "Super Admin"
        );
        pushToast(`CSV Import Complete: Updated ${updatedCount} and Created ${createdCount} products! 🚀`, "success");
        setIsBulkImportOpen(false);
      } catch (err) {
        pushToast("Error parsing CSV file. Please verify format.", "info");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* High-Speed Inventory Dashboard Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            id: "all",
            label: "Total Products",
            count: products.length,
            icon: Boxes,
            color: "from-brand-900 to-brand-950 text-white border-brand-700",
            badgeBg: "bg-white/20 text-white"
          },
          {
            id: "low_stock",
            label: "Low Stock Alert",
            count: products.filter((p) => p.currentStock <= (p.minStock || 15) && p.currentStock > 0).length,
            icon: AlertTriangle,
            color: "from-amber-500 to-amber-600 text-white border-amber-400",
            badgeBg: "bg-white/20 text-white animate-pulse"
          },
          {
            id: "oos",
            label: "Out of Stock",
            count: products.filter((p) => p.currentStock <= 0).length,
            icon: X,
            color: "from-rose-600 to-rose-700 text-white border-rose-500",
            badgeBg: "bg-white/20 text-white"
          },
          {
            id: "high_margin",
            label: "High Margin (>25%)",
            count: products.filter((p) => (p.marginPercent || 0) >= 25).length,
            icon: TrendingUp,
            color: "from-emerald-600 to-teal-700 text-white border-emerald-500",
            badgeBg: "bg-white/20 text-white"
          },
          {
            id: "low_margin",
            label: "Low Margin (<15%)",
            count: products.filter((p) => (p.marginPercent || 0) < 15).length,
            icon: Zap,
            color: "from-purple-600 to-indigo-700 text-white border-purple-500",
            badgeBg: "bg-white/20 text-white"
          }
        ].map((card) => (
          <button
            key={card.id}
            onClick={() => { setQuickFilter(card.id as any); setPage(1); }}
            className={cn(
              "p-4 rounded-2xl bg-gradient-to-br border shadow-md text-left transition transform hover:-translate-y-0.5 flex flex-col justify-between",
              card.color,
              quickFilter === card.id ? "ring-4 ring-white/40 scale-[1.02]" : "opacity-90 hover:opacity-100"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <card.icon className="w-5 h-5 opacity-80" />
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold font-mono", card.badgeBg)}>
                {card.count}
              </span>
            </div>
            <div className="mt-3 font-bold text-xs sm:text-sm tracking-wide">{card.label}</div>
          </button>
        ))}
      </div>

      {/* 1. Module Header & Action Toolbar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl md:text-2xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-600 dark:text-brand-400" /> High-Speed Inventory Management
            </h2>
            <div className="flex items-center gap-1 bg-brand-50 dark:bg-zinc-800 p-1 rounded-xl border border-brand-200 dark:border-zinc-700">
              <button
                onClick={() => setViewMode("spreadsheet")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition",
                  viewMode === "spreadsheet" ? "bg-emerald-600 text-white shadow" : "text-brand-700 dark:text-zinc-400 hover:bg-brand-100 dark:hover:bg-zinc-700"
                )}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Spreadsheet (Excel)</span>
              </button>
              <button
                onClick={() => setViewMode("standard")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition",
                  viewMode === "standard" ? "bg-brand-900 text-white shadow" : "text-brand-700 dark:text-zinc-400 hover:bg-brand-100 dark:hover:bg-zinc-700"
                )}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Standard Table</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-brand-600 dark:text-zinc-400 mt-1 flex items-center gap-4">
            <span>Click any price or stock cell to edit inline instantly. Press Enter or Tab to navigate.</span>
            <label className="inline-flex items-center gap-1.5 font-bold text-brand-900 dark:text-zinc-200 cursor-pointer bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span className="text-[11px] text-amber-900 dark:text-amber-300">⚡ Auto-Save Edits (Off for Ctrl+S manual mode)</span>
            </label>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition shadow-md active:scale-95"
          >
            <ScanLine className="w-3.5 h-3.5" /> Scan Barcode 📷
          </button>
          <button
            onClick={() => { setHistoryTarget(null); setIsHistoryOpen(true); }}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <History className="w-3.5 h-3.5" /> Audit Trail 📜
          </button>
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-50 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 text-brand-800 dark:text-zinc-200 hover:bg-brand-100 dark:hover:bg-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-brand-50 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 text-brand-800 dark:text-zinc-200 hover:bg-brand-100 dark:hover:bg-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-xs font-bold flex items-center gap-2 shadow-glow-cta transition active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* 2. Bulk Operations Floating Toolbar (When items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-brand-950 text-white dark:bg-brand-900 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-cta-500 text-white font-bold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold">Products Selected</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" /> Open Bulk Operations Drawer (⚡)
            </button>
            <button
              onClick={() => setIsBulkEditOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Edit className="w-3.5 h-3.5" /> Quick Edit (Modal)
            </button>
            <button
              onClick={() => handleBulkAction("activate")}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-xs font-semibold transition"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction("deactivate")}
              className="px-3 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-xs font-semibold transition"
            >
              Deactivate (Draft)
            </button>
            <button
              onClick={() => handleBulkAction("archive")}
              className="px-3 py-1.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-xs font-semibold transition"
            >
              Archive
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
              title="Clear Selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Search & Advanced Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-brand-100 dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-brand-500 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Product Name, SKU, Barcode..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 text-xs text-brand-950 dark:text-zinc-100 outline-none focus:border-brand-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-brand-600 dark:text-zinc-400 shrink-0" />
          <select
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
            className="bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-brand-900 dark:text-zinc-200 outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-brand-900 dark:text-zinc-200 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Hidden">Hidden</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          <select
            value={brandFilter}
            onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
            className="bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-brand-900 dark:text-zinc-200 outline-none"
          >
            <option value="All">All Brands</option>
            {brandsList.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={labelFilter}
            onChange={(e) => { setLabelFilter(e.target.value); setPage(1); }}
            className="bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-brand-900 dark:text-zinc-200 outline-none"
          >
            <option value="All">All Labels</option>
            <option value="Organic">Organic</option>
            <option value="Fresh">Fresh</option>
            <option value="Bestseller">Bestseller</option>
            <option value="New Arrival">New Arrival</option>
            <option value="Trending">Trending</option>
          </select>
        </div>
      </div>

      {/* 4. Products Data Table (Spreadsheet vs Standard) */}
      {viewMode === "spreadsheet" ? (
        <SpreadsheetProductTable
          products={paginatedProducts}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          autoSave={autoSave}
          onOpenEditor={handleOpenEdit}
          onOpenHistory={(prod) => { setHistoryTarget(prod); setIsHistoryOpen(true); }}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-50/60 dark:bg-zinc-800/80 border-b border-brand-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={paginatedProducts.length > 0 && selectedIds.length === paginatedProducts.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                    />
                  </th>
                  <th className="py-3.5 px-4">Product & SKU</th>
                  <th className="py-3.5 px-4">Category & Brand</th>
                  <th className="py-3.5 px-4">Pricing & Margin</th>
                  <th className="py-3.5 px-4">Stock & Hub</th>
                  <th className="py-3.5 px-4">Status & Labels</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/60 dark:divide-zinc-800 text-xs">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-brand-600 dark:text-zinc-500 font-medium">
                      No grocery products match your search or filters.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((prod) => {
                    const w = prod.weights[0] || { price: 0, mrp: 0, label: "1 unit" };
                    const isChecked = selectedIds.includes(prod.id);
                    const isOOS = prod.currentStock === 0;
                    const isLow = prod.currentStock <= prod.minStock && !isOOS;

                    return (
                      <tr key={prod.id} className={cn("hover:bg-brand-50/40 dark:hover:bg-zinc-800/40 transition", isChecked && "bg-brand-50/80 dark:bg-brand-950/20")}>
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleSelectOne(prod.id, e.target.checked)}
                            className="rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-cream-100 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                              <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer" onClick={() => handleOpenEdit(prod)}>
                                {prod.name}
                              </div>
                              <div className="text-[11px] text-brand-600 dark:text-zinc-500 mt-0.5">
                                SKU: <strong className="text-brand-800 dark:text-zinc-300">{prod.sku}</strong> · Unit: {w.label}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-brand-900 dark:text-zinc-200 capitalize">{prod.category}</div>
                          <div className="text-[11px] text-brand-600 dark:text-zinc-500">{prod.brand}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-sm text-brand-950 dark:text-zinc-100">
                            {formatINR(w.price)} <span className="line-through text-xs font-normal text-brand-600 dark:text-zinc-500">₹{w.mrp}</span>
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                            Margin: {prod.marginPercent}% (Cost ₹{prod.costPrice})
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className={cn("font-bold text-sm", isOOS ? "text-rose-600" : isLow ? "text-amber-600" : "text-brand-950 dark:text-zinc-100")}>
                            {prod.currentStock} units {isLow && "⚠️ Low"} {isOOS && "❌ OOS"}
                          </div>
                          <div className="text-[11px] text-brand-600 dark:text-zinc-500 truncate max-w-[130px]">{prod.warehouse}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap items-center gap-1 mb-1">
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                prod.status === "Active" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" :
                                prod.status === "Draft" ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300" :
                                "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
                              )}
                            >
                              {prod.status}
                            </span>
                            <span className="text-[10px] bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300 font-semibold px-1.5 py-0.5 rounded">
                              {prod.deliveryTime}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {prod.labels.slice(0, 2).map((l) => (
                              <span key={l} className="text-[9px] bg-cream-200 dark:bg-zinc-800 text-brand-900 dark:text-zinc-300 font-medium px-1 py-0.2 rounded">
                                {l}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setHistoryTarget(prod); setIsHistoryOpen(true); }}
                              className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-zinc-800 text-blue-600 transition"
                              title="Audit Trail History"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 rounded-lg hover:bg-brand-100 dark:hover:bg-zinc-800 text-brand-700 dark:text-zinc-300 transition"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(prod.id)}
                              className="p-1.5 rounded-lg hover:bg-brand-100 dark:hover:bg-zinc-800 text-brand-700 dark:text-zinc-300 transition"
                              title="Duplicate Product"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            {prod.status === "Active" ? (
                              <button
                                onClick={() => { archiveProduct(prod.id, user?.name || "Super Admin", user?.role || "Super Admin"); pushToast("Archived to Hidden", "info"); }}
                                className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-400 transition"
                                title="Archive (Hide)"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => { restoreProduct(prod.id, user?.name || "Super Admin", user?.role || "Super Admin"); pushToast("Restored to Active", "success"); }}
                                className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-400 transition"
                                title="Restore to Active"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(prod.id, prod.name)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="px-6 py-4 bg-brand-50/60 dark:bg-zinc-800/60 border-t border-brand-100 dark:border-zinc-800 flex items-center justify-between text-xs text-brand-700 dark:text-zinc-400">
            <span>Showing <strong>{(page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, filteredProducts.length)}</strong> of <strong>{filteredProducts.length}</strong> products</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-brand-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-40 hover:bg-brand-50 dark:hover:bg-zinc-700 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold px-2 text-brand-900 dark:text-zinc-200">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-brand-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-40 hover:bg-brand-50 dark:hover:bg-zinc-700 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Bulk Edit Modal */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 border border-brand-100 dark:border-zinc-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-brand-100 dark:border-zinc-800 pb-4">
              <h3 className="font-display text-xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
                <Edit className="w-5 h-5 text-brand-600" /> Bulk Edit ({selectedIds.length} Products)
              </h3>
              <button onClick={() => setIsBulkEditOpen(false)} className="p-1 text-brand-700 hover:text-brand-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Adjust Selling Price</label>
                <div className="flex gap-2">
                  <select
                    value={bulkPriceType}
                    onChange={(e) => setBulkPriceType(e.target.value as any)}
                    className="bg-brand-50 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-semibold text-brand-950 dark:text-zinc-100 outline-none"
                  >
                    <option value="percent_sub">Decrease by %</option>
                    <option value="percent_add">Increase by %</option>
                    <option value="flat_sub">Decrease Flat (₹)</option>
                    <option value="flat_add">Increase Flat (₹)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={bulkPriceChange}
                    onChange={(e) => setBulkPriceChange(e.target.value)}
                    className="flex-1 bg-brand-50 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-brand-950 dark:text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Adjust Current Stock (+/- units)</label>
                <input
                  type="number"
                  placeholder="e.g. 50 (or -10 to reduce)"
                  value={bulkStockAdd}
                  onChange={(e) => setBulkStockAdd(e.target.value)}
                  className="w-full bg-brand-50 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-brand-950 dark:text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Reassign Category</label>
                <select
                  value={bulkCatAssign}
                  onChange={(e) => setBulkCatAssign(e.target.value)}
                  className="w-full bg-brand-50 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-brand-950 dark:text-zinc-100 font-semibold outline-none"
                >
                  <option value="">Leave unchanged</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-100 dark:border-zinc-800">
              <button
                onClick={() => setIsBulkEditOpen(false)}
                className="px-4 py-2 rounded-xl border border-brand-200 dark:border-zinc-700 text-brand-800 dark:text-zinc-300 font-semibold text-xs hover:bg-brand-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyBulkEdit}
                className="px-5 py-2 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 text-white font-bold text-xs shadow-md transition active:scale-95"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Bulk Import Modal */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 border border-brand-100 dark:border-zinc-800 shadow-2xl space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-brand-100 dark:border-zinc-800 pb-3">
              <h3 className="font-display text-lg font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-600" /> Bulk Import Products
              </h3>
              <button onClick={() => setIsBulkImportOpen(false)} className="p-1 text-brand-700 hover:text-brand-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl border-2 border-dashed border-brand-300 dark:border-zinc-700 bg-brand-50/50 dark:bg-zinc-800/40 space-y-3">
              <Upload className="w-10 h-10 text-brand-500 mx-auto animate-bounce" />
              <div className="text-sm font-bold text-brand-950 dark:text-zinc-100">Upload CSV or Excel file</div>
              <p className="text-[11px] text-brand-600 dark:text-zinc-400 max-w-xs mx-auto">
                System automatically detects duplicate SKUs and updates existing prices or inventory.
              </p>
              <label className="inline-block px-4 py-2 rounded-xl bg-brand-900 dark:bg-brand-600 text-white text-xs font-bold cursor-pointer hover:bg-brand-800 transition shadow-sm">
                Choose File (.csv, .xlsx)
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleCSVUpload} className="hidden" />
              </label>
            </div>

            <div className="text-[11px] text-brand-600 dark:text-zinc-400 flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Need template? <button onClick={handleExportCSV} className="font-bold underline text-brand-700 dark:text-brand-400">Download CSV Template</button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Comprehensive Product Editor Modal (7-Tab Form) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-brand-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-brand-100 dark:border-zinc-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-brand-100 dark:border-zinc-800 flex items-center justify-between bg-brand-50/50 dark:bg-zinc-800/50">
              <div>
                <h3 className="font-display text-xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : "Create New Grocery Product"}
                </h3>
                <p className="text-xs text-brand-600 dark:text-zinc-400">
                  {editingProduct ? `SKU: ${editingProduct.sku}` : "Fill in specs across tabs to publish to storefront."}
                </p>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-1.5 rounded-xl text-brand-700 dark:text-zinc-400 hover:bg-brand-100 dark:hover:bg-zinc-700 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-brand-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto scrollbar-hide text-xs font-bold">
              {[
                { id: "general", label: "General", icon: FileText },
                { id: "pricing", label: "Pricing & Margins", icon: DollarSign },
                { id: "stock", label: "Stock & Inventory", icon: Boxes },
                { id: "specs", label: "Specifications", icon: Layers },
                { id: "images", label: "Images & Gallery", icon: ImageIcon },
                { id: "labels", label: "Labels & Delivery", icon: Tag },
                { id: "seo", label: "SEO Metadata", icon: Sparkles }
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-t-2xl transition border-b-2 whitespace-nowrap",
                      isActive
                        ? "border-brand-600 dark:border-brand-400 bg-brand-50/70 dark:bg-zinc-800 text-brand-950 dark:text-zinc-100"
                        : "border-transparent text-brand-700 dark:text-zinc-400 hover:bg-brand-50/40 dark:hover:bg-zinc-800/40"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-brand-950 dark:text-zinc-100">
              {/* TAB 1: GENERAL */}
              {activeTab === "general" && (
                <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in">
                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alphonso Mangoes (Ratnagiri)"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand-500 font-semibold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug || ""}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Brand Name *</label>
                    <input
                      type="text"
                      value={formData.brand || ""}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Category *</label>
                    <select
                      value={formData.category || "vegetables"}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none font-semibold"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Subcategory</label>
                    <input
                      type="text"
                      placeholder="e.g. Exotic Vegetables"
                      value={formData.subcategory || ""}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1">Tagline / Short Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. Hand-picked, 100% pesticide-tested produce"
                      value={formData.tagline || ""}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1">Full Description</label>
                    <textarea
                      rows={4}
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl p-3 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING */}
              {activeTab === "pricing" && (
                <div className="grid sm:grid-cols-3 gap-6 animate-in fade-in">
                  <div>
                    <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.weights?.[0]?.price || 100}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const w = [...(formData.weights || [{ label: "1 unit", price: 100, mrp: 120, grams: 500 }])];
                        if (w[0]) w[0] = { ...w[0], price: val };
                        const cp = formData.costPrice || 70;
                        const margin = val > 0 ? Math.round(((val - cp) / val) * 100) : 0;
                        setFormData({ ...formData, weights: w, marginPercent: margin });
                      }}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-base outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">MRP / Original Price (₹)</label>
                    <input
                      type="number"
                      value={formData.weights?.[0]?.mrp || 120}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const w = [...(formData.weights || [{ label: "1 unit", price: 100, mrp: 120, grams: 500 }])];
                        if (w[0]) w[0] = { ...w[0], mrp: val };
                        setFormData({ ...formData, weights: w });
                      }}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Cost Price (Supplier ₹)</label>
                    <input
                      type="number"
                      value={formData.costPrice || 70}
                      onChange={(e) => {
                        const cp = parseFloat(e.target.value) || 0;
                        const sp = formData.weights?.[0]?.price || 100;
                        const margin = sp > 0 ? Math.round(((sp - cp) / sp) * 100) : 0;
                        setFormData({ ...formData, costPrice: cp, marginPercent: margin });
                      }}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Tax / GST (%)</label>
                    <select
                      value={formData.taxPercent || 5}
                      onChange={(e) => setFormData({ ...formData, taxPercent: parseInt(e.target.value, 10) })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-semibold outline-none"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5% (Essential Food)</option>
                      <option value={12}>12% (Processed Food)</option>
                      <option value={18}>18% (Luxury / Packaged)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-emerald-900 dark:text-emerald-200">Auto-Calculated Profit Margin</div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Based on Selling Price vs Supplier Cost Price</div>
                    </div>
                    <div className="font-display font-bold text-3xl text-emerald-700 dark:text-emerald-300">
                      {formData.marginPercent || 0}%
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STOCK & INVENTORY */}
              {activeTab === "stock" && (
                <div className="grid sm:grid-cols-3 gap-4 animate-in fade-in">
                  <div>
                    <label className="block font-bold mb-1">SKU Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.sku || ""}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none font-mono font-bold text-brand-900 dark:text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Barcode / UPC Number</label>
                    <input
                      type="text"
                      value={formData.barcode || ""}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Batch / Lot Number</label>
                    <input
                      type="text"
                      value={formData.batchNumber || ""}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Current Stock Level (Units) *</label>
                    <input
                      type="number"
                      required
                      value={formData.currentStock ?? 50}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setFormData({
                          ...formData,
                          currentStock: val,
                          availableStock: val - (formData.reservedStock || 0),
                          status: val > 0 ? "Active" : "Out of Stock"
                        });
                      }}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 font-bold text-base outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Minimum Alert Threshold</label>
                    <input
                      type="number"
                      value={formData.minStock ?? 15}
                      onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 10 })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Maximum Stock Capacity</label>
                    <input
                      type="number"
                      value={formData.maxStock ?? 250}
                      onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value, 10) || 200 })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-bold mb-1">Assigned Warehouse Hub</label>
                    <select
                      value={formData.warehouse || "Hub-A (North Ahmedabad)"}
                      onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 font-semibold outline-none"
                    >
                      <option value="Hub-A (North Ahmedabad)">Hub-A (North Ahmedabad — Expressway)</option>
                      <option value="Hub-B (Gandhinagar Central)">Hub-B (Gandhinagar Central — Infocity)</option>
                      <option value="Hub-C (Satellite & SG Highway)">Hub-C (Satellite & SG Highway Quick Hub)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 4: SPECS & NUTRITION */}
              {activeTab === "specs" && (
                <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in">
                  <div>
                    <label className="block font-bold mb-1">Primary Unit Label</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 kg (4-5 pcs) or 500g Pack"
                      value={formData.weights?.[0]?.label || "1 unit"}
                      onChange={(e) => {
                        const w = [...(formData.weights || [{ label: "1 unit", price: 100, mrp: 120, grams: 500 }])];
                        if (w[0]) w[0] = { ...w[0], label: e.target.value };
                        setFormData({ ...formData, weights: w, unit: e.target.value });
                      }}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Country of Origin</label>
                    <input
                      type="text"
                      placeholder="e.g. Anand, Gujarat, India"
                      value={formData.origin || "India"}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Storage Instructions</label>
                    <input
                      type="text"
                      placeholder="e.g. Keep refrigerated at 4°C"
                      value={formData.storage || ""}
                      onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Shelf Life</label>
                    <input
                      type="text"
                      placeholder="e.g. 5-7 Days from Harvest"
                      value={formData.shelfLife || ""}
                      onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1">Product Benefits / Key Highlights (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. 100% Pesticide Free, Rich in Antioxidants, Harvested This Morning"
                      value={formData.benefits?.join(", ") || ""}
                      onChange={(e) => setFormData({ ...formData, benefits: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: IMAGES */}
              {activeTab === "images" && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <label className="block font-bold mb-1">Primary Image URL</label>
                    <input
                      type="text"
                      value={formData.image || ""}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value, ogImage: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none font-mono"
                    />
                  </div>

                  <div className="p-6 rounded-3xl border-2 border-dashed border-brand-300 dark:border-zinc-700 bg-brand-50/40 dark:bg-zinc-800/40 text-center space-y-3">
                    <ImageIcon className="w-10 h-10 text-brand-500 mx-auto" />
                    <div className="text-sm font-bold text-brand-950 dark:text-zinc-100">Drag & Drop Product Gallery Images</div>
                    <p className="text-[11px] text-brand-600 dark:text-zinc-400">
                      Supports auto compression, thumbnail cropping, and reordering.
                    </p>
                    <button
                      type="button"
                      onClick={() => pushToast("Simulated upload: Image compressed to WebP and added to gallery!", "success")}
                      className="px-4 py-2 rounded-xl bg-brand-900 dark:bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-800 transition"
                    >
                      Upload Images
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: LABELS & DELIVERY */}
              {activeTab === "labels" && (
                <div className="grid sm:grid-cols-2 gap-6 animate-in fade-in">
                  <div>
                    <label className="block font-bold mb-2">Product Status *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Active", "Draft", "Hidden", "Out of Stock"] as ProductStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: st })}
                          className={cn(
                            "py-2.5 px-3 rounded-xl border font-bold text-xs transition flex items-center justify-center gap-1.5",
                            formData.status === st ? "bg-brand-900 dark:bg-brand-600 text-white border-transparent shadow-sm" : "bg-white dark:bg-zinc-800 border-brand-200 dark:border-zinc-700 text-brand-800 dark:text-zinc-300 hover:bg-brand-50"
                          )}
                        >
                          {st === formData.status && <Check className="w-3.5 h-3.5" />} {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Estimated Delivery Time SLA *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["10 Min", "20 Min", "30 Min", "45 Min", "Same Day"] as DeliveryTimeOption[]).map((dt) => (
                        <button
                          key={dt}
                          type="button"
                          onClick={() => setFormData({ ...formData, deliveryTime: dt })}
                          className={cn(
                            "py-2.5 px-3 rounded-xl border font-bold text-xs transition flex items-center justify-center gap-1.5",
                            formData.deliveryTime === dt ? "bg-cta-500 text-white border-transparent shadow-sm" : "bg-white dark:bg-zinc-800 border-brand-200 dark:border-zinc-700 text-brand-800 dark:text-zinc-300 hover:bg-brand-50"
                          )}
                        >
                          {dt === formData.deliveryTime && <Check className="w-3.5 h-3.5" />} {dt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-2">Promotional Badges & Labels</label>
                    <div className="flex flex-wrap gap-2">
                      {(["Organic", "Fresh", "Bestseller", "Trending", "New Arrival", "Seasonal"] as ProductLabel[]).map((lbl) => {
                        const isSel = formData.labels?.includes(lbl);
                        return (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => {
                              const cur = formData.labels || [];
                              const next = isSel ? cur.filter((x) => x !== lbl) : [...cur, lbl];
                              setFormData({ ...formData, labels: next });
                            }}
                            className={cn(
                              "px-3.5 py-2 rounded-xl font-semibold text-xs border transition flex items-center gap-1.5",
                              isSel ? "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm" : "bg-white dark:bg-zinc-800 border-brand-200 dark:border-zinc-700 text-brand-700 dark:text-zinc-400 hover:bg-brand-50"
                            )}
                          >
                            {isSel && <Check className="w-3.5 h-3.5 text-emerald-600" />} {lbl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: SEO */}
              {activeTab === "seo" && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block font-bold mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={formData.seoTitle || ""}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Meta Description</label>
                    <textarea
                      rows={3}
                      value={formData.seoDescription || ""}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl p-3 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.seoKeywords || ""}
                      onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                      className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                    />
                  </div>

                  <div className="p-4 bg-brand-50 dark:bg-zinc-800 rounded-2xl border border-brand-100 dark:border-zinc-700 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-brand-500">Google Search Preview</div>
                    <div className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">
                      {formData.seoTitle || formData.name || "Product Title"}
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                      https://flashkart.co/product/{formData.slug || "product-slug"}
                    </div>
                    <div className="text-xs text-brand-700 dark:text-zinc-400 line-clamp-2">
                      {formData.seoDescription || formData.description || "Fresh produce supply from FlashKart."}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-brand-200 dark:border-zinc-700 text-brand-800 dark:text-zinc-300 font-semibold hover:bg-brand-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold shadow-glow-cta transition active:scale-95"
                >
                  {editingProduct ? "Save Changes" : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Spreadsheet Inventory Modules */}
      <BulkActionDrawer
        isOpen={isDrawerOpen || isBulkEditOpen}
        onClose={() => { setIsDrawerOpen(false); setIsBulkEditOpen(false); }}
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />
      <PriceStockHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => { setIsHistoryOpen(false); setHistoryTarget(null); }}
        targetProduct={historyTarget}
      />
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectProductCell={(prodId, field) => {
          const idx = filteredProducts.findIndex((p) => p.id === prodId);
          if (idx !== -1) {
            const targetPage = Math.floor(idx / pageSize) + 1;
            setPage(targetPage);
            setViewMode("spreadsheet");
            setTimeout(() => {
              const el = document.querySelector(`[data-cell-key="${prodId}-${field}"]`) as HTMLElement;
              if (el) el.click();
            }, 200);
          }
        }}
      />
    </div>
  );
}
