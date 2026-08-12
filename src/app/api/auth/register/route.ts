import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db/index";
import {
  isValidIndianMobile,
  logAuditEvent,
  getClientIp,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  // ── Security gate: verify the registration token from the OTP step ──
  const regToken = req.cookies.get("flashkart_reg_token")?.value;
  if (!regToken) {
    return NextResponse.json(
      { error: "Registration session expired. Please verify your OTP again." },
      { status: 401 }
    );
  }

  const tokenPayload = verifySessionToken(regToken);
  if (!tokenPayload || !tokenPayload.sub.startsWith("reg_")) {
    return NextResponse.json(
      { error: "Invalid registration session. Please verify your OTP again." },
      { status: 401 }
    );
  }

  const verifiedMobile = tokenPayload.mobile;

  let body: {
    mobile?: string;
    fullName?: string;
    email?: string;
    gender?: string;
    dateOfBirth?: string;
    referralCode?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const mobile = (body.mobile ?? "").replace(/\s/g, "");

  if (mobile !== verifiedMobile) {
    return NextResponse.json(
      { error: "Mobile number mismatch. Please start the process again." },
      { status: 400 }
    );
  }

  if (!isValidIndianMobile(mobile)) {
    return NextResponse.json({ error: "Invalid mobile number." }, { status: 400 });
  }

  const fullName = (body.fullName ?? "").trim();
  if (!fullName || fullName.length < 2) {
    return NextResponse.json(
      { error: "Full name must be at least 2 characters." },
      { status: 400 }
    );
  }

  const email = body.email?.trim() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const allowedGenders = ["male", "female", "other", "prefer_not_to_say"];
  const gender = body.gender && allowedGenders.includes(body.gender) ? body.gender : null;
  const dateOfBirth = body.dateOfBirth || null;
  const referralCode = body.referralCode?.trim() || null;

  const conn = await pool.getConnection().catch(() => null);
  if (!conn) {
    return NextResponse.json(
      { error: "Database not available. Please try again later." },
      { status: 503 }
    );
  }

  try {
    // Double-check: mobile MUST NOT already exist
    const [existing] = await conn.execute<any[]>(
      `SELECT id FROM customers WHERE mobile = ? LIMIT 1`,
      [mobile]
    );
    if (existing.length > 0) {
      await logAuditEvent({ event: "MOBILE_ALREADY_EXISTS", mobile, ipAddress: ip, userAgent });
      return NextResponse.json(
        { error: "An account with this mobile number already exists. Please log in." },
        { status: 409 }
      );
    }

    // Create the customer record
    await conn.execute(
      `INSERT INTO customers (mobile, email, full_name, gender, date_of_birth, referral_code)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [mobile, email, fullName, gender, dateOfBirth, referralCode]
    );

    // Fetch the newly created record
    const [newRows] = await conn.execute<any[]>(
      `SELECT id, mobile, email, full_name, points, wallet_balance FROM customers WHERE mobile = ? LIMIT 1`,
      [mobile]
    );
    const newCustomer = newRows[0];

    await logAuditEvent({
      event: "REGISTRATION_COMPLETED",
      mobile,
      customerId: newCustomer.id,
      ipAddress: ip,
      userAgent,
      metadata: { fullName, hasEmail: !!email },
    });

    const token = createSessionToken(newCustomer.id, mobile);

    const response = NextResponse.json({
      success: true,
      status: "REGISTERED",
      user: {
        id: newCustomer.id,
        mobile: newCustomer.mobile,
        email: newCustomer.email ?? null,
        name: newCustomer.full_name,
        points: newCustomer.points,
        walletBalance: newCustomer.wallet_balance,
      },
    });

    response.cookies.set("flashkart_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    // Clear temp registration cookie
    response.cookies.set("flashkart_reg_token", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[Register] Error:", err.message);
    // Handle MySQL UNIQUE constraint violation (ER_DUP_ENTRY)
    if (err.code === "ER_DUP_ENTRY") {
      if (err.message.includes("mobile")) {
        return NextResponse.json(
          { error: "An account with this mobile number already exists. Please log in." },
          { status: 409 }
        );
      }
      if (err.message.includes("email")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please use a different email." },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
