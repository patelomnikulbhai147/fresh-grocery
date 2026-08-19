import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db/index";
import {
  normalizeIndianMobile,
  isValidIndianMobile,
  verifyOtpHash,
  logAuditEvent,
  getClientIp,
  createSessionToken,
  getUserRole,
  OTP_MAX_ATTEMPTS,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  let body: { mobile?: string; otp?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, code: "INVALID_BODY", message: "Invalid request format." },
      { status: 400 }
    );
  }

  const rawMobile = body.mobile ?? "";
  const mobile = normalizeIndianMobile(rawMobile);
  const otp = (body.otp ?? "").replace(/\s/g, "");

  if (!isValidIndianMobile(mobile)) {
    return NextResponse.json(
      {
        success: false,
        code: "INVALID_MOBILE",
        message: "Please enter a valid 10-digit Indian mobile number.",
      },
      { status: 400 }
    );
  }
  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json(
      {
        success: false,
        code: "INVALID_OTP",
        message: "Please enter the 6-digit OTP.",
      },
      { status: 400 }
    );
  }

  const conn = await pool.getConnection().catch(() => null);
  if (!conn) {
    return NextResponse.json(
      {
        success: false,
        code: "SERVICE_UNAVAILABLE",
        message: "Service temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }

  try {
    // Find the latest unverified, unexpired OTP for this mobile
    const [otpRows] = await conn.execute<any[]>(
      `SELECT id, otp_hash, expires_at, attempts, verified
       FROM otp_requests
       WHERE mobile = ?
         AND verified = 0
         AND expires_at > UTC_TIMESTAMP()
       ORDER BY created_at DESC
       LIMIT 1`,
      [mobile]
    );

    if (!Array.isArray(otpRows) || otpRows.length === 0) {
      // Check if there's an expired OTP to give a better error message
      const [expiredRows] = await conn.execute<any[]>(
        `SELECT id FROM otp_requests WHERE mobile = ? AND verified = 0 ORDER BY created_at DESC LIMIT 1`,
        [mobile]
      );
      await logAuditEvent({ event: "OTP_EXPIRED", mobile, ipAddress: ip, userAgent });
      if (Array.isArray(expiredRows) && expiredRows.length > 0) {
        return NextResponse.json(
          {
            success: false,
            code: "OTP_EXPIRED",
            error: "Your OTP has expired. Please request a new OTP.",
            message: "Your OTP has expired. Please request a new OTP.",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          code: "OTP_NOT_FOUND",
          error: "No active OTP found. Please request a new OTP.",
          message: "No active OTP found. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    const otpRecord = otpRows[0];

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await logAuditEvent({ event: "OTP_FAILED", mobile, ipAddress: ip, userAgent });
      return NextResponse.json(
        {
          success: false,
          code: "OTP_ATTEMPTS_EXCEEDED",
          error: "Too many failed attempts. Please request a new OTP.",
          message: "Too many failed attempts. Please request a new OTP.",
        },
        { status: 429 }
      );
    }

    const isValid = verifyOtpHash(otp, mobile, otpRecord.otp_hash);

    if (!isValid) {
      await conn.execute(
        `UPDATE otp_requests SET attempts = attempts + 1 WHERE id = ?`,
        [otpRecord.id]
      );
      const remaining = OTP_MAX_ATTEMPTS - (otpRecord.attempts + 1);
      await logAuditEvent({ event: "OTP_FAILED", mobile, ipAddress: ip, userAgent });
      return NextResponse.json(
        {
          success: false,
          code: "OTP_INVALID",
          error: `The OTP you entered is incorrect. ${remaining} attempt(s) remaining.`,
          message: `The OTP you entered is incorrect. ${remaining} attempt(s) remaining.`,
          attemptsRemaining: remaining,
        },
        { status: 400 }
      );
    }

    // ✅ OTP correct — mark as verified
    await conn.execute(
      `UPDATE otp_requests SET verified = 1, attempts = attempts + 1 WHERE id = ?`,
      [otpRecord.id]
    );
    await logAuditEvent({ event: "OTP_VERIFIED", mobile, ipAddress: ip, userAgent });

    // ──────────────────────────────────────────────────────────
    // CRITICAL: Lookup by CANONICAL mobile number
    // ──────────────────────────────────────────────────────────
    const [customerRows] = await conn.execute<any[]>(
      `SELECT id, mobile, email, full_name, role, points, wallet_balance, status
       FROM customers
       WHERE mobile = ? AND status != 'deleted'
       LIMIT 1`,
      [mobile]
    );

    if (Array.isArray(customerRows) && customerRows.length > 0) {
      // ── Existing customer — log in to THEIR account ONLY ──
      const customer = customerRows[0];

      if (customer.status === "suspended") {
        await logAuditEvent({
          event: "LOGIN_FAILED",
          mobile,
          customerId: customer.id,
          ipAddress: ip,
          userAgent,
          metadata: { reason: "Account suspended" },
        });
        return NextResponse.json(
          {
            success: false,
            code: "ACCOUNT_SUSPENDED",
            error: "Your account has been suspended. Please contact support.",
            message: "Your account has been suspended. Please contact support.",
          },
          { status: 403 }
        );
      }

      const role = getUserRole(mobile, customer.email, customer.role);
      const token = createSessionToken(customer.id, mobile, role);

      // The Super Admin's displayed identity is server-authoritative and fixed
      // to "OM" — never a per-browser cached/stored name (which currently reads
      // "kaushik" in the DB). Role itself comes from getUserRole (server-side).
      const displayName =
        role === "SUPER_ADMIN" ? "OM" : (customer.full_name ?? "Customer");

      await logAuditEvent({
        event: "LOGIN_SUCCESS",
        mobile,
        customerId: customer.id,
        ipAddress: ip,
        userAgent,
        metadata: { role },
      });

      const response = NextResponse.json({
        success: true,
        status: "LOGIN",
        user: {
          id: customer.id,
          mobile: customer.mobile,
          email: customer.email ?? null,
          name: displayName,
          role,
          points: role === "SUPER_ADMIN" ? 0 : customer.points,
          walletBalance: role === "SUPER_ADMIN" ? 0 : customer.wallet_balance,
        },
      });

      response.cookies.set("flashkart_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    } else {
      // ── New mobile — show registration form ──
      await logAuditEvent({
        event: "REGISTRATION_STARTED",
        mobile,
        ipAddress: ip,
        userAgent,
      });

      const regToken = createSessionToken(`reg_${mobile}`, mobile);

      const response = NextResponse.json({
        success: true,
        status: "REGISTER",
        message:
          "Welcome! It looks like you're new here. Please complete your profile to create your account.",
      });

      response.cookies.set("flashkart_reg_token", regToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
        path: "/",
      });

      return response;
    }
  } catch (err: any) {
    console.error("[VerifyOTP] Error:", err.message);
    return NextResponse.json(
      {
        success: false,
        code: "SERVICE_UNAVAILABLE",
        error: "An error occurred. Please try again.",
        message: "An error occurred. Please try again.",
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

