"use client";
import { create } from "zustand";
import type { Product } from "@/data/catalog";

/**
 * Client-side mirror of the AUTHORITATIVE customer product API
 * (GET /api/products — backend-filtered to customer-visible products only).
 *
 * Deliberately NOT persisted: stale product data must never survive a page
 * load. On API failure the storefront keeps the server-rendered data it was
 * given — it never falls back to demo/static products.
 */
type LiveCatalogState = {
  products: Product[] | null;
  byKey: Map<string, Product> | null;
  status: "idle" | "loading" | "ready" | "error";
  fetchOnce: () => void;
};

export const useLiveCatalog = create<LiveCatalogState>((set, get) => ({
  products: null,
  byKey: null,
  status: "idle",
  fetchOnce: () => {
    if (get().status === "loading" || get().status === "ready") return;
    set({ status: "loading" });
    fetch("/api/products", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success || !Array.isArray(data.products)) {
          throw new Error(data?.message || `HTTP ${res.status}`);
        }
        const byKey = new Map<string, Product>();
        for (const p of data.products as Product[]) {
          byKey.set(p.id, p);
          if (p.slug) byKey.set(p.slug, p);
        }
        set({ products: data.products, byKey, status: "ready" });
      })
      .catch(() => {
        set({ status: "error" });
      });
  },
}));
