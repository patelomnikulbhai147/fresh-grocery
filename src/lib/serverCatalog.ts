import { catalogAll, catalogRun, catalogBatch, dbDialect } from "@/db/index";
import { formatWeight } from "@/lib/utils";
import { computeOrderCharges } from "@/lib/fees";
import { isServiceablePincode, serviceableAreasLabel } from "@/lib/serviceability";
import {
  buildInitialAdminProducts,
  isCustomerVisibleStatus,
  productStockInfo,
} from "@/lib/inventory";
import type { AdminProduct, AdminOrder } from "@/store/adminStore";
import type { Product } from "@/data/catalog";

/**
 * SERVER-SIDE PRODUCT + ORDER SOURCE OF TRUTH.
 *
 * The customer website and the Super Admin panel read/write the SAME
 * authoritative data — Cloudflare D1 in production (SQLite dialect), raw
 * MySQL as the local fallback. NEVER browser localStorage, NEVER the static
 * catalog file (that file is only the one-time seed for an empty table),
 * NEVER the in-memory dev store.
 *
 * Visibility rule enforced here (backend, not frontend):
 *   Active               → customer sees it
 *   Active + 0 stock     → customer sees it as OUT OF STOCK (not hidden)
 *   Hidden / Draft       → customer never sees it
 *   deleted flag         → customer never sees it (row kept for history)
 */

