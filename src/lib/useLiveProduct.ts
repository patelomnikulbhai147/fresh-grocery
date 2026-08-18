"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/data/catalog";
import { useLiveCatalog } from "@/store/liveCatalog";

/**
 * Returns the live, server-authoritative version of a product.
 *
 * Products now live in the production database (see src/lib/serverCatalog.ts);
 * this hook re-checks the rendered product against the customer product API so
 * that a product deactivated by the Super Admin AFTER this page was delivered
 * immediately becomes unbuyable (stock forced to 0) without a reload.
 *
 * It intentionally does NOT read any browser-local admin store — localStorage
 * copies are per-browser and were the root cause of customers seeing products
 * the admin had removed.
 *
 * The merge is applied after mount so the first client render matches the
 * server-rendered HTML (no hydration mismatch).
 */
export function useLiveProduct(product: Product): Product {
  const byKey = useLiveCatalog((s) => s.byKey);
  const status = useLiveCatalog((s) => s.status);
  const fetchOnce = useLiveCatalog((s) => s.fetchOnce);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    fetchOnce();
  }, [fetchOnce]);

  if (!mounted || status !== "ready" || !byKey) return product;

  const live = byKey.get(product.id) ?? byKey.get(product.slug);
  if (!live) {
    // The API is healthy and this product is NOT customer-visible any more
    // (deactivated/hidden/deleted since the page was rendered) → keep the UI
    // intact but make every pack size unbuyable.
    return { ...product, stock: 0, stockGrams: 0 };
  }

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
  };
}
