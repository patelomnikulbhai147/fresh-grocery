import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db/index";
import { initAuthTables } from "@/db/initTables";
import {
  isValidIndianMobile,
  generateOtp,
  hashOtp,
  checkResendRateLimit,
  logAuditEvent,
  getClientIp,
  OTP_EXPIRY_MINUTES,
} from "@/lib/auth";

let tablesInitialized = false;

async function ensureTables() {
  if (!tablesInitialized) {
    const result = await initAuthTables();
    if (result.success) tablesInitialized = true;
    else throw new Error(result.error);
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  let body: { mobile?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const mobile = (body.mobile ?? "").replace(/\s/g, "");

  if (!isValidIndianMobile(mobile)) {
    return NextResponse.json(
      { error: "Please enter a valid 10-digit Indian mobile number." },
      { status: 400 }
    );
  }

  try {
    await ensureTables();
  } catch {
    return NextResponse.json(
      { error: "Database not available. Please try again later." },
      { status: 503 }
    );
  }

  let rateLimit;
  try {
    rateLimit = await checkResendRateLimit(mobile);
  } catch {
    return NextResponse.json(
      { error: "Database not available. Please try again later." },
      { status: 503 }
    );
  }

  if (!rateLimit.allowed) {
    await logAuditEvent({ event: "RATE_LIMITED", mobile, ipAddress: ip, userAgent });
    const minutes = Math.ceil(rateLimit.resetInSeconds / 60);
    return NextResponse.json(
      {
        error: `Too many OTP requests. Please wait ${minutes} minute(s) before requesting again.`,
        resetInSeconds: rateLimit.resetInSeconds,
      },
      { status: 429 }
    );
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp, mobile);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const conn = await pool.getConnection().catch(() => null);
  if (!conn) {
    return NextResponse.json(
      { error: "Database not available. Please try again later." },
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
    console.error("[SendOTP] DB error:", err.message);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  } finally {
    conn.release();
  }

  // 🔔 SMS DELIVERY
  // Production: integrate Twilio / MSG91 / Fast2SMS here
  // Development: OTP is printed to server console & returned in response
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║   FLASHKART OTP — DEVELOPMENT MODE   ║`);
  console.log(`║   Mobile  : +91 ${mobile}             ║`);
  console.log(`║   OTP     : ${otp}                     ║`);
  console.log(`║   Expires : ${OTP_EXPIRY_MINUTES} minutes                  ║`);
  console.log(`╚══════════════════════════════════════╝\n`);

  await logAuditEvent({
    event: "OTP_SENT",
    mobile,
    ipAddress: ip,
    userAgent,
    metadata: { remaining: rateLimit.remaining - 1 },
  });

  return NextResponse.json({
    success: true,
    message: "OTP sent successfully",
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    // DEV ONLY — remove in production:
    _devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
  });
}
