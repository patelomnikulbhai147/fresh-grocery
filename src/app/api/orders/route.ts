import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { getCustomerOrdersFromDb } from "@/lib/serverCatalog";

export const dynamic = "force-dynamic";

/** The logged-in customer's own orders (matched by account id or mobile). */
export async function GET(req: NextRequest) {
  const token = req.cookies.get("flashkart_session")?.value;
  const payload = token ? verifySessionToken(token) : null;
  if (!payload) {
    // Soft response (not 401): a browser without a server session simply has
    // no server-side orders — nothing to leak, no console noise on /account.
    return NextResponse.json(
      { success: false, code: "UNAUTHORIZED", orders: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
  try {
    const orders = await getCustomerOrdersFromDb(payload.sub ?? null, payload.mobile ?? null);
    return NextResponse.json(
      { success: true, orders },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[Orders API] load failed:", err?.message);
    return NextResponse.json(
      { success: false, message: "Unable to load orders. Please try again." },
      { status: 503 }
    );
  }
}
