import { pool, dbDialect } from "./index";

/**
 * Creates all auth/service tables if they don't exist yet — in the SQL
 * dialect of the ACTIVE database: SQLite for Cloudflare D1 (production and
 * `next dev` local proxy), MySQL for the local fallback.
 * Safe to call on every server start — idempotent.
 */

const SQLITE_TABLES: string[] = [
  `CREATE TABLE IF NOT EXISTS customers (
    id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    mobile         TEXT NOT NULL UNIQUE,
    email          TEXT NULL UNIQUE,
    full_name      TEXT NULL,
    role           TEXT NULL,
    gender         TEXT NULL,
    date_of_birth  TEXT NULL,
    referral_code  TEXT NULL,
    points         INTEGER NOT NULL DEFAULT 0,
    wallet_balance INTEGER NOT NULL DEFAULT 0,
    status         TEXT NOT NULL DEFAULT 'active',
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS otp_requests (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    mobile      TEXT NOT NULL,
    otp_hash    TEXT NOT NULL,
    expires_at  TEXT NOT NULL,
    attempts    INTEGER NOT NULL DEFAULT 0,
    verified    INTEGER NOT NULL DEFAULT 0,
    ip_address  TEXT NULL,
    user_agent  TEXT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_otp_mobile ON otp_requests (mobile)`,
  `CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_requests (expires_at)`,
  `CREATE TABLE IF NOT EXISTS auth_audit_log (
    id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    event        TEXT NOT NULL,
    mobile       TEXT NULL,
    customer_id  TEXT NULL,
    ip_address   TEXT NULL,
    user_agent   TEXT NULL,
    metadata     TEXT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_audit_mobile ON auth_audit_log (mobile)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_event ON auth_audit_log (event)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_created ON auth_audit_log (created_at)`,
  `CREATE TABLE IF NOT EXISTS category_notify_requests (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    category_slug TEXT NOT NULL,
    contact       TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS product_notify_requests (
    id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    product_name TEXT NOT NULL,
    contact      TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending',
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS order_tomorrow_requests (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    product_name  TEXT NOT NULL,
    quantity      TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    mobile        TEXT NOT NULL,
    note          TEXT NULL,
    status        TEXT NOT NULL DEFAULT 'pending',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS whatsapp_subscribers (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    phone_number    TEXT NOT NULL,
    country_code    TEXT NOT NULL DEFAULT '+91',
    is_subscribed   INTEGER NOT NULL DEFAULT 1,
    source          TEXT NOT NULL DEFAULT 'homepage_hot_deals',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    last_notif_sent TEXT NULL,
    UNIQUE (phone_number, country_code)
  )`,
];

const MYSQL_TABLES: string[] = [
  `CREATE TABLE IF NOT EXISTS customers (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    mobile        VARCHAR(10) NOT NULL,
    email         VARCHAR(255) NULL,
    full_name     VARCHAR(255) NULL,
    role          VARCHAR(20) NULL,
    gender        ENUM('male','female','other','prefer_not_to_say') NULL,
    date_of_birth DATE NULL,
    referral_code VARCHAR(50) NULL,
    points        INT NOT NULL DEFAULT 0,
    wallet_balance INT NOT NULL DEFAULT 0,
    status        ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY customers_mobile_unique (mobile),
    UNIQUE KEY customers_email_unique (email)
  )`,
  `CREATE TABLE IF NOT EXISTS otp_requests (
    id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    mobile      VARCHAR(10) NOT NULL,
    otp_hash    VARCHAR(255) NOT NULL,
    expires_at  DATETIME NOT NULL,
    attempts    INT NOT NULL DEFAULT 0,
    verified    TINYINT NOT NULL DEFAULT 0,
    ip_address  VARCHAR(64) NULL,
    user_agent  VARCHAR(512) NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_mobile (mobile),
    INDEX idx_otp_expires (expires_at)
  )`,
  `CREATE TABLE IF NOT EXISTS auth_audit_log (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    event        VARCHAR(64) NOT NULL,
    mobile       VARCHAR(10) NULL,
    customer_id  CHAR(36) NULL,
    ip_address   VARCHAR(64) NULL,
    user_agent   VARCHAR(512) NULL,
    metadata     TEXT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_mobile (mobile),
    INDEX idx_audit_customer (customer_id),
    INDEX idx_audit_event (event),
    INDEX idx_audit_created (created_at)
  )`,
  `CREATE TABLE IF NOT EXISTS category_notify_requests (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_slug VARCHAR(100) NOT NULL,
    contact       VARCHAR(255) NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category_notify (category_slug)
  )`,
  `CREATE TABLE IF NOT EXISTS product_notify_requests (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_name VARCHAR(255) NOT NULL,
    contact      VARCHAR(255) NOT NULL,
    status       ENUM('pending','notified','cancelled') NOT NULL DEFAULT 'pending',
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_notify (product_name)
  )`,
  `CREATE TABLE IF NOT EXISTS order_tomorrow_requests (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_name  VARCHAR(255) NOT NULL,
    quantity      VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    mobile        VARCHAR(15) NOT NULL,
    note          TEXT NULL,
    status        ENUM('pending','approved','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_tomorrow_product (product_name),
    INDEX idx_order_tomorrow_mobile (mobile)
  )`,
  `CREATE TABLE IF NOT EXISTS whatsapp_subscribers (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    phone_number    VARCHAR(15) NOT NULL,
    country_code    VARCHAR(6) NOT NULL DEFAULT '+91',
    is_subscribed   TINYINT NOT NULL DEFAULT 1,
    source          VARCHAR(50) NOT NULL DEFAULT 'homepage_hot_deals',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_notif_sent DATETIME NULL,
    UNIQUE KEY uniq_phone (phone_number, country_code)
  )`,
];

export async function initAuthTables(): Promise<{ success: boolean; error?: string }> {
  let connection: any = null;

  try {
    connection = await pool.getConnection();
  } catch (e: any) {
    console.warn("[DB] Cannot connect to database — auth tables not initialized:", e.message);
    return { success: false, error: "Cannot connect to database" };
  }

  try {
    const statements = dbDialect() === "sqlite" ? SQLITE_TABLES : MYSQL_TABLES;
    for (const ddl of statements) {
      await connection.execute(ddl);
    }

    if (dbDialect() === "mysql") {
      // Older MySQL databases may pre-date the role column — add it if missing
      try {
        await connection.execute(`ALTER TABLE customers ADD COLUMN role VARCHAR(20) NULL AFTER full_name`);
      } catch (e: any) {
        if (!/duplicate column/i.test(e.message)) {
          // Any other error is unexpected but non-fatal for init
        }
      }
    }

    console.log(`[DB] Database tables initialized (${dbDialect()})`);
    return { success: true };
  } catch (error: any) {
    console.error("[DB] Failed to initialize tables:", error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}
