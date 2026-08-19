"use client";
import { useEffect, useRef } from "react";
import { useCustomerAuth } from "@/store/customerAuth";
import { useAddressBook, type SavedAddress } from "@/store/addresses";
import { useCart, useWishlist, type CartItem } from "@/store/shop";

/**
 * Keeps the logged-in customer's addresses, wishlist and cart in sync with the
 * SERVER (production database), so the account follows the customer across
 * every device instead of living only in one browser's localStorage.
 *
 * On login (or first mount while authenticated):
 *   1. fetch the server copy,
 *   2. merge it with whatever is in THIS browser (so a guest cart/address is
 *      never lost), applying the union,
 *   3. write the merged result to both the local stores and the server.
 *
 * After that, any local change (add/remove/update) is debounced and pushed up.
 * Identity always comes from the authenticated session (server customer id) —
 * localStorage never decides the account.
 */

const cartKey = (i: CartItem) => `${i.productId}|${i.weight}|${i.mode}`;
const addrKey = (a: SavedAddress) =>
  `${(a.addressLine || "").trim().toLowerCase()}|${(a.pincode || "").trim()}|${(a.label || "").trim().toLowerCase()}`;

function mergeAddresses(local: SavedAddress[], server: SavedAddress[], userKey: string): SavedAddress[] {
  const out: SavedAddress[] = [];
  const seenId = new Set<string>();
  const seenContent = new Set<string>();
  // Server rows win first (they are the shared source of truth).
  for (const a of [...server, ...local]) {
    if (!a) continue;
    const withUser = { ...a, userKey };
    if (a.id && seenId.has(a.id)) continue;
    const ck = addrKey(withUser);
    if (seenContent.has(ck)) continue;
    if (a.id) seenId.add(a.id);
    seenContent.add(ck);
    out.push(withUser);
  }
  // Exactly one default.
  if (out.length && !out.some((a) => a.isDefault)) out[0].isDefault = true;
  let seenDefault = false;
  for (const a of out) {
    if (a.isDefault && !seenDefault) seenDefault = true;
    else if (a.isDefault) a.isDefault = false;
  }
  return out;
}

function mergeWishlist(local: string[], server: string[]): string[] {
  return [...new Set([...(server || []), ...(local || [])].filter((x) => typeof x === "string"))];
}

function mergeCart(local: CartItem[], server: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const i of server || []) map.set(cartKey(i), { ...i });
  for (const i of local || []) {
    const k = cartKey(i);
    const existing = map.get(k);
    // Same line on both devices → keep the higher quantity (never silently drop).
    if (existing) existing.quantity = Math.max(existing.quantity, i.quantity);
    else map.set(k, { ...i });
  }
  return [...map.values()];
}

export function useAccountSync() {
  const userId = useCustomerAuth((s) => (s.isAuthenticated ? s.user?.id ?? null : null));
  const userMobile = useCustomerAuth((s) => s.user?.mobile ?? null);

  const applyingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || !userMobile) return;
    const uid = userId;
    const mobile = userMobile;
    let cancelled = false;

    const pushKind = (kind: "addresses" | "wishlist" | "cart", data: any[]) =>
      fetch("/api/account/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, data }),
      }).catch(() => {});

    const pushAll = () => {
      const addresses = useAddressBook.getState().addresses.filter((a) => a.userKey === mobile);
      const wishlist = useWishlist.getState().ids;
      const cart = useCart.getState().items;
      pushKind("addresses", addresses);
      pushKind("wishlist", wishlist);
      pushKind("cart", cart);
    };

    const schedulePush = () => {
      if (applyingRef.current) return; // don't echo the hydrate back up
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(pushAll, 800);
    };

    // ── 1. Hydrate from server + merge local, once per logged-in id ──
    (async () => {
      if (hydratedForRef.current === uid) return;
      try {
        const res = await fetch("/api/account/data", { cache: "no-store" });
        if (cancelled) return;
        const data = await res.json().catch(() => null);
        const serverAddr: SavedAddress[] = Array.isArray(data?.addresses) ? data.addresses : [];
        const serverWish: string[] = Array.isArray(data?.wishlist) ? data.wishlist : [];
        const serverCart: CartItem[] = Array.isArray(data?.cart) ? data.cart : [];

        const localAddr = useAddressBook.getState().addresses.filter((a) => a.userKey === mobile);
        const localWish = useWishlist.getState().ids;
        const localCart = useCart.getState().items;

        const mergedAddr = mergeAddresses(localAddr, serverAddr, mobile);
        const mergedWish = mergeWishlist(localWish, serverWish);
        const mergedCart = mergeCart(localCart, serverCart);

        // Apply merged result locally without triggering an immediate re-push.
        applyingRef.current = true;
        useAddressBook.getState().replaceUser(mobile, mergedAddr);
        useWishlist.getState().replaceIds(mergedWish);
        useCart.getState().replaceItems(mergedCart);
        // Let the store notifications flush, then allow pushes again.
        setTimeout(() => {
          applyingRef.current = false;
        }, 0);

        hydratedForRef.current = uid;

        // Push the merged truth up so the server reflects the union.
        pushKind("addresses", mergedAddr);
        pushKind("wishlist", mergedWish);
        pushKind("cart", mergedCart);
      } catch {
        /* offline / DB down → keep local; will retry on next login */
      }
    })();

    // ── 2. Push local changes up (debounced) ──
    const unsubAddr = useAddressBook.subscribe((s, prev) => {
      if (s.addresses !== prev.addresses) schedulePush();
    });
    const unsubWish = useWishlist.subscribe((s, prev) => {
      if (s.ids !== prev.ids) schedulePush();
    });
    const unsubCart = useCart.subscribe((s, prev) => {
      if (s.items !== prev.items) schedulePush();
    });

    return () => {
      cancelled = true;
      unsubAddr();
      unsubWish();
      unsubCart();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userId, userMobile]);
}
