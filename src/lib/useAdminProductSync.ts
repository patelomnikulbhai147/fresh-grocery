"use client";
import { useEffect, useRef, useState } from "react";
import { useAdminStore, type AdminProduct, type AdminOrder } from "@/store/adminStore";
import { useAdminAuth } from "@/store/adminAuth";
import { useCustomerAuth } from "@/store/customerAuth";

export type AdminSyncState = "idle" | "syncing" | "synced" | "unauthorized" | "error";

function serialize(p: AdminProduct, pos: number): string {
  return JSON.stringify({ ...p, __pos: pos });
}

function toMap(products: AdminProduct[]): Map<string, string> {
  const m = new Map<string, string>();
  products.forEach((p, i) => m.set(p.id, serialize(p, i)));
  return m;
}

/**
 * Keeps the admin panel's product store and the SERVER product database in
 * sync — the server is the single source of truth the customer website reads.
 *
 * First load:
 *  - server already admin-managed → server list REPLACES the local store
 *  - server still holds the untouched seed → this browser's catalog (the
 *    admin's real, current data) is pushed up ONCE and becomes server state
 *
 * After that every product mutation in the store is diffed and pushed
 * (debounced): changed/new products upsert, removed products soft-delete.
 * The push endpoint requires the admin's login session (JWT cookie) — an
 * unauthenticated browser can read nothing and change nothing.
 */
export function useAdminProductSync(): AdminSyncState {
  const [state, setState] = useState<AdminSyncState>("idle");
  const lastSyncedRef = useRef<Map<string, string> | null>(null);
  const startedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushingRef = useRef(false);

  useEffect(() => {
    // No admin login in this browser at all → don't even call the API
    // (it would 401 anyway); the layout shows the sign-in warning.
    const adminAuthed =
      useAdminAuth.getState().isAuthenticated ||
      useCustomerAuth.getState().isAuthenticated;
    if (!adminAuthed) {
      setState("unauthorized");
      return;
    }

    const pushDiff = async () => {
      const base = lastSyncedRef.current;
      if (!base || pushingRef.current) return;
      const current = useAdminStore.getState().products;
      const upserts: any[] = [];
      const seen = new Set<string>();
      current.forEach((p, i) => {
        seen.add(p.id);
        const ser = serialize(p, i);
        if (base.get(p.id) !== ser) upserts.push({ ...p, __pos: i });
      });
      const deletes = [...base.keys()].filter((id) => !seen.has(id));
      if (upserts.length === 0 && deletes.length === 0) return;

      pushingRef.current = true;
      try {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ upserts, deletes }),
        });
        if (res.status === 401 || res.status === 403) {
          setState("unauthorized");
          return;
        }
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) throw new Error(data?.message || `HTTP ${res.status}`);
        lastSyncedRef.current = toMap(current);
        setState("synced");
        // Changes made while this push was in flight → follow-up push.
        if (useAdminStore.getState().products !== current) schedule();
      } catch {
        setState("error");
        // Retry automatically — admin edits must not silently stay local.
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(pushDiff, 10_000);
      } finally {
        pushingRef.current = false;
      }
    };

    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(pushDiff, 800);
    };

    // The subscription is registered on EVERY mount and torn down on unmount —
    // never guarded — so admin edits keep publishing (a StrictMode remount, or
    // any remount, must not silently drop the diff-push subscription).
    const unsubscribe = useAdminStore.subscribe((s, prev) => {
      if (s.products !== prev.products) schedule();
    });

    // The initial load/adoption runs at most once per browser session.
    if (startedRef.current) {
      return () => {
        unsubscribe();
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
    startedRef.current = true;

    (async () => {
      setState("syncing");
      try {
        const res = await fetch("/api/admin/products", { cache: "no-store" });
        if (res.status === 401 || res.status === 403) {
          setState("unauthorized");
          return;
        }
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success || !Array.isArray(data.products)) {
          throw new Error(data?.message || `HTTP ${res.status}`);
        }
        if (data.everSynced) {
          // Server is authoritative — the panel shows exactly what customers see.
          useAdminStore.setState({ products: data.products });
          lastSyncedRef.current = toMap(data.products);
          setState("synced");
        } else {
          // One-time adoption: publish this browser's current catalog.
          const local = useAdminStore.getState().products;
          const push = await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              upserts: local.map((p, i) => ({ ...p, __pos: i })),
              deletes: [],
            }),
          });
          if (push.status === 401 || push.status === 403) {
            setState("unauthorized");
            return;
          }
          const pushData = await push.json().catch(() => null);
          if (!push.ok || !pushData?.success) throw new Error();
          lastSyncedRef.current = toMap(local);
          setState("synced");
        }
      } catch {
        setState("error");
      }
    })();

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ── Orders sync (server-side order database) ──
  const orderStatusRef = useRef<Map<string, string> | null>(null);
  const localOnlyOrdersRef = useRef<Set<string>>(new Set());
  const orderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ordersStartedRef = useRef(false);

  useEffect(() => {
    const adminAuthed =
      useAdminAuth.getState().isAuthenticated ||
      useCustomerAuth.getState().isAuthenticated;
    if (!adminAuthed) return;

    const pushStatusChanges = async () => {
      const base = orderStatusRef.current;
      if (!base) return;
      const orders = useAdminStore.getState().orders;
      for (const o of orders) {
        const prev = base.get(o.id);
        if (prev !== undefined && prev !== o.status && !localOnlyOrdersRef.current.has(o.id)) {
          base.set(o.id, o.status);
          try {
            const res = await fetch("/api/admin/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: o.id, status: o.status }),
            });
            const data = await res.json().catch(() => null);
            if (data?.notFound) localOnlyOrdersRef.current.add(o.id);
          } catch {
            // retry on the next change; local state is preserved either way
            base.set(o.id, prev);
          }
        }
      }
    };

    const scheduleOrders = () => {
      if (orderTimerRef.current) clearTimeout(orderTimerRef.current);
      orderTimerRef.current = setTimeout(pushStatusChanges, 600);
    };

    const unsubscribe = useAdminStore.subscribe((s, prev) => {
      if (s.orders !== prev.orders) scheduleOrders();
    });

    if (ordersStartedRef.current) {
      return () => {
        unsubscribe();
        if (orderTimerRef.current) clearTimeout(orderTimerRef.current);
      };
    }
    ordersStartedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/admin/orders", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (!data?.success || !Array.isArray(data.orders)) return;
        const serverOrders = data.orders as AdminOrder[];
        const serverIds = new Set(serverOrders.map((o) => o.id));
        // Server orders are authoritative; local-only (legacy/demo) orders stay.
        useAdminStore.setState((s) => ({
          orders: [
            ...serverOrders,
            ...s.orders.filter((o) => !serverIds.has(o.id)),
          ],
        }));
        const map = new Map<string, string>();
        for (const o of useAdminStore.getState().orders) map.set(o.id, o.status);
        for (const o of useAdminStore.getState().orders) {
          if (!serverIds.has(o.id)) localOnlyOrdersRef.current.add(o.id);
        }
        orderStatusRef.current = map;
      } catch {
        // orders stay local-only this session; products sync already warns
      }
    })();

    return () => {
      unsubscribe();
      if (orderTimerRef.current) clearTimeout(orderTimerRef.current);
    };
  }, []);

  return state;
}
