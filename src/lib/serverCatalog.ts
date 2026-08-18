import type { PoolConnection } from "mysql2/promise";
// RAW MySQL pool on purpose: product data must never fall back to the dev
// in-memory store — a DB problem surfaces as an error state, never as
// wrong/demo products.
import { getMysqlPool } from "@/db/index";
import { formatWeight } from "@/lib/utils";
import {
  buildInitialAdminProducts,
  isCustomerVisibleStatus,
  productStockInfo,
} from "@/lib/inventory";
import type { AdminProduct } from "@/store/adminStore";
import type { Product } from "@/data/catalog";

/**
 * SERVER-SIDE PRODUCT SOURCE OF TRUTH.
 *
 * The customer website and the Super Admin panel must read/write the SAME
 * authoritative product data. That data lives in the `store_products` MySQL
 * table — NOT in any browser's localStorage and NOT in the static catalog
 * file (the static catalog is only the one-time seed for an empty table).
 *
 * Visibility rule enforced here (backend, not frontend):
 *   Active               → customer sees it
 *   Active + 0 stock     → customer sees it as OUT OF STOCK (not hidden)
 *   Hidden / Draft       → customer never sees it
 *   deleted flag         → customer never sees it (row kept for history)
 */

const CREATE_PRODUCTS_TABLE = `
  CREATE TABLE IF NOT EXISTS store_products (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    slug VARCHAR(191) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'Active',
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    stock_grams INT NOT NULL DEFAULT 0,
    pos INT NOT NULL DEFAULT 0,
    data LONGTEXT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_store_products_slug (slug),
    INDEX idx_store_products_visible (deleted, status)
  )
`;

const CREATE_META_TABLE = `
  CREATE TABLE IF NOT EXISTS store_meta (
    k VARCHAR(64) NOT NULL PRIMARY KEY,
    v TEXT
  )
`;

/** Meta flag: set after the first successful admin push. Until then the table
 *  still holds the untouched seed and the admin's browser data wins upward. */
export const META_ADMIN_EVER_SYNCED = "admin_ever_synced";

let readyPromise: Promise<void> | null = null;

async function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const conn = await getMysqlPool().getConnection();
      try {
        await conn.query(CREATE_PRODUCTS_TABLE);
        await conn.query(CREATE_META_TABLE);
        const [rows] = await conn.execute<any[]>(
          `SELECT COUNT(*) AS count FROM store_products`
        );
        const count = Array.isArray(rows) && rows[0] ? Number(rows[0].count) : 0;
        if (count === 0) {
          await insertSeed(conn);
        }
      } finally {
        conn.release();
      }
    })();
    // A failed init (e.g. DB briefly down) must retry on the next request,
    // not stay cached as a permanent rejection.
    readyPromise.catch(() => {
      readyPromise = null;
    });
  }
  return readyPromise;
}

async function insertSeed(conn: PoolConnection): Promise<void> {
  const seed = buildInitialAdminProducts();
  for (let i = 0; i < seed.length; i++) {
    const p = seed[i];
    await conn.execute(
      `INSERT INTO store_products (id, slug, name, status, deleted, stock_grams, pos, data)
       VALUES (?, ?, ?, ?, 0, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id = id`,
      [p.id, p.slug, p.name, p.status, Math.max(0, Math.round(p.stockGrams ?? 0)), i, JSON.stringify(p)]
    );
  }
}

function rowToProduct(row: any): AdminProduct | null {
  try {
    const parsed = JSON.parse(row.data) as AdminProduct;
    const grams = Math.max(0, Number(row.stock_grams) || 0);
    // The columns are authoritative for stock + status (order placement updates
    // them atomically); the JSON payload carries everything else.
    parsed.stockGrams = grams;
    parsed.currentStock = grams;
    parsed.availableStock = grams;
    parsed.stock = grams;
    parsed.status = row.status;
    return parsed;
  } catch {
    return null;
  }
}

/** Full admin list (all statuses), excluding deleted. */
export async function getAdminProductsFromDb(): Promise<AdminProduct[]> {
  await ensureReady();
  const conn = await getMysqlPool().getConnection();
  try {
    const [rows] = await conn.execute<any[]>(
      `SELECT id, slug, name, status, deleted, stock_grams, pos, data
       FROM store_products WHERE deleted = 0 ORDER BY pos ASC, name ASC`
    );
    return (Array.isArray(rows) ? rows : [])
      .map(rowToProduct)
      .filter((p): p is AdminProduct => p !== null);
  } finally {
    conn.release();
  }
}

