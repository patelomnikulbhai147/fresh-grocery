"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DeliveryMode, Product } from "@/data/catalog";
import { cities } from "@/data/catalog";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  weight: string;
  /** Pack weight in grams — total line weight = grams × quantity. */
  grams?: number;
  price: number;
  mrp: number;
  quantity: number;
  mode: DeliveryMode;
  // subscription-specific
  days?: string[]; // e.g. ["Mon","Wed","Fri"]
  // bulk-specific
  deliveryDate?: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product, weightIndex?: number, mode?: DeliveryMode, extra?: Partial<CartItem>) => void;
  remove: (productId: string, weight: string, mode: DeliveryMode) => void;
  updateQty: (productId: string, weight: string, mode: DeliveryMode, qty: number) => void;
  clear: () => void;
  /** Replace the whole cart (server hydrate / cross-device merge). */
  replaceItems: (items: CartItem[]) => void;
  clearMode: (mode: DeliveryMode) => void;
  forMode: (mode: DeliveryMode) => CartItem[];
  subtotal: () => number;
  subtotalFor: (mode: DeliveryMode) => number;
  discount: () => number;
  itemCount: () => number;
  itemCountFor: (mode: DeliveryMode) => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      add: (product, weightIndex = 0, mode = "instant", extra = {}) => {
        const w = product.weights[weightIndex] ?? product.weights[0];
        let price = w.price;
        let mrp = w.mrp;
        if (mode === "bulk" && w.bulk) {
          price = w.bulk.unit;
          mrp = Math.round(w.bulk.unit / (1 - w.bulk.discount / 100));
        }
        if (mode === "subscription" && w.subscription) {
          price = w.subscription;
          mrp = w.mrp;
        }
        set((s) => {
          const existing = s.items.find(
            (i) => i.productId === product.id && i.weight === w.label && i.mode === mode
          );
          if (existing) {
            // Basket stays CLOSED on add — the count badge + toast confirm the
            // add; customers open the basket manually via the header icon.
            return {
              items: s.items.map((i) =>
                i.productId === product.id && i.weight === w.label && i.mode === mode
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                productId: product.id,
                name: product.name,
                image: product.image,
                weight: w.label,
                grams: w.grams,
                price,
                mrp,
                quantity: 1,
                mode,
                ...extra,
              },
            ],
          };
        });
      },
      remove: (productId, weight, mode) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.productId === productId && i.weight === weight && i.mode === mode)
          ),
        })),
      updateQty: (productId, weight, mode, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.productId === productId && i.weight === weight && i.mode === mode
                ? { ...i, quantity: Math.max(0, qty) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      replaceItems: (items) => set({ items: Array.isArray(items) ? items : [] }),
      clearMode: (mode) =>
        set((s) => ({ items: s.items.filter((i) => i.mode !== mode) })),
      forMode: (mode) => get().items.filter((i) => i.mode === mode),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      subtotalFor: (mode) =>
        get()
          .items.filter((i) => i.mode === mode)
          .reduce((s, i) => s + i.price * i.quantity, 0),
      discount: () =>
        get().items.reduce((s, i) => s + (i.mrp - i.price) * i.quantity, 0),
      itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
      itemCountFor: (mode) =>
        get()
          .items.filter((i) => i.mode === mode)
          .reduce((s, i) => s + i.quantity, 0),
    }),
    {
      name: "flashkart-cart-v1",
      // Persist only the cart contents — the open/closed drawer state is
      // session UI; persisting it made the drawer pop open on every page load.
      partialize: (s) => ({ items: s.items }) as CartState,
    }
  )
);

// ──────────────────────── Wishlist ────────────────────────
export type Wishlist = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  /** Replace all wishlist ids (server hydrate / cross-device merge). */
  replaceIds: (ids: string[]) => void;
};

export const useWishlist = create<Wishlist>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) =>
          s.ids.includes(id)
            ? { ids: s.ids.filter((x) => x !== id) }
            : { ids: [...s.ids, id] }
        ),
      has: (id) => get().ids.includes(id),
      replaceIds: (ids) =>
        set({ ids: Array.isArray(ids) ? [...new Set(ids.filter((x) => typeof x === "string"))] : [] }),
    }),
    { name: "flashkart-wishlist" }
  )
);

// ──────────────────────── Toasts ────────────────────────
type Toast = { id: string; message: string; tone?: "success" | "info" | "error" | "warning" };
type ToastState = {
  toasts: Toast[];
  push: (message: string, tone?: Toast["tone"]) => void;
  dismiss: (id: string) => void;
};

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2800);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// ──────────────────────── City / location ────────────────────────
type CityState = {
  slug: string;
  setCity: (slug: string) => void;
  notifyModalOpen: boolean;
  openNotify: () => void;
  closeNotify: () => void;
};

export const useCity = create<CityState>()(
  persist(
    (set) => ({
      slug: "gandhinagar",
      setCity: (slug) => {
        const city = cities.find((c) => c.slug === slug);
        if (city && !city.live) {
          set({ slug, notifyModalOpen: true });
        } else {
          set({ slug, notifyModalOpen: false });
        }
      },
      notifyModalOpen: false,
      openNotify: () => set({ notifyModalOpen: true }),
      closeNotify: () => set({ notifyModalOpen: false }),
    }),
    { name: "flashkart-city" }
  )
);
