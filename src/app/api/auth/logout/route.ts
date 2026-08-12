import { NextRequest, NextResponse } from "next/server";
import { logAuditEvent, getClientIp, verifySessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const sessionToken = req.cookies.get("flashkart_session")?.value;

  // Log the logout event if we can identify the customer
  if (sessionToken) {
    const payload = verifySessionToken(sessionToken);
    if (payload) {
      await logAuditEvent({
        event: "LOGOUT",
        mobile: payload.mobile,
        customerId: payload.sub,
        ipAddress: ip,
        userAgent,
      });
    }
  }

  const response = NextResponse.json({ success: true });

  // Clear all auth cookies
  response.cookies.set("flashkart_session", "", { httpOnly: true, maxAge: 0, path: "/" });
  response.cookies.set("flashkart_reg_token", "", { httpOnly: true, maxAge: 0, path: "/" });

  return response;
}