/**
 * Customer-eligible products ONLY (backend visibility filter):
 * not deleted, status Active or Out of Stock. Out-of-stock products are
 * returned with stockGrams as-is so the UI shows them as unbuyable — a
 * product whose status is "Out of Stock" is additionally forced to 0 grams
 * so no pack size is orderable.
 */
export async function getCustomerProductsFromDb(): Promise<Product[]> {
  await ensureReady();
  const conn = await getMysqlPool().getConnection();
  try {
    const [rows] = await conn.execute<any[]>(
      `SELECT id, slug, name, status, deleted, stock_grams, pos, data
       FROM store_products
       WHERE deleted = 0 AND status IN ('Active', 'Out of Stock')
       ORDER BY pos ASC, name ASC`
    );
    return (Array.isArray(rows) ? rows : [])
      .map(rowToProduct)
      .filter((p): p is AdminProduct => p !== null)
      .map((p) => (p.status === "Out of Stock" ? { ...p, stockGrams: 0, stock: 0 } : p));
  } finally {
    conn.release();
  }
}

/**
 * Page-safe variant: DB unavailable → { ok: false } so pages can render a
 * proper error/empty state instead of crashing — never demo products.
 */
export async function getCustomerProductsSafe(): Promise<{ ok: boolean; products: Product[] }> {
  try {
    return { ok: true, products: await getCustomerProductsFromDb() };
  } catch (err: any) {
    console.error("[serverCatalog] customer product load failed:", err?.message);
    return { ok: false, products: [] };
  }
}

/** One customer-eligible product by slug (or id) — null when it must not be shown. */
export async function getCustomerProductBySlugFromDb(slug: string): Promise<Product | null> {
  const all = await getCustomerProductsFromDb();
  return all.find((p) => p.slug === slug || p.id === slug) ?? null;
}

export async function getMeta(key: string): Promise<string | null> {
  await ensureReady();
  const conn = await getMysqlPool().getConnection();
  try {
    const [rows] = await conn.execute<any[]>(`SELECT v FROM store_meta WHERE k = ?`, [key]);
    return Array.isArray(rows) && rows[0] ? String(rows[0].v) : null;
  } finally {
    conn.release();
  }
}

export async function setMeta(key: string, value: string): Promise<void> {
  await ensureReady();
  const conn = await getMysqlPool().getConnection();
  try {
    await conn.execute(
      `INSERT INTO store_meta (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)`,
      [key, value]
    );
  } finally {
    conn.release();
  }
}

/**
 * Apply an authenticated admin sync: upsert changed products, soft-delete
 * removed ones (row kept — historical orders stay intact), and mark the
 * store as admin-managed from now on.
 */
export async function syncAdminProducts(
  upserts: AdminProduct[],
  deletes: string[]
): Promise<void> {
  await ensureReady();
  const conn = await getMysqlPool().getConnection();
  try {
    await conn.beginTransaction();
    for (const p of upserts) {
      if (!p || typeof p.id !== "string" || !p.id) continue;
      const grams = Math.max(0, Math.round(Number(p.stockGrams) || 0));
      const status = typeof p.status === "string" ? p.status : "Active";
      const pos = Number.isFinite(Number((p as any).__pos)) ? Number((p as any).__pos) : 0;
      const clean = { ...p } as any;
      delete clean.__pos;
      await conn.execute(
        `INSERT INTO store_products (id, slug, name, status, deleted, stock_grams, pos, data)
         VALUES (?, ?, ?, ?, 0, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           slug = VALUES(slug), name = VALUES(name), status = VALUES(status),
           deleted = 0, stock_grams = VALUES(stock_grams), pos = VALUES(pos), data = VALUES(data)`,
        [clean.id, String(clean.slug ?? clean.id), String(clean.name ?? "Product"), status, grams, pos, JSON.stringify(clean)]
      );
    }
    for (const id of deletes) {
      if (typeof id !== "string" || !id) continue;
      await conn.execute(`UPDATE store_products SET deleted = 1 WHERE id = ?`, [id]);
    }
    await conn.execute(
      `INSERT INTO store_meta (k, v) VALUES (?, '1') ON DUPLICATE KEY UPDATE v = '1'`,
      [META_ADMIN_EVER_SYNCED]
    );
    await conn.commit();
  } catch (err) {
    try {
      await conn.rollback();
    } catch {}
    throw err;
  } finally {
    conn.release();
  }
}

