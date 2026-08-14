import { createHash, randomInt } from "crypto";
import { pool } from "@/db/index";

// ──────────────────────── Constants ────────────────────────
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_LIMIT = 3; // per 10 minutes per mobile
export const OTP_RESEND_WINDOW_MINUTES = 10;

// ──────────────────────── Indian Mobile Normalization ────────────────────────
/**
 * Normalizes Indian mobile number inputs to canonical 10-digit format (e.g. "9773271029").
 * Handles inputs like "+91 9773271029", "919773271029", "09773271029", "9773271029".
 */
export function normalizeIndianMobile(input: string): string {
  if (!input) return "";
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Returns formatted E.164 mobile number "+91XXXXXXXXXX"
 */
export function formatE164Mobile(mobile10: string): string {
  const clean = normalizeIndianMobile(mobile10);
  return clean ? `+91${clean}` : "";
}

/**
 * Validates whether string is a valid 10-digit Indian mobile number starting with 6-9
 */
export function isValidIndianMobile(input: string): boolean {
  const normalized = normalizeIndianMobile(input);
  return /^[6-9]\d{9}$/.test(normalized);
}

// ──────────────────────── OTP Generation & Hashing ────────────────────────
export function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

export function hashOtp(otp: string, mobile: string): string {
  const norm = normalizeIndianMobile(mobile);
  return createHash("sha256")
    .update(`${otp}:${norm}:flashkart-otp-secret`)
    .digest("hex");
}

export function verifyOtpHash(otp: string, mobile: string, storedHash: string): boolean {
  const computed = hashOtp(otp, mobile);
  if (!storedHash || computed.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return diff === 0;
}

// ──────────────────────── OTP Service Abstraction ────────────────────────
export class OTPService {
  static normalizeMobileNumber(input: string): string {
    return normalizeIndianMobile(input);
  }

  static generateOTP(): string {
    return generateOtp();
  }

  static async sendOTP(params: {
    mobile: string;
    otp: string;
  }): Promise<{ success: boolean; provider?: string; error?: string }> {
    const canonicalMobile = normalizeIndianMobile(params.mobile);
    const formatted = formatE164Mobile(canonicalMobile);
    const message = `Your FlashKart verification OTP is ${params.otp}. This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.`;

    // 1. If SMS Provider credentials are configured in ENV, send via SMS API
    const provider = process.env.OTP_PROVIDER?.toLowerCase() || "development";
    const apiKey = process.env.OTP_API_KEY || process.env.MSG91_AUTH_KEY || process.env.FAST2SMS_API_KEY;

    if (apiKey && provider !== "development") {
      try {
        if (provider === "msg91") {
          const res = await fetch("https://api.msg91.com/api/v5/otp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authkey: apiKey,
            },
            body: JSON.stringify({
              template_id: process.env.OTP_TEMPLATE_ID,
              mobile: `91${canonicalMobile}`,
              otp: params.otp,
            }),
          });
          if (!res.ok) throw new Error(`MSG91 returned status ${res.status}`);
          return { success: true, provider: "msg91" };
        }

        if (provider === "fast2sms") {
          const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            method: "POST",
            headers: {
              authorization: apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              route: "otp",
              variables_values: params.otp,
              numbers: canonicalMobile,
            }),
          });
          if (!res.ok) throw new Error(`Fast2SMS returned status ${res.status}`);
          return { success: true, provider: "fast2sms" };
        }
      } catch (err: any) {
        console.error(`[OTPService] Failed to send via ${provider}:`, err.message);
        // Fallback to dev log on error in dev mode
      }
    }

    // Dev/Fallback Mode: Log securely to server console
    console.log(`\n╔═════════════════════════════════════════════════════════╗`);
    console.log(`║          FLASHKART OTP SERVICE — DEV MODE               ║`);
    console.log(`║   Mobile Number  : ${formatted.padEnd(35, " ")}  ║`);
    console.log(`║   Verification   : ${params.otp.padEnd(35, " ")}  ║`);
    console.log(`║   Message        : ${message.padEnd(35, " ")}  ║`);
    console.log(`║   Expires In     : ${OTP_EXPIRY_MINUTES} minutes                             ║`);
    console.log(`╚═════════════════════════════════════════════════════════╝\n`);

    return { success: true, provider: "console_dev" };
  }
}

