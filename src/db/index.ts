import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

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

let mysqlPool: mysql.Pool | null = null;
// null = untested, true = reachable, false = down (retried after RETRY_MS)
let mysqlHealthy: boolean | null = null;
let lastFailedAt = 0;
const RETRY_MS = 30_000;

try {
  mysqlPool = mysql.createPool(poolConfig);
} catch {
  mysqlPool = null;
}

/** Connection-level failures switch us to the in-memory fallback; real SQL errors surface. */
const isConnectionError = (err: any) =>
  ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "EHOSTUNREACH", "PROTOCOL_CONNECTION_LOST", "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR", "ETIMEOUT"].includes(err?.code) ||
  /connect|handshake|pool is closed/i.test(err?.message || "");

export const pool = {
  execute: async <T = any>(sql: string, values: any[] = []): Promise<[T, any]> => {
    const shouldTryMysql =
      mysqlPool && (mysqlHealthy !== false || Date.now() - lastFailedAt > RETRY_MS);
    if (shouldTryMysql) {
      try {
        const result = (await mysqlPool!.execute(sql, values)) as [T, any];
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
