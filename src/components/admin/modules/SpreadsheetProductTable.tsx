"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Edit,
  Trash2,
  Copy,
  Archive,
  RotateCcw,
  History,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Save,
  Undo,
  ChevronRight,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { useAdminStore, type AdminProduct, type ProductStatus, type DeliveryTimeOption, type ProductLabel } from "@/store/adminStore";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn, formatINR } from "@/lib/utils";

interface SpreadsheetProductTableProps {
  products: AdminProduct[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  autoSave: boolean;
  onOpenEditor: (product: AdminProduct) => void;
  onOpenHistory: (product: AdminProduct) => void;
  canEdit: boolean;
  canDelete: boolean;
  onBarcodeFocus?: (id: string, field: string) => void;
}

const EDITABLE_FIELDS = ["price", "mrp", "costPrice", "currentStock", "minStock", "status", "deliveryTime"];
const STATUS_OPTIONS: ProductStatus[] = ["Active", "Draft", "Hidden", "Out of Stock"];
const DELIVERY_OPTIONS: DeliveryTimeOption[] = ["10 Min", "20 Min", "30 Min", "45 Min", "Same Day"];

export function SpreadsheetProductTable({
  products,
  selectedIds,
  onSelectAll,
  onSelectOne,
  autoSave,
  onOpenEditor,
  onOpenHistory,
  canEdit,
  canDelete
}: SpreadsheetProductTableProps) {
  const { batchUpdateProductsInline, deleteProduct, duplicateProduct, archiveProduct, restoreProduct } = useAdminStore();
  const { user } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  // Manual Save Mode buffer
  const [pendingEdits, setPendingEdits] = useState<Record<string, Partial<AdminProduct>>>({});
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);

