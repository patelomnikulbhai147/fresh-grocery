import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db/index";
import { initAuthTables } from "@/db/initTables";
import {
  normalizeIndianMobile,
  isValidIndianMobile,
  hashOtp,
  checkResendRateLimit,
  logAuditEvent,
  getClientIp,
  OTP_EXPIRY_MINUTES,
  OTPService,
} from "@/lib/auth";

let tablesInitialized = false;

async function ensureTables() {
  if (!tablesInitialized) {
    try {
      const result = await initAuthTables();
      if (result.success) tablesInitialized = true;
    } catch (e: any) {
      console.warn("[SendOTP] Warning initializing tables:", e.message);
    }
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  let body: { mobile?: string };
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

  await ensureTables();

  let rateLimit;
  try {
    rateLimit = await checkResendRateLimit(mobile);
  } catch (err: any) {
    console.error("[SendOTP] Rate limit check error:", err.message);
    rateLimit = { allowed: true, remaining: 3, resetInSeconds: 0 };
  }

  if (!rateLimit.allowed) {
    await logAuditEvent({ event: "RATE_LIMITED", mobile, ipAddress: ip, userAgent });
    const minutes = Math.ceil(rateLimit.resetInSeconds / 60);
    return NextResponse.json(
      {
        success: false,
        code: "OTP_RATE_LIMITED",
        message: `Too many OTP requests. Please wait ${minutes} minute(s) before requesting again.`,
        resetInSeconds: rateLimit.resetInSeconds,
      },
      { status: 429 }
    );
  }

  const otp = OTPService.generateOTP();
  const otpHash = hashOtp(otp, mobile);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

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
    await conn.execute(
      `INSERT INTO otp_requests (mobile, otp_hash, expires_at, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [mobile, otpHash, expiresAt, ip, userAgent]
    );
  } catch (err: any) {
    console.error("[SendOTP] DB insert error:", err.message);
    return NextResponse.json(
      {
        success: false,
        code: "SERVICE_UNAVAILABLE",
        message: "Service temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }

  // Deliver OTP via OTPService
  const sendResult = await OTPService.sendOTP({ mobile, otp });
  if (!sendResult.success) {
    return NextResponse.json(
      {
        success: false,
        code: "OTP_SEND_FAILED",
        message: "Unable to send OTP. Please try again.",
      },
      { status: 500 }
    );
  }

  await logAuditEvent({
    event: "OTP_SENT",
    mobile,
    ipAddress: ip,
    userAgent,
    metadata: { remaining: rateLimit.remaining - 1, provider: sendResult.provider },
  });

  // Demo OTP visibility (testing only): SHOW_DEMO_OTP=true/false in .env is the
  // explicit switch; when unset it defaults to ON in development and OFF in
  // production, so going live with a real SMS provider hides it automatically.
  const showDemoOtp =
    process.env.SHOW_DEMO_OTP !== undefined
      ? process.env.SHOW_DEMO_OTP === "true"
      : process.env.NODE_ENV === "development";

  return NextResponse.json({
    success: true,
    message: "OTP sent successfully",
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    _devOtp: showDemoOtp ? otp : undefined,
  });
}

