import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, getUserRole } from "@/lib/auth";
import { getAllOrdersFromDb, updateOrderStatusInDb } from "@/lib/serverCatalog";

export const dynamic = "force-dynamic";

/** Strict backend role check — same pattern as /api/admin/products. */
function requireAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get("flashkart_session")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, code: "UNAUTHORIZED", error: "Authentication session required." },
      { status: 401 }
    );
  }
  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, code: "UNAUTHORIZED", error: "Invalid or expired session token." },
      { status: 401 }
    );
  }
  const role = payload.role || getUserRole(payload.mobile);
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    return NextResponse.json(
      { success: false, code: "FORBIDDEN", error: "Admin privileges required." },
      { status: 403 }
    );
  }
  return null;
}

/** All customer orders for the admin panel. */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const orders = await getAllOrdersFromDb();
    return NextResponse.json(
      { success: true, orders },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[Admin Orders API] load failed:", err?.message);
    return NextResponse.json(
      { success: false, message: "Order database unavailable." },
      { status: 503 }
    );
  }
}

/** Update one order's status: { id, status }. Cancellation restores stock. */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }
  if (!body.id || typeof body.id !== "string" || !body.status || typeof body.status !== "string") {
    return NextResponse.json({ success: false, message: "id and status are required." }, { status: 400 });
  }
  try {
    const result = await updateOrderStatusInDb(body.id, body.status.slice(0, 32));
    if (result.notFound) {
      // Legacy/demo orders exist only in the admin browser — not an error.
      return NextResponse.json({ success: false, notFound: true });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Admin Orders API] status update failed:", err?.message);
    return NextResponse.json(
      { success: false, message: "Could not update the order." },
      { status: 503 }
    );
  }
}
