import { catalogAll, catalogRun, dbDialect } from "@/db/index";

/**
 * SERVER-SIDE PER-CUSTOMER DATA (addresses / wishlist / cart).
 *
 * These used to live ONLY in each browser's localStorage, so the same customer
 * logged in on two devices saw different data — it looked like two different
 * accounts. They now live in the production database, keyed by the customer's
 * real server id, so the account follows the identity across every device.
 *
 * One narrow table stores a JSON array per (customer_id, kind). It never holds
 * identity — that stays in `customers` (mobile UNIQUE). The customer id comes
 * from the authenticated session (JWT `sub`), never from the browser.
 */

const KINDS = ["addresses", "wishlist", "cart"] as const;
export type AccountKind = (typeof KINDS)[number];
export function isAccountKind(k: any): k is AccountKind {
  return typeof k === "string" && (KINDS as readonly string[]).includes(k);
}

let ready: Promise<void> | null = null;
async function ensureAccountReady(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const ddl =
        dbDialect() === "sqlite"
          ? `CREATE TABLE IF NOT EXISTS customer_data (
               customer_id TEXT NOT NULL,
               kind        TEXT NOT NULL,
               data        TEXT NOT NULL,
               updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
               PRIMARY KEY (customer_id, kind)
             )`
          : `CREATE TABLE IF NOT EXISTS customer_data (
               customer_id VARCHAR(64) NOT NULL,
               kind        VARCHAR(24) NOT NULL,
               data        LONGTEXT NOT NULL,
               updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
               PRIMARY KEY (customer_id, kind)
             )`;
      await catalogRun(ddl);
    })();
    // A failed init (DB briefly down) retries on the next request.
    ready.catch(() => {
      ready = null;
    });
  }
  return ready;
}

export type AccountData = { addresses: any[]; wishlist: any[]; cart: any[] };

/** All three collections for one customer (empty arrays when nothing stored). */
export async function getAccountData(customerId: string): Promise<AccountData> {
  await ensureAccountReady();
  const rows = await catalogAll<{ kind: string; data: string }>(
    `SELECT kind, data FROM customer_data WHERE customer_id = ?`,
    [customerId]
  );
  const out: AccountData = { addresses: [], wishlist: [], cart: [] };
  for (const r of rows) {
    if (!isAccountKind(r.kind)) continue;
    try {
      const v = JSON.parse(r.data);
      if (Array.isArray(v)) out[r.kind] = v;
    } catch {
      /* skip corrupt row — never fabricate data */
    }
  }
  return out;
}

/** Replace one collection for one customer (upsert). */
export async function setAccountKind(
  customerId: string,
  kind: AccountKind,
  data: any[]
): Promise<void> {
  await ensureAccountReady();
  const json = JSON.stringify(Array.isArray(data) ? data : []);
  const sql =
    dbDialect() === "sqlite"
      ? `INSERT INTO customer_data (customer_id, kind, data, updated_at)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(customer_id, kind) DO UPDATE SET data = excluded.data, updated_at = datetime('now')`
      : `INSERT INTO customer_data (customer_id, kind, data)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE data = VALUES(data)`;
  await catalogRun(sql, [customerId, kind, json]);
}
