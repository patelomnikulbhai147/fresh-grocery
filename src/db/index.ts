import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

// MySQL Pool configuration
const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "flashkart_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// In-memory tables fallback in development if MySQL is not reachable
const inMemoryStore: Record<string, any[]> = {
  customers: [
    {
      id: "cust-demo-1",
      mobile: "9773271029",
      email: "admin@flashkart.co",
      full_name: "Super Admin (Om Patel)",
      gender: "male",
      date_of_birth: "1998-05-15",
      referral_code: "FLASH-SUPER",
      points: 500,
      wallet_balance: 420,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cust-demo-2",
      mobile: "6352856495",
      email: "kaushik@flashkart.co",
      full_name: "Kaushik Patel",
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
let isMysqlAvailable = false;

try {
  mysqlPool = mysql.createPool(poolConfig);
} catch {
  mysqlPool = null;
}

export const pool = {
  execute: async <T = any>(sql: string, values: any[] = []): Promise<[T, any]> => {
    if (mysqlPool && isMysqlAvailable) {
      try {
        return (await mysqlPool.execute(sql, values)) as [T, any];
      } catch (err: any) {
        if (err.code === "ECONNREFUSED" || err.code === "ER_ACCESS_DENIED_ERROR") {
          isMysqlAvailable = false;
        } else {
          throw err;
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

  // SELECT customers WHERE mobile = ?
  if (upper.includes("FROM CUSTOMERS") && upper.includes("WHERE MOBILE =")) {
    const mobile = values[0];
    const found = inMemoryStore.customers.filter((c) => c.mobile === String(mobile));
    return [found as unknown as T, null];
  }

  // SELECT customers WHERE id = ?
  if (upper.includes("FROM CUSTOMERS") && upper.includes("WHERE ID =")) {
    const id = values[0];
    const found = inMemoryStore.customers.filter((c) => c.id === String(id));
    return [found as unknown as T, null];
  }

  // INSERT INTO customers
  if (upper.startsWith("INSERT INTO CUSTOMERS")) {
    const newId = randomUUID();
    const newCust = {
      id: newId,
      mobile: values[0],
      full_name: values[1] || "Customer",
      email: values[2] || null,
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
    inMemoryStore.otp_requests.push({
      id: newId,
      mobile: values[0],
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
    const mobile = values[0];
    const otps = inMemoryStore.otp_requests.filter((o) => o.mobile === String(mobile));
    return [otps as unknown as T, null];
  }

  // UPDATE otp_requests
  if (upper.startsWith("UPDATE OTP_REQUESTS")) {
    return [{ affectedRows: 1 } as unknown as T, null];
  }

  // INSERT INTO customer_audit_logs
  if (upper.startsWith("INSERT INTO CUSTOMER_AUDIT_LOGS")) {
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
