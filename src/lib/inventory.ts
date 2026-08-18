import {
  products as initialProducts,
  type Weight,
} from "@/data/catalog";
import type { AdminProduct } from "@/store/adminStore";

/**
 * Give every variant its own stock number. Variants that already have one keep it;
 * the product's pooled stock is split evenly across the rest, so the product's
 * TOTAL stock is preserved (never inflated or zeroed).
 */
export function normalizeVariantStocks(weights: Weight[], totalStock: number): Weight[] {
  const missing = weights.filter((w) => w.stock === undefined);
  if (missing.length === 0) return weights;
  const definedSum = weights.reduce((n, w) => n + (w.stock ?? 0), 0);
  const pool = Math.max(0, (totalStock ?? 0) - definedSum);
  const base = Math.floor(pool / missing.length);
  let rem = pool - base * missing.length;
  return weights.map((w) => {
    if (w.stock !== undefined) return w;
    const extra = rem > 0 ? 1 : 0;
    rem -= extra;
    return { ...w, stock: base + extra };
  });
}

/** Legacy pack-count → physical grams: Σ (pack count × pack weight). Deterministic, no guessing. */
export function packCountsToGrams(weights: Weight[]): number {
  return weights.reduce((n, w) => n + (w.stock ?? 0) * Math.max(1, w.grams), 0);
}

/**
 * Weight-based stock status — the single source of truth.
 * All pack sizes share ONE physical inventory (stockGrams). The product is
 * Out of Stock when the remaining grams can't fulfil even the smallest active
 * pack; Low Stock when at/below the weight threshold (default 2 kg).
 */
export function productStockInfo(
  p: Pick<AdminProduct, "weights"> & { stockGrams?: number; minStockGrams?: number }
) {
  const active = p.weights.filter((w) => w.active !== false);
  const totalGrams = Math.max(0, Math.round(p.stockGrams ?? 0));
  const smallestPack = active.length ? Math.min(...active.map((w) => Math.max(1, w.grams))) : 0;
  const threshold = p.minStockGrams ?? 2000;
  const allOut = active.length === 0 || totalGrams < smallestPack;
  const low = !allOut && totalGrams <= threshold;
  const status: "In Stock" | "Low Stock" | "Out of Stock" = allOut
    ? "Out of Stock"
    : low
    ? "Low Stock"
    : "In Stock";
  return {
    totalGrams,
    status,
    allOut,
    low,
    /** kept for call-site compatibility */
    anyLow: low,
    total: totalGrams,
    packCount: p.weights.length,
    activeCount: active.length,
  };
}

/**
 * Convert frontend catalog items to AdminProducts with initial rich data.
 * This is the ONE seed used everywhere: the admin store's first-run state and
 * the server product table's first-run rows are built from the same function,
 * so both sides start from identical data.
 */
export function buildInitialAdminProducts(): AdminProduct[] {
  return initialProducts.map((p, idx) => {
    const defaultWeight = p.weights[0] ?? { price: 100, mrp: 120, label: "1 unit", grams: 500 };
    const costPrice = Math.round(defaultWeight.price * 0.75);
    const marginPercent = Math.round(((defaultWeight.price - costPrice) / defaultWeight.price) * 100);

    // Seed physical stock: legacy per-pack counts (evenly split) × pack weight, summed.
    const seededWeights = normalizeVariantStocks(p.weights, p.stock ?? 45);
    const stockGrams = packCountsToGrams(seededWeights);

    return {
      ...p,
      weights: seededWeights,
      stockGrams,
      minStockGrams: 2000,
      sku: `FRM-SKU-${1000 + idx}`,
      barcode: `890100${2000 + idx}`,
      brand: idx % 3 === 0 ? "FlashKart Fresh" : idx % 2 === 0 ? "Fresh Harvest" : "Green Valley",
      unit: defaultWeight.label,
      variant: "Standard Pack",
      costPrice,
      taxPercent: 5,
      marginPercent,
      // Legacy mirrors kept in grams so older modules never show stale unit counts
      currentStock: stockGrams,
      reservedStock: 0,
      availableStock: stockGrams,
      minStock: 15,
      maxStock: 250,
      warehouse: idx % 2 === 0 ? "Hub-A (North Gandhinagar)" : "Hub-B (Gandhinagar Central)",
      batchNumber: `BATCH-2026-${100 + idx}`,
      status: p.stock && p.stock > 0 ? "Active" : "Out of Stock",
      labels: p.organic ? ["Organic", "Fresh"] : p.bestSeller ? ["Bestseller", "Fresh"] : ["Fresh"],
      badge: p.weights.some((w) => w.bulk) ? "Combo Offer" : defaultWeight.price < defaultWeight.mrp ? "Discount" : "None",
      deliveryTime: "Daily Morning",
      seoTitle: `${p.name} — Fresh Online at FlashKart`,
      seoDescription: p.description || `Buy farm-fresh ${p.name} directly from FlashKart.`,
      seoKeywords: `${p.name}, fresh vegetables, seasonal fruits, flashkart produce`,
      ogImage: p.image,
    } as AdminProduct;
  });
}

/** Statuses a CUSTOMER may see. "Out of Stock" stays visible (marked, not hidden). */
export const CUSTOMER_VISIBLE_STATUSES = ["Active", "Out of Stock"] as const;

export function isCustomerVisibleStatus(status: string | undefined | null): boolean {
  return status === "Active" || status === "Out of Stock";
}
