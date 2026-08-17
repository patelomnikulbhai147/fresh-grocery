"use client";
import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, AlertTriangle } from "lucide-react";
import type { Weight } from "@/data/catalog";
import { cn, formatINR } from "@/lib/utils";

/**
 * Manage Product Variants / Pack Sizes.
 * Operates on the product's existing `weights[]` (the variant model reused
 * across storefront, cart and orders). Array order = customer display order.
 */
export function VariantManager({
  weights,
  onChange,
  preview,
}: {
  weights: Weight[];
  onChange: (w: Weight[]) => void;
  preview: { name?: string; image?: string; category?: string; subcategory?: string };
}) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const update = (i: number, patch: Partial<Weight>) => {
    onChange(weights.map((w, j) => (j === i ? { ...w, ...patch } : w)));
  };

  const clamp = (v: string) => Math.max(0, parseFloat(v) || 0);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= weights.length) return;
    const next = [...weights];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const addVariant = () => {
    onChange([
      ...weights,
      { label: "", grams: 500, price: 0, mrp: 0, active: true },
    ]);
  };

  const remove = (i: number) => {
    onChange(weights.filter((_, j) => j !== i));
    setConfirmDelete(null);
  };

  const discountOf = (w: Weight) =>
    w.mrp > w.price && w.mrp > 0 ? Math.round(((w.mrp - w.price) / w.mrp) * 100) : 0;

  const activeList = weights.filter((w) => w.active !== false);

  return (
    <div className="animate-in fade-in">
      <div className="mb-4">
        <h3 className="font-bold text-sm text-brand-950 dark:text-zinc-100">
          Manage Product Variants / Pack Sizes
        </h3>
        <p className="text-[11px] text-brand-600 dark:text-zinc-400 mt-0.5">
          Add, edit, reorder or deactivate the pack sizes shown on the customer product page.
          Row order here is exactly the customer display order. All pack sizes sell from the
          product&apos;s ONE shared physical stock (managed in the Inventory section below) —
          each sale deducts the pack&apos;s weight from it.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-5 items-start">
        {/* ── Variant table ── */}
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-brand-100 dark:border-zinc-700">
            <table className="w-full text-[11px] min-w-[680px]">
              <thead>
                <tr className="bg-brand-50/70 dark:bg-zinc-800 text-brand-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">
                  <th className="px-2.5 py-2 text-left w-8">#</th>
                  <th className="px-2.5 py-2 text-left">Pack Name</th>
                  <th className="px-2.5 py-2 text-left w-24">Weight (g)</th>
                  <th className="px-2.5 py-2 text-left w-24">Selling ₹</th>
                  <th className="px-2.5 py-2 text-left w-24">MRP ₹</th>
                  <th className="px-2.5 py-2 text-left w-16">Disc.</th>
                  <th className="px-2.5 py-2 text-left w-20">Status</th>
                  <th className="px-2.5 py-2 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {weights.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-brand-500 dark:text-zinc-500">
                      No pack sizes yet — add the first one below.
                    </td>
                  </tr>
                )}
                {weights.map((w, i) => {
                  const inactive = w.active === false;
                  const priceAboveMrp = w.mrp > 0 && w.price > w.mrp;
                  return (
                    <tr
                      key={i}
                      className={cn(
                        "border-t border-brand-100 dark:border-zinc-700",
                        inactive && "opacity-55 bg-slate-50/60 dark:bg-zinc-800/40"
                      )}
                    >
                      <td className="px-2.5 py-2 font-bold text-brand-500">{i + 1}</td>
                      <td className="px-2.5 py-2">
                        <input
                          type="text"
                          value={w.label}
                          placeholder="e.g. 500 g"
                          onChange={(e) => update(i, { label: e.target.value })}
                          className={cn(
                            "w-full min-w-[110px] bg-white dark:bg-zinc-800 border rounded-lg px-2 py-1.5 outline-none",
                            w.label.trim() === ""
                              ? "border-rose-400 ring-1 ring-rose-200"
                              : "border-brand-200 dark:border-zinc-700 focus:border-brand-500"
                          )}
                        />
                        {w.label.trim() === "" && (
                          <div className="text-[9px] text-rose-600 font-bold mt-0.5">Pack name is required</div>
                        )}
                      </td>
                      <td className="px-2.5 py-2">
                        <input
                          type="number"
                          min={0}
                          value={w.grams}
                          onChange={(e) => update(i, { grams: clamp(e.target.value) })}
                          className="w-full bg-white dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="px-2.5 py-2">
                        <input
                          type="number"
                          min={0}
                          value={w.price}
                          onChange={(e) => update(i, { price: clamp(e.target.value) })}
                          className={cn(
                            "w-full bg-white dark:bg-zinc-800 border rounded-lg px-2 py-1.5 outline-none",
                            priceAboveMrp
                              ? "border-amber-400 ring-1 ring-amber-200"
                              : "border-brand-200 dark:border-zinc-700 focus:border-brand-500"
                          )}
                        />
                      </td>
                      <td className="px-2.5 py-2">
                        <input
                          type="number"
                          min={0}
                          value={w.mrp}
                          onChange={(e) => update(i, { mrp: clamp(e.target.value) })}
                          className="w-full bg-white dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="px-2.5 py-2 font-bold text-[#ea580c]">
                        {discountOf(w) > 0 ? `${discountOf(w)}%` : "—"}
                      </td>
                      <td className="px-2.5 py-2">
                        <button
                          type="button"
                          onClick={() => update(i, { active: inactive ? true : false })}
                          className={cn(
                            "px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border transition",
                            inactive
                              ? "bg-slate-100 text-slate-500 border-slate-300 hover:border-slate-400"
                              : "bg-emerald-50 text-[#067a46] border-emerald-300 hover:bg-emerald-100"
                          )}
                        >
                          {inactive ? "Inactive" : "Active"}
                        </button>
                      </td>
                      <td className="px-2.5 py-2">
                        {confirmDelete === i ? (
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            <span className="text-[9px] font-bold text-rose-700">Delete this pack size?</span>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(null)}
                              className="px-1.5 py-1 rounded-lg border border-brand-200 dark:border-zinc-600 text-[9px] font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(i)}
                              className="px-1.5 py-1 rounded-lg bg-rose-600 text-white text-[9px] font-bold hover:bg-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => move(i, -1)}
                              disabled={i === 0}
                              aria-label="Move up"
                              className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-zinc-800 disabled:opacity-30 text-brand-700 dark:text-zinc-300"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(i, 1)}
                              disabled={i === weights.length - 1}
                              aria-label="Move down"
                              className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-zinc-800 disabled:opacity-30 text-brand-700 dark:text-zinc-300"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(i)}
                              aria-label="Delete variant"
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {weights.some((w) => w.mrp > 0 && w.price > w.mrp) && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              One or more selling prices are above MRP — double-check before saving.
            </div>
          )}
          {activeList.length === 0 && weights.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              All pack sizes are inactive — customers will see this product as unavailable.
            </div>
          )}

          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#067a46] hover:bg-[#046338] text-white font-bold text-[11px] shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Variant
          </button>
          <p className="text-[10px] text-brand-500 dark:text-zinc-500">
            Changes apply when you click <strong>Save Changes</strong> below. Deleting a pack
            does not affect items already in carts or past orders — those keep their
            purchase-time name and price.
          </p>
        </div>

        {/* ── Customer preview ── */}
        <div className="rounded-2xl border border-brand-100 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 p-4 lg:sticky lg:top-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand-500 dark:text-zinc-400 mb-3">
            <Eye className="w-3.5 h-3.5" /> Customer Preview
          </div>
          {preview.image && (
            <div className="relative w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.image} alt="" className="absolute inset-0 w-full h-full object-contain p-2" />
            </div>
          )}
          <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
            {preview.category} · {preview.subcategory}
          </div>
          <div className="font-display font-extrabold text-sm text-slate-900 dark:text-zinc-100 leading-snug mt-0.5">
            {preview.name || "Product name"}
          </div>
          {activeList[0] && (
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="font-display font-black text-lg text-slate-900 dark:text-zinc-100">
                {formatINR(activeList[0].price)}
              </span>
              {activeList[0].mrp > activeList[0].price && (
                <>
                  <span className="text-[11px] text-slate-400 line-through">{formatINR(activeList[0].mrp)}</span>
                  <span className="text-[9px] font-black text-[#ea580c] bg-orange-50 border border-orange-200 rounded-full px-1.5 py-0.5">
                    {discountOf(activeList[0])}% OFF
                  </span>
                </>
              )}
            </div>
          )}
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-3 mb-1.5">
            Choose pack size
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeList.length === 0 && (
              <span className="text-[10px] font-bold text-rose-600">Currently unavailable</span>
            )}
            {activeList.map((w, i) => (
              <span
                key={`${w.label}-${i}`}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg border text-left",
                  i === 0
                    ? "border-[#067a46] bg-emerald-50 ring-1 ring-emerald-100"
                    : "border-slate-200 bg-white dark:bg-zinc-800"
                )}
              >
                <span className="block text-[10px] font-bold text-slate-900 dark:text-zinc-100">
                  {w.label || "—"}
                </span>
                <span className="block text-[9px] font-semibold text-[#067a46]">{formatINR(w.price)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
