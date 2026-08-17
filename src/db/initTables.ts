import { pool } from "./index";

/**
 * Creates all auth/service tables in MySQL if they don't exist yet.
 * Safe to call on every server start — idempotent (also ensures newer
 * columns exist on tables created by older versions of the schema).
 */
export async function initAuthTables(): Promise<{ success: boolean; error?: string }> {
  let connection: any = null;

  try {
    connection = await pool.getConnection();
  } catch (e: any) {
    console.warn("[DB] Cannot connect to database — auth tables not initialized:", e.message);
    return { success: false, error: "Cannot connect to database" };
  }

  try {
    // 1. Customers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
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
      )
    `);

    // Older databases may pre-date the role column — add it if missing
    try {
      await connection.execute(`ALTER TABLE customers ADD COLUMN role VARCHAR(20) NULL AFTER full_name`);
    } catch (e: any) {
      if (!/duplicate column/i.test(e.message)) {
        // Any other error is unexpected but non-fatal for init
      }
    }

    // 2. OTP Requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS otp_requests (
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
      )
    `);

    // 3. Auth Audit Log table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS auth_audit_log (
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
      )
    `);

    // 4. Category Notify Me Requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS category_notify_requests (
        id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        category_slug VARCHAR(100) NOT NULL,
        contact       VARCHAR(255) NOT NULL,
        created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category_notify (category_slug)
      )
    `);

    // 5. Product Notify Me Requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_notify_requests (
        id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        product_name VARCHAR(255) NOT NULL,
        contact      VARCHAR(255) NOT NULL,
        status       ENUM('pending','notified','cancelled') NOT NULL DEFAULT 'pending',
        created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product_notify (product_name)
      )
    `);

    // 6. Order for Tomorrow Requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_tomorrow_requests (
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
      )
    `);

    // 7. WhatsApp Subscribers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS whatsapp_subscribers (
        id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        phone_number    VARCHAR(15) NOT NULL,
        country_code    VARCHAR(6) NOT NULL DEFAULT '+91',
        is_subscribed   TINYINT NOT NULL DEFAULT 1,
        source          VARCHAR(50) NOT NULL DEFAULT 'homepage_hot_deals',
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_notif_sent DATETIME NULL,
        UNIQUE KEY uniq_phone (phone_number, country_code)
      )
    `);

    console.log("[DB] MySQL database tables initialized successfully");
    return { success: true };
  } catch (error: any) {
    console.error("[DB] Failed to initialize tables:", error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}
