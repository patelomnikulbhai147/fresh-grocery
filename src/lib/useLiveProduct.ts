"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/data/catalog";
import { useAdminStore } from "@/store/adminStore";

/**
 * Returns the live, admin-managed version of a product.
 *
 * Product edits made in the Admin panel (price/MRP via weights, images &
 * gallery, pack sizes, stock, status, name, description…) live in the admin
 * store — the same source ProductManagement writes to. Subscribing here means
 * any admin change re-renders the storefront immediately with fresh values;
 * the static catalog entry is only the fallback for untouched products.
 *
 * The merge is applied after mount so the first client render matches the
 * server-rendered HTML (no hydration mismatch).
 */
export function useLiveProduct(product: Product): Product {
  const adminProducts = useAdminStore((s) => s.products);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return product;

  const live = adminProducts.find(
    (ap) => ap.id === product.id || ap.slug === product.slug
  );
  if (!live) return product;

  const unavailable = live.status === "Out of Stock" || live.status === "Hidden";

  return {
    ...product,
    ...live,
    image: live.image || product.image,
    gallery:
      live.gallery && live.gallery.length > 0
        ? live.gallery
        : [live.image || product.image],
    weights:
      live.weights && live.weights.length > 0 ? live.weights : product.weights,
    stock: unavailable
      ? 0
      : typeof live.currentStock === "number"
      ? live.currentStock
      : product.stock,
    // Shared physical inventory in grams — all pack sizes sell from this pool
    stockGrams: unavailable ? 0 : live.stockGrams ?? product.stockGrams,
  };
}
