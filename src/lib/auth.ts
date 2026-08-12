import { createHash, randomInt } from "crypto";
import { pool } from "@/db/index";

// ──────────────────────── Constants ────────────────────────
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_LIMIT = 3; // per 10 minutes per mobile
export const OTP_RESEND_WINDOW_MINUTES = 10;

// ──────────────────────── Indian Mobile Validation ────────────────────────
export function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ""));
}

// ──────────────────────── OTP Generation ────────────────────────
export function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

// ──────────────────────── OTP Hashing (SHA-256) ────────────────────────
export function hashOtp(otp: string, mobile: string): string {
  return createHash("sha256")
    .update(`${otp}:${mobile}:flashkart-otp-secret`)
    .digest("hex");
}

export function verifyOtpHash(otp: string, mobile: string, storedHash: string): boolean {
  const computed = hashOtp(otp, mobile);
  if (computed.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return diff === 0;
}

// ──────────────────────── Rate Limiting ────────────────────────
export async function checkResendRateLimit(mobile: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute<any[]>(
      `SELECT COUNT(*) as count FROM otp_requests 
       WHERE mobile = ? AND created_at >= UTC_TIMESTAMP() - INTERVAL ${OTP_RESEND_WINDOW_MINUTES} MINUTE`,
      [mobile]
    );
    const count = parseInt(rows[0].count, 10);
    const remaining = Math.max(0, OTP_RESEND_LIMIT - count);
    const allowed = count < OTP_RESEND_LIMIT;

    let resetInSeconds = OTP_RESEND_WINDOW_MINUTES * 60;
    if (!allowed) {
      const [oldest] = await conn.execute<any[]>(
        `SELECT created_at FROM otp_requests 
         WHERE mobile = ? AND created_at >= UTC_TIMESTAMP() - INTERVAL ${OTP_RESEND_WINDOW_MINUTES} MINUTE
         ORDER BY created_at ASC LIMIT 1`,
        [mobile]
      );
      if (oldest.length > 0) {
        const oldestTime = new Date(oldest[0].created_at).getTime();
        const windowEndTime = oldestTime + OTP_RESEND_WINDOW_MINUTES * 60 * 1000;
        resetInSeconds = Math.ceil((windowEndTime - Date.now()) / 1000);
      }
    }

    return { allowed, remaining, resetInSeconds };
  } finally {
    conn.release();
  }
}

// ──────────────────────── Audit Logging ────────────────────────
export async function logAuditEvent(params: {
  event: string;
  mobile?: string;
  customerId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const conn = await pool.getConnection().catch(() => null);
  if (!conn) return;
  try {
    await conn.execute(
      `INSERT INTO auth_audit_log (event, mobile, customer_id, ip_address, user_agent, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        params.event,
        params.mobile ?? null,
        params.customerId ?? null,
        params.ipAddress ?? null,
        params.userAgent ?? null,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]
    );
  } catch {
    // Audit log failures should never break auth flow
  } finally {
    conn.release();
  }
}

// ──────────────────────── JWT Session ────────────────────────
import { createHmac } from "crypto";

const JWT_SECRET =
  process.env.JWT_SECRET ?? "flashkart-jwt-secret-change-in-production";

export function createSessionToken(customerId: string, mobile: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: customerId,
      mobile,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    })
  ).toString("base64url");
  const signature = createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

export function verifySessionToken(token: string): { sub: string; mobile: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expected = createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");
    if (expected !== signature) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: decoded.sub, mobile: decoded.mobile };
  } catch {
    return null;
  }
}

// ──────────────────────── Get Client IP ────────────────────────
import type { NextRequest } from "next/server";

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
