import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, getUserRole } from "@/lib/auth";
import { pool } from "@/db/index";

export const dynamic = "force-dynamic";

/**
 * Restore the logged-in customer from the durable server session cookie
 * (flashkart_session, 30 days). The storefront normally reads the login from
 * localStorage, but that can be dropped when the browser closes (privacy
 * settings / storage eviction) while the httpOnly cookie survives. On load the
 * client calls this so the customer stays signed in until they actually log
 * out. Returns { authenticated:false } for guests, expired/invalid sessions,
 * registration tokens, or admin-portal sessions (which aren't customer rows).
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get("flashkart_session")?.value;
  const payload = token ? verifySessionToken(token) : null;
  const noStore = { headers: { "Cache-Control": "no-store" } };

  if (!payload || !payload.sub || payload.sub.startsWith("reg_")) {
    return NextResponse.json({ authenticated: false }, noStore);
  }

  try {
    const conn = await pool.getConnection().catch(() => null);
    if (!conn) return NextResponse.json({ authenticated: false }, noStore);
    try {
      const [rows] = await conn.execute<any[]>(
        `SELECT id, mobile, email, full_name, role, points, wallet_balance, status
         FROM customers WHERE id = ? AND status != 'deleted' LIMIT 1`,
        [payload.sub]
      );
      const c = Array.isArray(rows) ? rows[0] : null;
      if (!c) return NextResponse.json({ authenticated: false }, noStore);

      const role = getUserRole(c.mobile, c.email, c.role);
      // Super Admin's displayed identity is server-authoritative and fixed to "OM".
      const name = role === "SUPER_ADMIN" ? "OM" : (c.full_name ?? "Customer");
      return NextResponse.json(
        {
          authenticated: true,
          user: {
            id: c.id,
            mobile: c.mobile,
            email: c.email ?? null,
            name,
            role,
            points: role === "SUPER_ADMIN" ? 0 : c.points,
            walletBalance: role === "SUPER_ADMIN" ? 0 : c.wallet_balance,
          },
        },
        noStore
      );
    } finally {
      conn.release();
    }
  } catch {
    return NextResponse.json({ authenticated: false }, noStore);
  }
}