  // Ref map for cell inputs to enable keyboard focus jumping
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});

  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < products.length;

  // Merge products with pending edits for display
  const displayProducts = products.map((p) => {
    const edit = pendingEdits[p.id];
    if (!edit) return p;
    return { ...p, ...edit };
  });

  const getCellKey = (id: string, field: string) => `${id}-${field}`;

  const handleCellClick = (id: string, field: string) => {
    if (!canEdit) return;
    setEditingCell({ id, field });
    setTimeout(() => {
      const el = inputRefs.current[getCellKey(id, field)];
      if (el) {
        el.focus();
        if ("select" in el && typeof el.select === "function") {
          el.select();
        }
      }
    }, 20);
  };

  const saveCellChange = (id: string, field: string, value: any) => {
    const originalProd = products.find((p) => p.id === id);
    if (!originalProd) return;

    const editPayload: Partial<AdminProduct> = {};
    if (field === "price") {
      const num = parseFloat(value) || 0;
      editPayload.price = num;
      if (originalProd.weights && originalProd.weights.length > 0) {
        editPayload.weights = originalProd.weights.map((w, idx) => idx === 0 ? { ...w, price: num } : w);
      }
    } else if (field === "mrp") {
      const num = parseFloat(value) || 0;
      editPayload.mrp = num;
      if (originalProd.weights && originalProd.weights.length > 0) {
        editPayload.weights = originalProd.weights.map((w, idx) => idx === 0 ? { ...w, mrp: num } : w);
      }
    } else if (field === "costPrice" || field === "currentStock" || field === "minStock") {
      editPayload[field as keyof AdminProduct] = parseFloat(value) || 0 as any;
    } else {
      editPayload[field as keyof AdminProduct] = value;
    }

    if (autoSave) {
      batchUpdateProductsInline({ [id]: editPayload }, user?.name || "Super Admin", user?.role || "Super Admin", `Inline edit (${field})`);
      pushToast(`Auto-saved ${field} for ${originalProd.name}`, "success");
    } else {
      setPendingEdits((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), ...editPayload }
      }));
    }
  };

  const handleSaveAll = useCallback(() => {
    const count = Object.keys(pendingEdits).length;
    if (count === 0) return;
    batchUpdateProductsInline(pendingEdits, user?.name || "Super Admin", user?.role || "Super Admin", "Manual Batch Save");
    setPendingEdits({});
    pushToast(`Saved changes across ${count} products simultaneously! 🚀`, "success");
  }, [pendingEdits, batchUpdateProductsInline, user, pushToast]);

  const handleDiscardAll = useCallback(() => {
    if (Object.keys(pendingEdits).length === 0) return;
    setPendingEdits({});
    setEditingCell(null);
    pushToast("Discarded all unsaved changes.", "info");
  }, [pendingEdits, pushToast]);

  // Keyboard Navigation & Shortcuts (Ctrl+S, Ctrl+Z, Tab, Enter, Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S: Save All
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveAll();
      }
      // Ctrl+Z: Discard / Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (!autoSave && Object.keys(pendingEdits).length > 0 && !editingCell) {
          e.preventDefault();
          handleDiscardAll();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveAll, handleDiscardAll, autoSave, pendingEdits, editingCell]);

  // Prevent leaving tab if unsaved edits exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!autoSave && Object.keys(pendingEdits).length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [autoSave, pendingEdits]);

  const handleInputKeyDown = (e: React.KeyboardEvent, rowIdx: number, colField: string) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      // Commit the current cell before navigating — React unmounts the input
      // when the editing cell changes, so the onBlur save never fires.
      const editor = e.target as HTMLInputElement | HTMLSelectElement;
      saveCellChange(displayProducts[rowIdx].id, colField, editor.value);
      // On Enter, jump down to same column in next row
      // On Tab, jump to next field in same row
      if (e.key === "Enter") {
        const nextRowIdx = e.shiftKey ? rowIdx - 1 : rowIdx + 1;
        if (nextRowIdx >= 0 && nextRowIdx < displayProducts.length) {
          const nextId = displayProducts[nextRowIdx].id;
          handleCellClick(nextId, colField);
        } else {
          setEditingCell(null);
        }
      } else if (e.key === "Tab") {
        const fieldIdx = EDITABLE_FIELDS.indexOf(colField);
        const nextFieldIdx = e.shiftKey ? fieldIdx - 1 : fieldIdx + 1;
        if (nextFieldIdx >= 0 && nextFieldIdx < EDITABLE_FIELDS.length) {
          handleCellClick(displayProducts[rowIdx].id, EDITABLE_FIELDS[nextFieldIdx]);
        } else if (!e.shiftKey && rowIdx + 1 < displayProducts.length) {
          handleCellClick(displayProducts[rowIdx + 1].id, EDITABLE_FIELDS[0]);
        } else {
          setEditingCell(null);
        }
      }
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const getStockBadge = (stock: number, minStock: number) => {
    if (stock <= 0) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">Out of Stock (0)</span>;
    }
    if (stock < minStock || stock < 10) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Critical ({stock})</span>;
    }
    if (stock <= 50) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Low ({stock})</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Healthy ({stock})</span>;
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto bg-white rounded-2xl border border-brand-100 shadow-sm max-h-[70vh]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-brand-50/80 text-brand-700 font-bold uppercase sticky top-0 z-10 border-b border-brand-200">
            <tr>
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 cursor-pointer w-4 h-4"
                />
              </th>
              <th className="p-3 min-w-[200px]">Product / SKU</th>
              <th className="p-3 min-w-[100px] text-right">Selling Price ✏️</th>
              <th className="p-3 min-w-[90px] text-right">MRP ✏️</th>
              <th className="p-3 min-w-[90px] text-right">Cost ✏️</th>
              <th className="p-3 min-w-[80px] text-center">Margin</th>
              <th className="p-3 min-w-[120px] text-center">Stock Qty ✏️</th>
              <th className="p-3 min-w-[90px] text-center">Min Limit ✏️</th>
              <th className="p-3 min-w-[110px] text-center">Status ✏️</th>
              <th className="p-3 min-w-[110px] text-center">Delivery ✏️</th>
              <th className="p-3 min-w-[140px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100/60 font-medium text-brand-900">
            {displayProducts.map((p, rowIdx) => {
              const isSelected = selectedIds.includes(p.id);
              const hasPendingEdit = !!pendingEdits[p.id];
              const sellingPrice = p.weights[0]?.price ?? p.price;
              const mrp = p.weights[0]?.mrp ?? p.mrp;
              const margin = p.marginPercent || Math.round(((sellingPrice - (p.costPrice || 0)) / (sellingPrice || 1)) * 100);

              return (
                <tr
                  key={p.id}
                  className={cn(
                    "hover:bg-brand-50/50 transition group",
                    isSelected ? "bg-brand-50/80" : hasPendingEdit ? "bg-amber-50/40" : ""
                  )}
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectOne(p.id, e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500 cursor-pointer w-4 h-4"
                    />
                  </td>

                  {/* Product Info */}
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image || "/images/categories/vegetables.png"} alt="" className="w-10 h-10 rounded-xl object-cover border border-brand-100 bg-brand-50 shrink-0" />
                      <div>
                        <div className="font-bold text-brand-950 flex items-center gap-1.5 hover:text-brand-600 cursor-pointer" onClick={() => onOpenEditor(p)}>
                          {p.name}
                          {hasPendingEdit && <span className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved edit" />}
                        </div>
                        <div className="text-[10px] text-brand-500 font-mono flex items-center gap-2">
                          <span>{p.sku}</span>
                          <span>·</span>
                          <span>{p.brand}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Selling Price */}
                  <td
                    onClick={() => handleCellClick(p.id, "price")}
                    className="p-3 text-right cursor-pointer hover:bg-brand-100/40 transition rounded-lg font-bold"
                  >
                    {editingCell?.id === p.id && editingCell?.field === "price" ? (
                      <input
                        ref={(el) => { inputRefs.current[getCellKey(p.id, "price")] = el; }}
                        type="number"
                        defaultValue={sellingPrice}
                        onBlur={(e) => { saveCellChange(p.id, "price", e.target.value); setEditingCell(null); }}
                        onKeyDown={(e) => handleInputKeyDown(e, rowIdx, "price")}
                        className="w-20 px-2 py-1 text-right bg-white border border-brand-400 rounded shadow-inner text-xs font-bold text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : (
                      <span className="text-emerald-700">{formatINR(sellingPrice)}</span>
                    )}
                  </td>

                  {/* MRP */}
                  <td
                    onClick={() => handleCellClick(p.id, "mrp")}
                    className="p-3 text-right cursor-pointer hover:bg-brand-100/40 transition rounded-lg text-brand-500 line-through"
                  >
                    {editingCell?.id === p.id && editingCell?.field === "mrp" ? (
                      <input
                        ref={(el) => { inputRefs.current[getCellKey(p.id, "mrp")] = el; }}
                        type="number"
                        defaultValue={mrp}
                        onBlur={(e) => { saveCellChange(p.id, "mrp", e.target.value); setEditingCell(null); }}
                        onKeyDown={(e) => handleInputKeyDown(e, rowIdx, "mrp")}
                        className="w-16 px-1.5 py-1 text-right bg-white border border-brand-400 rounded shadow-inner text-xs font-normal text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : (
                      formatINR(mrp)
                    )}
                  </td>

                  {/* Cost Price */}
                  <td
                    onClick={() => handleCellClick(p.id, "costPrice")}
                    className="p-3 text-right cursor-pointer hover:bg-brand-100/40 transition rounded-lg text-brand-700"
                  >
                    {editingCell?.id === p.id && editingCell?.field === "costPrice" ? (
                      <input
                        ref={(el) => { inputRefs.current[getCellKey(p.id, "costPrice")] = el; }}
                        type="number"
                        defaultValue={p.costPrice || 0}
                        onBlur={(e) => { saveCellChange(p.id, "costPrice", e.target.value); setEditingCell(null); }}
                        onKeyDown={(e) => handleInputKeyDown(e, rowIdx, "costPrice")}
                        className="w-16 px-1.5 py-1 text-right bg-white border border-brand-400 rounded shadow-inner text-xs font-normal text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : (
                      formatINR(p.costPrice || 0)
                    )}
                  </td>

                  {/* Margin % */}
                  <td className="p-3 text-center">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold",
                      margin >= 25 ? "bg-emerald-50 text-emerald-700" : margin >= 15 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                    )}>
                      {margin}%
                    </span>
                  </td>

                  {/* Stock Qty */}
                  <td
                    onClick={() => handleCellClick(p.id, "currentStock")}
                    className="p-3 text-center cursor-pointer hover:bg-brand-100/40 transition rounded-lg"
                  >
                    {editingCell?.id === p.id && editingCell?.field === "currentStock" ? (
                      <input
                        ref={(el) => { inputRefs.current[getCellKey(p.id, "currentStock")] = el; }}
                        type="number"
                        defaultValue={p.currentStock}
                        onBlur={(e) => { saveCellChange(p.id, "currentStock", e.target.value); setEditingCell(null); }}
                        onKeyDown={(e) => handleInputKeyDown(e, rowIdx, "currentStock")}
                        className="w-16 px-1.5 py-1 text-center bg-white border border-brand-400 rounded shadow-inner text-xs font-bold text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-extrabold text-sm text-brand-950">{p.currentStock}</span>
                        {getStockBadge(p.currentStock, p.minStock || 15)}
                      </div>
                    )}
                  </td>

                  {/* Low Stock Limit */}
                  <td
                    onClick={() => handleCellClick(p.id, "minStock")}
                    className="p-3 text-center cursor-pointer hover:bg-brand-100/40 transition rounded-lg text-brand-600"
                  >
                    {editingCell?.id === p.id && editingCell?.field === "minStock" ? (
                      <input
                        ref={(el) => { inputRefs.current[getCellKey(p.id, "minStock")] = el; }}
                        type="number"
                        defaultValue={p.minStock || 15}
                        onBlur={(e) => { saveCellChange(p.id, "minStock", e.target.value); setEditingCell(null); }}
                        onKeyDown={(e) => handleInputKeyDown(e, rowIdx, "minStock")}
                        className="w-14 px-1 py-1 text-center bg-white border border-brand-400 rounded shadow-inner text-xs font-normal text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : (
                      <span>{p.minStock || 15}</span>
                    )}
                  </td>

                  {/* Status */}
                  <td
                    onClick={() => handleCellClick(p.id, "status")}
                    className="p-3 text-center cursor-pointer hover:bg-brand-100/40 transition rounded-lg"
                  >
                    {editingCell?.id === p.id && editingCell?.field === "status" ? (
                      <select
                        ref={(el) => { inputRefs.current[getCellKey(p.id, "status")] = el; }}
                        defaultValue={p.status}
                        onBlur={(e) => { saveCellChange(p.id, "status", e.target.value); setEditingCell(null); }}
                        onChange={(e) => { saveCellChange(p.id, "status", e.target.value); setEditingCell(null); }}
                        onKeyDown={(e) => handleInputKeyDown(e, rowIdx, "status")}
                        className="px-2 py-1 bg-white border border-brand-400 rounded shadow-inner text-xs font-semibold text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        p.status === "Active" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                        p.status === "Draft" ? "bg-amber-100 text-amber-800 border-amber-300" :
                        p.status === "Hidden" ? "bg-slate-100 text-slate-700 border-slate-300" :
                        "bg-rose-100 text-rose-800 border-rose-300"
                      )}>
                        {p.status}
                      </span>
                    )}
                  </td>

                  {/* Delivery Time */}
                  <td
                    onClick={() => handleCellClick(p.id, "deliveryTime")}
                    className="p-3 text-center cursor-pointer hover:bg-brand-100/40 transition rounded-lg text-brand-700"
                  >
                    {editingCell?.id === p.id && editingCell?.field === "deliveryTime" ? (
                      <select
                        ref={(el) => { inputRefs.current[getCellKey(p.id, "deliveryTime")] = el; }}
                        defaultValue={p.deliveryTime || "30 Min"}
                        onBlur={(e) => { saveCellChange(p.id, "deliveryTime", e.target.value); setEditingCell(null); }}
                        onChange={(e) => { saveCellChange(p.id, "deliveryTime", e.target.value); setEditingCell(null); }}
                        onKeyDown={(e) => handleInputKeyDown(e, rowIdx, "deliveryTime")}
                        className="px-2 py-1 bg-white border border-brand-400 rounded shadow-inner text-xs font-medium text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {DELIVERY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>⚡ {opt}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="bg-brand-50 px-2 py-1 rounded text-brand-800 border border-brand-200">
                        ⚡ {p.deliveryTime || "30 Min"}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onOpenEditor(p)}
                        title="Full Edit Details"
                        className="p-1.5 hover:bg-brand-100 rounded-lg text-brand-600 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenHistory(p)}
                        title="View Price & Stock Audit History"
                        className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => duplicateProduct(p.id, user?.name || "Super Admin", user?.role || "Super Admin")}
                        title="Duplicate Product"
                        className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {p.status === "Hidden" ? (
                        <button
                          onClick={() => restoreProduct(p.id, user?.name || "Super Admin", user?.role || "Super Admin")}
                          title="Restore to Active"
                          className="p-1.5 hover:bg-teal-100 rounded-lg text-teal-600 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => archiveProduct(p.id, user?.name || "Super Admin", user?.role || "Super Admin")}
                          title="Archive Product"
                          className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-600 transition"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to permanently delete ${p.name}?`)) {
                              deleteProduct(p.id, user?.name || "Super Admin", user?.role || "Super Admin");
                              pushToast(`Deleted ${p.name}`, "info");
                            }
                          }}
                          title="Delete Product"
                          className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {displayProducts.length === 0 && (
              <tr>
                <td colSpan={11} className="p-12 text-center text-brand-500 font-normal">
                  No products found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sticky Save Bar for Manual Save Mode */}
      {!autoSave && Object.keys(pendingEdits).length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand-950 text-white px-6 py-4 rounded-2xl shadow-2xl border border-brand-700 flex items-center gap-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 grid place-items-center font-bold text-base border border-amber-500/40 animate-pulse">
              {Object.keys(pendingEdits).length}
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Products Modified</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-brand-300 font-mono">Manual Mode</span>
              </div>
              <div className="text-xs text-brand-300">You have unsaved edits in spreadsheet buffer. Press Ctrl+S to commit.</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscardAll}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Undo className="w-3.5 h-3.5" />
              <span>Discard (Ctrl+Z)</span>
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs transition shadow-lg flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save All Changes (Ctrl+S)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
