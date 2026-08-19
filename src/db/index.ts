import type { Pool, PoolConnection } from "mysql2/promise";
import { randomUUID } from "crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// ──────────────────────── Cloudflare D1 (primary database) ────────────────────────
// In production (Cloudflare Workers) and in `next dev` (local miniflare proxy,
// see next.config.ts) the D1 binding "DB" is the database. MySQL remains a
// local fallback for environments without the proxy; the in-memory store is
// the last-resort dev fallback.
type D1Like = {
  prepare(sql: string): {
    bind(...values: any[]): {
      all(): Promise<{ results?: any[]; meta?: any }>;
      run(): Promise<{ meta?: { changes?: number; last_row_id?: number } }>;
    };
  };
  batch(stmts: any[]): Promise<{ meta?: { changes?: number } }[]>;
};

export function getD1(): D1Like | null {
  try {
    const { env } = getCloudflareContext();
    return ((env as any)?.DB as D1Like) ?? null;
  } catch {
    return null;
  }
}

/** Which SQL dialect the active database speaks. */
export function dbDialect(): "sqlite" | "mysql" {
  return getD1() ? "sqlite" : "mysql";
}

/** Translate the MySQL-isms used in this codebase to SQLite for D1. */
function toSqlite(sql: string): string {
  return sql
    .replace(/UTC_TIMESTAMP\(\)\s*-\s*INTERVAL\s+(\d+)\s+MINUTE/gi, "datetime('now', '-$1 minutes')")
    .replace(/UTC_TIMESTAMP\(\)/gi, "datetime('now')")
    .replace(/NOW\(\)/gi, "datetime('now')")
    .replace(/UUID\(\)/gi, "lower(hex(randomblob(16)))");
}

function normalizeD1Error(err: any): any {
  if (/UNIQUE constraint failed|Duplicate entry/i.test(err?.message || "")) {
    err.code = "ER_DUP_ENTRY";
  }
  return err;
}

const isWriteSql = (sql: string) => !/^\s*(SELECT|WITH|PRAGMA)/i.test(sql);

async function d1Execute<T = any>(d1: D1Like, sql: string, values: any[]): Promise<[T, any]> {
  const translated = toSqlite(sql);
  const bound = d1.prepare(translated).bind(...values.map((v) => (v === undefined ? null : v)));
  try {
    if (isWriteSql(translated)) {
      const res = await bound.run();
      return [
        { affectedRows: res.meta?.changes ?? 0, insertId: res.meta?.last_row_id } as unknown as T,
        null,
      ];
    }
    const res = await bound.all();
    return [(res.results ?? []) as unknown as T, null];
  } catch (err: any) {
    throw normalizeD1Error(err);
  }
}

// MySQL Pool configuration — DATABASE_URL (mysql://user:pass@host:port/db) wins,
// individual DB_* variables are the fallback.
function parseDatabaseUrl(url?: string) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.protocol.startsWith("mysql")) return null;
    return {
      host: u.hostname || "localhost",
      port: Number(u.port) || 3306,
      user: decodeURIComponent(u.username || "root"),
      password: decodeURIComponent(u.password || ""),
      database: u.pathname.replace(/^\//, "") || "flashkart_db",
    };
  } catch {
    return null;
  }
}

const fromUrl = parseDatabaseUrl(process.env.DATABASE_URL);
const poolConfig = {
  host: fromUrl?.host ?? process.env.DB_HOST ?? "localhost",
  port: fromUrl?.port ?? (Number(process.env.DB_PORT) || 3306),
  user: fromUrl?.user ?? process.env.DB_USER ?? "root",
  password: fromUrl?.password ?? process.env.DB_PASSWORD ?? "",
  database: fromUrl?.database ?? process.env.DB_NAME ?? "flashkart_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 4000,
};