// ──────────────────────── Rate Limiting ────────────────────────
export async function checkResendRateLimit(mobile: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}> {
  const normMobile = normalizeIndianMobile(mobile);
  const conn = await pool.getConnection();

  try {
    const [rows] = await conn.execute<any[]>(
      `SELECT COUNT(*) as count FROM otp_requests 
       WHERE mobile = ? AND created_at >= UTC_TIMESTAMP() - INTERVAL ${OTP_RESEND_WINDOW_MINUTES} MINUTE`,
      [normMobile]
    );

    let count = 0;
    if (Array.isArray(rows) && rows.length > 0) {
      if (rows[0] && typeof rows[0].count !== "undefined") {
        count = parseInt(rows[0].count, 10) || 0;
      } else {
        // Fallback array result from in-memory store
        count = rows.filter((r) => r.mobile === normMobile).length;
      }
    }

    const remaining = Math.max(0, OTP_RESEND_LIMIT - count);
    const allowed = count < OTP_RESEND_LIMIT;

    let resetInSeconds = OTP_RESEND_WINDOW_MINUTES * 60;
    if (!allowed) {
      const [oldest] = await conn.execute<any[]>(
        `SELECT created_at FROM otp_requests 
         WHERE mobile = ? AND created_at >= UTC_TIMESTAMP() - INTERVAL ${OTP_RESEND_WINDOW_MINUTES} MINUTE
         ORDER BY created_at ASC LIMIT 1`,
        [normMobile]
      );
      if (Array.isArray(oldest) && oldest.length > 0 && oldest[0].created_at) {
        const oldestTime = new Date(oldest[0].created_at).getTime();
        const windowEndTime = oldestTime + OTP_RESEND_WINDOW_MINUTES * 60 * 1000;
        resetInSeconds = Math.max(1, Math.ceil((windowEndTime - Date.now()) / 1000));
      }
    }

    return { allowed, remaining, resetInSeconds };
  } catch (err: any) {
    console.error("[RateLimit] Error checking rate limit:", err.message);
    // Return allowed on rate limit check error so user isn't blocked by rate limit DB check
    return { allowed: true, remaining: OTP_RESEND_LIMIT, resetInSeconds: 0 };
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
    const normMobile = params.mobile ? normalizeIndianMobile(params.mobile) : null;
    await conn.execute(
      `INSERT INTO auth_audit_log (event, mobile, customer_id, ip_address, user_agent, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        params.event,
        normMobile,
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

// ──────────────────────── User Role Helper ────────────────────────
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";

export function getUserRole(mobile: string, email?: string | null, dbRole?: string | null): UserRole {
  if (dbRole === "SUPER_ADMIN" || dbRole === "ADMIN" || dbRole === "CUSTOMER") {
    return dbRole;
  }
  const normMobile = normalizeIndianMobile(mobile);
  if (normMobile === "9773271029" || email === "admin@flashkart.co") {
    return "SUPER_ADMIN";
  }
  if (normMobile === "6352856495" || email === "kaushik@flashkart.co") {
    return "ADMIN";
  }
  return "CUSTOMER";
}

// ──────────────────────── JWT Session ────────────────────────
import { createHmac } from "crypto";

const JWT_SECRET =
  process.env.JWT_SECRET ?? "flashkart-jwt-secret-change-in-production";

export function createSessionToken(customerId: string, mobile: string, role: UserRole = "CUSTOMER"): string {
  const normMobile = normalizeIndianMobile(mobile);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: customerId,
      mobile: normMobile,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    })
  ).toString("base64url");
  const signature = createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

export function verifySessionToken(token: string): { sub: string; mobile: string; role: UserRole } | null {
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
    return { sub: decoded.sub, mobile: decoded.mobile, role: decoded.role ?? "CUSTOMER" };
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