const SQLITE_DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS store_products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    deleted INTEGER NOT NULL DEFAULT 0,
    stock_grams INTEGER NOT NULL DEFAULT 0,
    pos INTEGER NOT NULL DEFAULT 0,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_store_products_slug ON store_products (slug)`,
  `CREATE INDEX IF NOT EXISTS idx_store_products_visible ON store_products (deleted, status)`,
  `CREATE TABLE IF NOT EXISTS store_meta (
    k TEXT PRIMARY KEY,
    v TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS store_orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT NULL,
    customer_phone TEXT NULL,
    customer_email TEXT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    stock_restored INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_store_orders_customer ON store_orders (customer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_store_orders_phone ON store_orders (customer_phone)`,
];

const MYSQL_DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS store_products (
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
  )`,
  `CREATE TABLE IF NOT EXISTS store_meta (
    k VARCHAR(64) NOT NULL PRIMARY KEY,
    v TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS store_orders (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    customer_id VARCHAR(64) NULL,
    customer_phone VARCHAR(20) NULL,
    customer_email VARCHAR(255) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending',
    stock_restored TINYINT(1) NOT NULL DEFAULT 0,
    total INT NOT NULL DEFAULT 0,
    data LONGTEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_store_orders_customer (customer_id),
    INDEX idx_store_orders_phone (customer_phone)
  )`,
];

/** Meta flag: set after the first successful admin push. Until then the table
 *  still holds the untouched seed and the admin's browser data wins upward. */
export const META_ADMIN_EVER_SYNCED = "admin_ever_synced";

let readyPromise: Promise<void> | null = null;

async function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const ddl = dbDialect() === "sqlite" ? SQLITE_DDL : MYSQL_DDL;
      for (const stmt of ddl) {
        await catalogRun(stmt);
      }
      const rows = await catalogAll<{ count: number }>(`SELECT COUNT(*) AS count FROM store_products`);
      const count = rows[0] ? Number(rows[0].count) : 0;
      if (count === 0) {
        const seed = buildInitialAdminProducts();
        for (let i = 0; i < seed.length; i++) {
          const p = seed[i];
          await catalogRun(upsertSql(), upsertParams(p, i));
        }
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

function upsertSql(): string {
  if (dbDialect() === "sqlite") {
    return `INSERT INTO store_products (id, slug, name, status, deleted, stock_grams, pos, data)
            VALUES (?, ?, ?, ?, 0, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              slug = excluded.slug, name = excluded.name, status = excluded.status,
              deleted = 0, stock_grams = excluded.stock_grams, pos = excluded.pos, data = excluded.data`;
  }
  return `INSERT INTO store_products (id, slug, name, status, deleted, stock_grams, pos, data)
          VALUES (?, ?, ?, ?, 0, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            slug = VALUES(slug), name = VALUES(name), status = VALUES(status),
            deleted = 0, stock_grams = VALUES(stock_grams), pos = VALUES(pos), data = VALUES(data)`;
}

function upsertParams(p: AdminProduct, pos: number): any[] {
  const grams = Math.max(0, Math.round(Number(p.stockGrams) || 0));
  const status = typeof p.status === "string" ? p.status : "Active";
  const clean = { ...p } as any;
  delete clean.__pos;
  return [clean.id, String(clean.slug ?? clean.id), String(clean.name ?? "Product"), status, grams, pos, JSON.stringify(clean)];
}

function metaUpsertSql(): string {
  return dbDialect() === "sqlite"
    ? `INSERT INTO store_meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v`
    : `INSERT INTO store_meta (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)`;
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
  const rows = await catalogAll(
    `SELECT id, slug, name, status, deleted, stock_grams, pos, data
     FROM store_products WHERE deleted = 0 ORDER BY pos ASC, name ASC`
  );
  return rows.map(rowToProduct).filter((p): p is AdminProduct => p !== null);
}

/**
 * Admin-uploaded photos are stored as data URIs inside the product JSON.
 * Embedding them into pages/API responses made pages weigh megabytes, so all
 * CUSTOMER-facing reads replace them with small, immutable image URLs served
 * by /api/product-image/{id}. The admin panel keeps the raw data URIs (it
 * needs them for editing, and its push must store them back unchanged).
 */
function imageUrl(id: string, idx: number, ver: string): string {
  return `/api/product-image/${encodeURIComponent(id)}?i=${idx}&v=${ver}`;
}

function customerizeImages<T extends AdminProduct>(p: T, updatedAt: any): T {
  const ver = String(new Date(updatedAt ?? 0).getTime() || 0);
  const isData = (s: any) => typeof s === "string" && s.startsWith("data:");
  const gallery = Array.isArray(p.gallery)
    ? p.gallery.map((g: string, i: number) => (isData(g) ? imageUrl(p.id, i, ver) : g))
    : p.gallery;
  return {
    ...p,
    image: isData(p.image) ? imageUrl(p.id, -1, ver) : p.image,
    gallery,
    ogImage: isData((p as any).ogImage) ? imageUrl(p.id, -1, ver) : (p as any).ogImage,
  };
}

/**
 * Customer-eligible products ONLY (backend visibility filter):
 * not deleted, status Active or Out of Stock. A product whose status is
 * "Out of Stock" is forced to 0 grams so no pack size is orderable.
 */
export async function getCustomerProductsFromDb(): Promise<Product[]> {
  await ensureReady();
  const rows = await catalogAll(
    `SELECT id, slug, name, status, deleted, stock_grams, pos, data, updated_at
     FROM store_products
     WHERE deleted = 0 AND status IN ('Active', 'Out of Stock')
     ORDER BY pos ASC, name ASC`
  );
  return rows
    .map((row) => {
      const p = rowToProduct(row);
      return p ? customerizeImages(p, row.updated_at) : null;
    })
    .filter((p): p is AdminProduct => p !== null)
    .map((p) => (p.status === "Out of Stock" ? { ...p, stockGrams: 0, stock: 0 } : p));
}

/** One image (main or gallery index) for /api/product-image — raw stored value. */
export async function getProductImageFromDb(productId: string, idx: number): Promise<string | null> {
  await ensureReady();
  const rows = await catalogAll(
    `SELECT data FROM store_products WHERE id = ? AND deleted = 0`,
    [productId]
  );
  if (!rows[0]) return null;
  try {
    const parsed = JSON.parse(rows[0].data);
    if (idx >= 0 && Array.isArray(parsed.gallery) && parsed.gallery[idx]) {
      return String(parsed.gallery[idx]);
    }
    return parsed.image ? String(parsed.image) : null;
  } catch {
    return null;
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

/**
 * One customer-eligible product by slug (or id) — null when it must not be
 * shown. A single indexed row lookup (uses idx_store_products_slug): loading
 * the whole catalog just to find one product spiked the Worker's CPU/memory
 * and tripped Cloudflare "Error 1102" on product pages.
 */
export async function getCustomerProductBySlugFromDb(slug: string): Promise<Product | null> {
  await ensureReady();
  const rows = await catalogAll(
    `SELECT id, slug, name, status, deleted, stock_grams, pos, data, updated_at
     FROM store_products
     WHERE deleted = 0 AND status IN ('Active', 'Out of Stock') AND (slug = ? OR id = ?)
     ORDER BY pos ASC LIMIT 1`,
    [slug, slug]
  );
  const row = rows[0];
  if (!row) return null;
  const p = rowToProduct(row);
  if (!p) return null;
  const c = customerizeImages(p, row.updated_at);
  return (c.status === "Out of Stock" ? { ...c, stockGrams: 0, stock: 0 } : c) as Product;
}

/**
 * The small related-products set shown on a product page.  Do this filtering
 * in the database instead of loading and parsing every product record (each
 * can contain a large admin-uploaded image) in the Worker just to render four
 * cards.  `category` remains part of the existing product JSON so this needs
 * no schema/data migration.
 */
export async function getCustomerRelatedProductsFromDb(
  category: string | undefined,
  excludeId: string
): Promise<Product[]> {
  if (!category) return [];
  await ensureReady();
  const categorySql =
    dbDialect() === "sqlite"
      ? "json_extract(data, '$.category') = ?"
      : "JSON_UNQUOTE(JSON_EXTRACT(data, '$.category')) = ?";
  const rows = await catalogAll(
    `SELECT id, slug, name, status, deleted, stock_grams, pos, data, updated_at
     FROM store_products
     WHERE deleted = 0
       AND status IN ('Active', 'Out of Stock')
       AND id <> ?
       AND ${categorySql}
     ORDER BY pos ASC, name ASC
     LIMIT 4`,
    [excludeId, category]
  );
  return rows
    .map((row) => {
      const p = rowToProduct(row);
      return p ? customerizeImages(p, row.updated_at) : null;
    })
    .filter((p): p is AdminProduct => p !== null)
    .map((p) => (p.status === "Out of Stock" ? { ...p, stockGrams: 0, stock: 0 } : p));
}

export async function getMeta(key: string): Promise<string | null> {
  await ensureReady();
  const rows = await catalogAll<{ v: string }>(`SELECT v FROM store_meta WHERE k = ?`, [key]);
  return rows[0] ? String(rows[0].v) : null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  await ensureReady();
  await catalogRun(metaUpsertSql(), [key, value]);
}

/**
 * Apply an authenticated admin sync: upsert changed/new products only, and
 * mark the store as admin-managed from now on.
 *
 * IMPORTANT — this function NEVER deletes. The normal (debounced) admin sync
 * used to also soft-delete any product that was "missing" from the client's
 * list, which caused a data-loss bug: a transient client-side list reduction
 * (localStorage quota truncation, a partial load, a filtered view, a store
 * reset, a page reload mid-load) was misread as an intentional deletion and
 * wiped real products from the database. Deletion is now an EXPLICIT-only
 * action — see {@link deleteProductById}, invoked solely by the admin's
 * Delete button. Upserts here are purely additive/updating and can never
 * remove a product.
 */
export async function syncAdminProducts(
  upserts: AdminProduct[]
): Promise<void> {
  await ensureReady();
  const stmts: { sql: string; params: any[] }[] = [];
  for (const p of upserts) {
    if (!p || typeof p.id !== "string" || !p.id) continue;
    const pos = Number.isFinite(Number((p as any).__pos)) ? Number((p as any).__pos) : 0;
    stmts.push({ sql: upsertSql(), params: upsertParams(p, pos) });
  }
  stmts.push({ sql: metaUpsertSql(), params: [META_ADMIN_EVER_SYNCED, "1"] });
  await catalogBatch(stmts);
}

/**
 * Explicitly soft-delete ONE product by id (keeps the row — `deleted = 1` —
 * so historical orders stay intact and the product can be recovered). This is
 * the ONLY path that sets `deleted = 1`, and it is reached only through an
 * authenticated, confirmed admin Delete action. Returns the number of rows
 * affected (0 if the id does not exist).
 */
export async function deleteProductById(id: string): Promise<void> {
  if (typeof id !== "string" || !id) return;
  await ensureReady();
  await catalogRun(`UPDATE store_products SET deleted = 1 WHERE id = ?`, [id]);
}

export type PlaceOrderItem = {
  productId: string;
  name?: string;
  /** pack weight in grams (identifies the variant) */
  grams: number;
  quantity: number;
  /** variant label ("500 g") — helps match the variant when grams collide */
  label?: string;
};

export type PlaceOrderResult =
  | {
      success: true;
      products: { id: string; before: number; after: number }[];
      /** Server-authoritative money breakdown (the payable amount). */
      charges: {
        subtotal: number;
        deliveryFee: number;
        handlingFee: number;
        convenienceFee: number;
        couponDiscount: number;
        mrpSavings: number;
        total: number;
        freeDelivery: boolean;
      };
    }
  | { success: false; message: string };

/** Recompute a product's Active/Out-of-Stock status after its stock changed. */
async function fixProductStatus(productId: string): Promise<void> {
  const rows = await catalogAll(
    `SELECT id, status, stock_grams, data FROM store_products WHERE id = ?`,
    [productId]
  );
  const row = rows[0];
  if (!row) return;
  let parsed: any = null;
  try {
    parsed = JSON.parse(row.data);
  } catch {
    return;
  }
  if (!Array.isArray(parsed?.weights)) return;
  const grams = Math.max(0, Number(row.stock_grams) || 0);
  const info = productStockInfo({ weights: parsed.weights, stockGrams: grams, minStockGrams: parsed.minStockGrams });
  const next = info.allOut
    ? row.status === "Active" ? "Out of Stock" : row.status
    : row.status === "Out of Stock" ? "Active" : row.status;
  parsed.stockGrams = grams;
  parsed.currentStock = grams;
  parsed.availableStock = grams;
  parsed.stock = grams;
  parsed.status = next;
  await catalogRun(`UPDATE store_products SET status = ?, data = ? WHERE id = ?`, [next, JSON.stringify(parsed), productId]);
}

/**
 * BACKEND checkout enforcement — the server is the final gate:
 *  - product must exist, not be deleted, and be customer-visible (never
 *    Hidden/Draft, even if it lingers in an old cart or old URL)
 *  - total wanted weight per product must fit the remaining shared stock
 * Deduction uses conditional UPDATEs (atomic per product on both D1 and
 * MySQL); on any failure the already-deducted products are compensated back
 * and a clear message returns. On success the order (when provided) is
 * stored server-side so the admin panel and My Orders see it everywhere.
 */
export async function placeOrderStock(
  items: PlaceOrderItem[],
  order?: AdminOrder | null
): Promise<PlaceOrderResult> {
  await ensureReady();

  // ── Backend serviceability gate (§9): the pincode must be in a live area.
  // This is the FINAL authority — never trust only the frontend check.
  const pincode =
    (order?.deliveryAddressDetails?.pincode ?? "").toString() ||
    (order?.shippingAddress ?? "").toString().replace(/\D/g, "").slice(-6);
  if (order && pincode && !isServiceablePincode(pincode)) {
    return { success: false, message: `We are currently not providing delivery in pincode ${pincode}. Serviceable areas: ${serviceableAreasLabel()}.` };
  }

  // Total wanted grams per product (variants share ONE physical stock).
  const wanted = new Map<string, { grams: number; name?: string }>();
  for (const it of items) {
    const grams = Math.max(1, Math.round(Number(it.grams) || 0)) * Math.max(1, Math.round(Number(it.quantity) || 0));
    const prev = wanted.get(it.productId);
    wanted.set(it.productId, { grams: (prev?.grams ?? 0) + grams, name: it.name ?? prev?.name });
  }
  if (wanted.size === 0) return { success: false, message: "Your cart is empty." };

  const deducted: { id: string; grams: number }[] = [];
  const results: { id: string; before: number; after: number }[] = [];
  // Server-side product data (name + weights) for authoritative pricing.
  const productData = new Map<string, { name: string; weights: any[] }>();

  const compensate = async () => {
    for (const d of deducted) {
      try {
        await catalogRun(`UPDATE store_products SET stock_grams = stock_grams + ? WHERE id = ?`, [d.grams, d.id]);
      } catch {
        // best-effort compensation; the next admin sync corrects any residue
      }
    }
  };

  for (const [productId, want] of wanted) {
    const rows = await catalogAll(
      `SELECT id, name, status, deleted, stock_grams, data FROM store_products WHERE id = ?`,
      [productId]
    );
    const row = rows[0];
    const label = want.name || row?.name || "This product";
    if (!row || row.deleted || !isCustomerVisibleStatus(row.status)) {
      await compensate();
      return { success: false, message: `${label} is no longer available. Please remove it from your basket.` };
    }
    try {
      const parsed = JSON.parse(row.data);
      productData.set(productId, { name: row.name, weights: Array.isArray(parsed?.weights) ? parsed.weights : [] });
    } catch {
      productData.set(productId, { name: row.name, weights: [] });
    }
    const available = Math.max(0, Number(row.stock_grams) || 0);
    if (row.status === "Out of Stock" || available < want.grams) {
      await compensate();
      return {
        success: false,
        message:
          available > 0 && row.status !== "Out of Stock"
            ? `Only ${formatWeight(available)} of ${label} available — please reduce the quantity.`
            : `${label} is out of stock right now.`,
      };
    }

    // Atomic conditional deduction — if a concurrent order got there first,
    // changes = 0 and this order is rejected (with compensation).
    const res = await catalogRun(
      `UPDATE store_products
       SET stock_grams = stock_grams - ?
       WHERE id = ? AND deleted = 0 AND status IN ('Active', 'Out of Stock') AND stock_grams >= ?`,
      [want.grams, productId, want.grams]
    );
    if (res.changes === 0) {
      await compensate();
      return { success: false, message: `Only ${formatWeight(available)} of ${label} available — please reduce the quantity.` };
    }
    deducted.push({ id: productId, grams: want.grams });
    results.push({ id: productId, before: available, after: available - want.grams });
  }

  // Flip Active/Out-of-Stock status where the deduction crossed the line.
  for (const r of results) {
    await fixProductStatus(r.id);
  }

  // ── SERVER-AUTHORITATIVE PRICING ──
  // Price every line from the DB variant (selling price + MRP), never from the
  // browser. Subtotal drives the fee structure; the server computes the total.
  let subtotal = 0;
  let mrpTotal = 0;
  const pricedItems = items.map((it) => {
    const pd = productData.get(it.productId);
    const grams = Math.max(1, Math.round(Number(it.grams) || 0));
    const qty = Math.max(1, Math.round(Number(it.quantity) || 0));
    const variant = pickVariant(pd?.weights ?? [], grams, it.label);
    const price = Math.max(0, Math.round(Number(variant?.price) || 0));
    const mrp = Math.max(price, Math.round(Number(variant?.mrp) || price));
    subtotal += price * qty;
    mrpTotal += mrp * qty;
    return {
      productId: it.productId,
      name: it.name ?? pd?.name ?? "Product",
      weight: it.label ?? variant?.label ?? `${grams} g`,
      price,
      mrp,
      quantity: qty,
      packGrams: grams,
      totalGrams: grams * qty,
    };
  });

  // Coupon discount is taken from the (browser-validated) order but capped to
  // subtotal; fees are 100% server-computed.
  const couponDiscount = Math.max(0, Math.round(Number(order?.discount) || 0));
  const charges = computeOrderCharges(subtotal, couponDiscount);
  const mrpSavings = Math.max(0, mrpTotal - subtotal);

  // Store the order server-side with the AUTHORITATIVE breakdown.
  if (order && typeof order.id === "string" && order.id) {
    try {
      const authoritative: AdminOrder = {
        ...order,
        items: pricedItems as any,
        subtotal: charges.subtotal,
        discount: charges.couponDiscount,
        deliveryFee: charges.deliveryFee,
        handlingFee: charges.handlingFee,
        convenienceFee: charges.convenienceFee,
        mrpSavings,
        tax: 0,
        total: charges.total,
      };
      await catalogRun(
        `INSERT INTO store_orders (id, customer_id, customer_phone, customer_email, status, stock_restored, total, data)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
        [
          order.id,
          (order as any).customerId ?? null,
          (order as any).customerPhone ?? null,
          (order as any).customerEmail ?? null,
          order.status || "Pending",
          charges.total,
          JSON.stringify(authoritative),
        ]
      );
    } catch (err: any) {
      // The stock deduction succeeded — an order-record hiccup must not
      // reject the purchase. Log loudly instead.
      console.error("[serverCatalog] order record insert failed:", err?.message);
    }
  }

  return {
    success: true,
    products: results,
    charges: {
      subtotal: charges.subtotal,
      deliveryFee: charges.deliveryFee,
      handlingFee: charges.handlingFee,
      convenienceFee: charges.convenienceFee,
      couponDiscount: charges.couponDiscount,
      mrpSavings,
      total: charges.total,
      freeDelivery: charges.freeDelivery,
    },
  };
}

/** Match a cart line to its product variant — by exact grams, then label. */
function pickVariant(weights: any[], grams: number, label?: string): any | null {
  if (!Array.isArray(weights) || weights.length === 0) return null;
  const byGrams = weights.find((w) => Math.round(Number(w.grams) || 0) === grams);
  if (byGrams) return byGrams;
  if (label) {
    const byLabel = weights.find((w) => String(w.label) === label);
    if (byLabel) return byLabel;
  }
  // closest grams as a last resort
  return weights.reduce((best, w) => {
    const d = Math.abs((Number(w.grams) || 0) - grams);
    return !best || d < best.d ? { w, d } : best;
  }, null as any)?.w ?? weights[0];
}

// ──────────────────────── Orders ────────────────────────

const RESTORE_STATUSES = ["Cancelled", "Returned", "Refunded"];

function rowToOrder(row: any): AdminOrder | null {
  try {
    const parsed = JSON.parse(row.data) as AdminOrder;
    parsed.status = row.status;
    return parsed;
  } catch {
    return null;
  }
}

/** All orders (admin view), newest first. */
export async function getAllOrdersFromDb(): Promise<AdminOrder[]> {
  await ensureReady();
  const rows = await catalogAll(
    `SELECT id, status, data FROM store_orders ORDER BY created_at DESC LIMIT 500`
  );
  return rows.map(rowToOrder).filter((o): o is AdminOrder => o !== null);
}

/** Orders belonging to one customer (by account id or delivery phone). */
export async function getCustomerOrdersFromDb(customerId: string | null, mobile: string | null): Promise<AdminOrder[]> {
  await ensureReady();
  const rows = await catalogAll(
    `SELECT id, status, data FROM store_orders
     WHERE (customer_id IS NOT NULL AND customer_id = ?)
        OR (customer_phone IS NOT NULL AND ? != '' AND customer_phone LIKE ?)
     ORDER BY created_at DESC LIMIT 200`,
    [customerId ?? "", mobile ?? "", mobile ? `%${mobile}%` : ""]
  );
  return rows.map(rowToOrder).filter((o): o is AdminOrder => o !== null);
}

/**
 * Update an order's status server-side. Cancelled/Returned/Refunded restores
 * the exact ordered weight back to the shared product stock — exactly once
 * (guarded by the stock_restored flag).
 */
export async function updateOrderStatusInDb(
  orderId: string,
  status: string
): Promise<{ success: boolean; notFound?: boolean }> {
  await ensureReady();
  const rows = await catalogAll(
    `SELECT id, status, stock_restored, data FROM store_orders WHERE id = ?`,
    [orderId]
  );
  const row = rows[0];
  if (!row) return { success: false, notFound: true };

  const shouldRestore = RESTORE_STATUSES.includes(status) && !Number(row.stock_restored);
  await catalogRun(`UPDATE store_orders SET status = ?, stock_restored = ? WHERE id = ?`, [
    status,
    shouldRestore || Number(row.stock_restored) ? 1 : 0,
    orderId,
  ]);

  if (shouldRestore) {
    let parsed: any = null;
    try {
      parsed = JSON.parse(row.data);
    } catch {}
    const perProduct = new Map<string, number>();
    for (const it of parsed?.items ?? []) {
      const grams = Number(it.totalGrams) || (Number(it.packGrams) || 0) * (Number(it.quantity) || 1);
      if (it.productId && grams > 0) {
        perProduct.set(it.productId, (perProduct.get(it.productId) ?? 0) + Math.round(grams));
      }
    }
    for (const [productId, grams] of perProduct) {
      await catalogRun(`UPDATE store_products SET stock_grams = stock_grams + ? WHERE id = ?`, [grams, productId]);
      await fixProductStatus(productId);
    }
  }
  return { success: true };
}