// In-memory tables fallback in development if MySQL is not reachable
const inMemoryStore: Record<string, any[]> = {
  customers: [
    {
      id: "cust-demo-1",
      mobile: "9773271029",
      email: "admin@flashkart.co",
      full_name: "Om Patel",
      role: "SUPER_ADMIN",
      gender: "male",
      date_of_birth: "1998-05-15",
      referral_code: "FLASH-SUPER",
      points: 0,
      wallet_balance: 0,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cust-demo-2",
      mobile: "6352856495",
      email: "kaushik@flashkart.co",
      full_name: "Kaushik Patel",
      role: "ADMIN",
      gender: "male",
      date_of_birth: "1997-08-20",
      referral_code: "FLASH-KAUSHIK",
      points: 250,
      wallet_balance: 200,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  otp_requests: [],
  customer_addresses: [],
  customer_orders: [],
  customer_audit_logs: [],
  whatsapp_subscribers: [],
};

let mysqlPool: Pool | null = null;
let mysqlPoolPromise: Promise<Pool | null> | null = null;
// null = untested, true = reachable, false = down (retried after RETRY_MS)
let mysqlHealthy: boolean | null = null;
let lastFailedAt = 0;
const RETRY_MS = 30_000;

/**
 * Lazily import + create the MySQL pool. This is ONLY reached when Cloudflare
 * D1 is not the active database (bare-Node dev / self-host). The Cloudflare
 * Worker and `next dev` both run against D1, so `mysql2` is never imported
 * there — keeping the heavy Node driver out of the Worker isolate. Loading it
 * eagerly bloated every isolate's memory/startup CPU and contributed to
 * intermittent "Error 1102: Worker exceeded resource limits" (HTTP 503).
 */
async function ensureMysqlPool(): Promise<Pool | null> {
  if (mysqlPool) return mysqlPool;
  if (mysqlPoolPromise) return mysqlPoolPromise;
  mysqlPoolPromise = (async () => {
    try {
      const mysql = (await import("mysql2/promise")).default;
      mysqlPool = mysql.createPool(poolConfig);
      return mysqlPool;
    } catch {
      mysqlPool = null;
      return null;
    }
  })();
  return mysqlPoolPromise;
}

/** Connection-level failures switch us to the in-memory fallback; real SQL errors surface. */
const isConnectionError = (err: any) =>
  ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "EHOSTUNREACH", "PROTOCOL_CONNECTION_LOST", "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR", "ETIMEOUT"].includes(err?.code) ||
  /connect|handshake|pool is closed/i.test(err?.message || "");

export const pool = {
  execute: async <T = any>(sql: string, values: any[] = []): Promise<[T, any]> => {
    // 1st choice: Cloudflare D1 — the production database (and local dev
    // database via the miniflare proxy). SQL errors surface, never masked.
    const d1 = getD1();
    if (d1) {
      return d1Execute<T>(d1, sql, values);
    }

    const shouldTryMysql = mysqlHealthy !== false || Date.now() - lastFailedAt > RETRY_MS;
    if (shouldTryMysql) {
      const mp = await ensureMysqlPool();
      if (mp) {
        try {
          const result = (await mp.execute(sql, values)) as [T, any];
          if (mysqlHealthy !== true) {
            mysqlHealthy = true;
            console.log(`[DB] MySQL connected (${poolConfig.host}:${poolConfig.port}/${poolConfig.database})`);
          }
          return result;
        } catch (err: any) {
          if (isConnectionError(err)) {
            if (mysqlHealthy !== false) {
              console.warn("[DB] MySQL unreachable — using in-memory fallback:", err.message);
            }
            mysqlHealthy = false;
            lastFailedAt = Date.now();
          } else {
            throw err; // genuine SQL error — never mask it with fallback data
          }
        }
      }
    }

    // In-memory query simulation for development
    return handleInMemoryQuery<T>(sql, values);
  },
  getConnection: async () => {
    return {
      execute: async <T = any>(sql: string, values: any[] = []): Promise<[T, any]> => {
        return pool.execute<T>(sql, values);
      },
      release: () => {},
    };
  },
};

function handleInMemoryQuery<T = any>(sql: string, values: any[] = []): [T, any] {
  const upper = sql.trim().toUpperCase();

  const normalizeMobile = (m?: any) => {
    if (!m) return "";
    const str = String(m).replace(/\D/g, "");
    return str.length === 12 && str.startsWith("91") ? str.slice(2) : str.slice(-10);
  };

  // COUNT(*) FROM OTP_REQUESTS
  if (upper.includes("COUNT(*)") && upper.includes("FROM OTP_REQUESTS")) {
    const mobile = normalizeMobile(values[0]);
    const matching = inMemoryStore.otp_requests.filter(
      (o) => normalizeMobile(o.mobile) === mobile
    );
    return [[{ count: matching.length }] as unknown as T, null];
  }

  // SELECT customers WHERE mobile = ?
  if (upper.includes("FROM CUSTOMERS") && upper.includes("WHERE MOBILE =")) {
    const mobile = normalizeMobile(values[0]);
    const found = inMemoryStore.customers.filter(
      (c) => normalizeMobile(c.mobile) === mobile && c.status !== "deleted"
    );
    return [found as unknown as T, null];
  }

  // SELECT customers WHERE id = ?
  if (upper.includes("FROM CUSTOMERS") && upper.includes("WHERE ID =")) {
    const id = values[0];
    const found = inMemoryStore.customers.filter((c) => c.id === String(id));
    return [found as unknown as T, null];
  }

  // INSERT INTO customers — column order is (mobile, email, full_name, ...)
  if (upper.startsWith("INSERT INTO CUSTOMERS")) {
    const newId = randomUUID();
    const cleanMobile = normalizeMobile(values[0]);
    const newCust = {
      id: newId,
      mobile: cleanMobile,
      email: values[1] || null,
      full_name: values[2] || "Customer",
      referral_code: `FLASH-${Math.floor(1000 + Math.random() * 9000)}`,
      points: 100,
      wallet_balance: 50,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryStore.customers.push(newCust);
    return [{ insertId: newId, affectedRows: 1 } as unknown as T, null];
  }

  // INSERT INTO otp_requests
  if (upper.startsWith("INSERT INTO OTP_REQUESTS")) {
    const newId = randomUUID();
    const cleanMobile = normalizeMobile(values[0]);
    inMemoryStore.otp_requests.push({
      id: newId,
      mobile: cleanMobile,
      otp_hash: values[1],
      expires_at: values[2] || new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      attempts: 0,
      verified: 0,
      created_at: new Date().toISOString(),
    });
    return [{ insertId: newId, affectedRows: 1 } as unknown as T, null];
  }

  // SELECT otp_requests
  if (upper.includes("FROM OTP_REQUESTS")) {
    const mobile = normalizeMobile(values[0]);
    const otps = inMemoryStore.otp_requests.filter((o) => normalizeMobile(o.mobile) === mobile);
    // Sort descending by created_at
    otps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return [otps as unknown as T, null];
  }

  // UPDATE otp_requests
  if (upper.startsWith("UPDATE OTP_REQUESTS")) {
    return [{ affectedRows: 1 } as unknown as T, null];
  }

  // INSERT INTO customer_audit_logs
  if (upper.startsWith("INSERT INTO CUSTOMER_AUDIT_LOGS") || upper.startsWith("INSERT INTO AUTH_AUDIT_LOG")) {
    inMemoryStore.customer_audit_logs.push({
      id: randomUUID(),
      data: values,
      created_at: new Date().toISOString(),
    });
    return [{ affectedRows: 1 } as unknown as T, null];
  }

  // WhatsApp subscribers
  if (upper.includes("FROM WHATSAPP_SUBSCRIBERS")) {
    return [inMemoryStore.whatsapp_subscribers as unknown as T, null];
  }

  if (upper.startsWith("INSERT INTO WHATSAPP_SUBSCRIBERS")) {
    inMemoryStore.whatsapp_subscribers.push({
      phone_number: values[0],
      country_code: values[1] || "+91",
      is_subscribed: 1,
    });
    return [{ affectedRows: 1 } as unknown as T, null];
  }

  // CREATE TABLE or generic statements
  return [[] as unknown as T, null];
}

export async function query<T = any>(sql: string, values?: any[]): Promise<T[]> {
  const [rows] = await pool.execute<T[]>(sql, values);
  return rows;
}

export async function getConnection() {
  return pool.getConnection();
}

/**
 * The RAW MySQL pool — no in-memory fallback. Product data must never be
 * answered from the dev fallback store (customers would see wrong products);
 * callers get real rows or a real error to surface as an error state.
 */
export async function getMysqlPool(): Promise<Pool> {
  const mp = await ensureMysqlPool();
  if (!mp) throw new Error("MySQL pool not initialised");
  return mp;
}

// ──────────────────── Catalog/orders database (STRICT — no memory fallback) ────────────────────
// Product and order data must come from a REAL database: Cloudflare D1 in
// production/dev-proxy, raw MySQL otherwise. If neither is reachable the
// caller gets an error to surface as an error state — never fake data.

export type BatchStatement = { sql: string; params?: any[] };

export async function catalogAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const d1 = getD1();
  if (d1) {
    const [rows] = await d1Execute<T[]>(d1, sql, params);
    return Array.isArray(rows) ? rows : [];
  }
  const conn = await (await getMysqlPool()).getConnection();
  try {
    const [rows] = await conn.execute<any>(sql, params);
    return Array.isArray(rows) ? (rows as T[]) : [];
  } finally {
    conn.release();
  }
}

export async function catalogRun(
  sql: string,
  params: any[] = []
): Promise<{ changes: number }> {
  const d1 = getD1();
  if (d1) {
    const [res] = await d1Execute<any>(d1, sql, params);
    return { changes: Number(res?.affectedRows ?? 0) };
  }
  const conn = await (await getMysqlPool()).getConnection();
  try {
    const [res]: any = await conn.execute(sql, params);
    return { changes: Number(res?.affectedRows ?? 0) };
  } finally {
    conn.release();
  }
}

/** Run several write statements atomically (D1 batch / MySQL transaction). */
export async function catalogBatch(stmts: BatchStatement[]): Promise<void> {
  if (stmts.length === 0) return;
  const d1 = getD1();
  if (d1) {
    const prepared = stmts.map((s) =>
      d1.prepare(toSqlite(s.sql)).bind(...(s.params ?? []).map((v: any) => (v === undefined ? null : v)))
    );
    try {
      await d1.batch(prepared);
    } catch (err: any) {
      throw normalizeD1Error(err);
    }
    return;
  }
  const conn = (await (await getMysqlPool()).getConnection()) as PoolConnection;
  try {
    await conn.beginTransaction();
    for (const s of stmts) {
      await conn.execute(s.sql, s.params ?? []);
    }
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