export type PlaceOrderItem = {
  productId: string;
  name?: string;
  /** pack weight in grams */
  grams: number;
  quantity: number;
};

export type PlaceOrderResult =
  | { success: true; products: { id: string; before: number; after: number }[] }
  | { success: false; message: string };

/**
 * BACKEND checkout enforcement — the server is the final gate:
 *  - product must exist, not be deleted, and be customer-visible (never
 *    Hidden/Draft, even if it lingers in an old cart or old URL)
 *  - total wanted weight per product must fit the remaining shared stock
 * All checks pass → stock is deducted atomically (row locks, single
 * transaction). Any failure → nothing changes and a clear message returns.
 */
export async function placeOrderStock(items: PlaceOrderItem[]): Promise<PlaceOrderResult> {
  await ensureReady();

  // Total wanted grams per product (variants share ONE physical stock).
  const wanted = new Map<string, { grams: number; name?: string }>();
  for (const it of items) {
    const grams = Math.max(1, Math.round(Number(it.grams) || 0)) * Math.max(1, Math.round(Number(it.quantity) || 0));
    const prev = wanted.get(it.productId);
    wanted.set(it.productId, { grams: (prev?.grams ?? 0) + grams, name: it.name ?? prev?.name });
  }
  if (wanted.size === 0) return { success: false, message: "Your cart is empty." };

  const conn = await getMysqlPool().getConnection();
  try {
    await conn.beginTransaction();

    const updates: { id: string; before: number; after: number; status: string; data: string }[] = [];
    for (const [productId, want] of wanted) {
      const [rows] = await conn.execute<any[]>(
        `SELECT id, name, status, deleted, stock_grams, data
         FROM store_products WHERE id = ? FOR UPDATE`,
        [productId]
      );
      const row = Array.isArray(rows) ? rows[0] : undefined;
      const label = want.name || row?.name || "This product";
      if (!row || row.deleted || !isCustomerVisibleStatus(row.status)) {
        await conn.rollback();
        return { success: false, message: `${label} is no longer available. Please remove it from your basket.` };
      }
      const available = Math.max(0, Number(row.stock_grams) || 0);
      if (row.status === "Out of Stock" || available < want.grams) {
        await conn.rollback();
        return {
          success: false,
          message:
            available > 0 && row.status !== "Out of Stock"
              ? `Only ${formatWeight(available)} of ${label} available — please reduce the quantity.`
              : `${label} is out of stock right now.`,
        };
      }

      const after = available - want.grams;
      let parsed: any = null;
      try {
        parsed = JSON.parse(row.data);
      } catch {}
      let nextStatus: string = row.status;
      if (parsed && Array.isArray(parsed.weights)) {
        const info = productStockInfo({ weights: parsed.weights, stockGrams: after, minStockGrams: parsed.minStockGrams });
        nextStatus = info.allOut ? "Out of Stock" : row.status === "Out of Stock" ? "Active" : row.status;
      }
      if (parsed) {
        parsed.stockGrams = after;
        parsed.currentStock = after;
        parsed.availableStock = after;
        parsed.stock = after;
        parsed.status = nextStatus;
      }
      updates.push({
        id: productId,
        before: available,
        after,
        status: nextStatus,
        data: parsed ? JSON.stringify(parsed) : row.data,
      });
    }

    for (const u of updates) {
      await conn.execute(
        `UPDATE store_products SET stock_grams = ?, status = ?, data = ? WHERE id = ?`,
        [u.after, u.status, u.data, u.id]
      );
    }
    await conn.commit();
    return { success: true, products: updates.map(({ id, before, after }) => ({ id, before, after })) };
  } catch (err) {
    try {
      await conn.rollback();
    } catch {}
    throw err;
  } finally {
    conn.release();
  }
}
