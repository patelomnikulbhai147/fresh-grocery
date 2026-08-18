import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, getUserRole } from "@/lib/auth";
import {
  getAdminProductsFromDb,
  getMeta,
  syncAdminProducts,
  META_ADMIN_EVER_SYNCED,
} from "@/lib/serverCatalog";

export const dynamic = "force-dynamic";

/** Strict backend role check — same pattern as /api/admin/stats. */
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

/** Full product list for the admin panel + whether an admin has ever synced. */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const [products, everSynced] = await Promise.all([
      getAdminProductsFromDb(),
      getMeta(META_ADMIN_EVER_SYNCED),
    ]);
    return NextResponse.json(
      { success: true, products, everSynced: everSynced === "1" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[Admin Products API] load failed:", err?.message);
    return NextResponse.json(
      { success: false, message: "Product database unavailable." },
      { status: 503 }
    );
  }
}

/** Push admin changes: { upserts: AdminProduct[], deletes: string[] }. */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  let body: { upserts?: any[]; deletes?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }
  const upserts = Array.isArray(body.upserts) ? body.upserts : [];
  const deletes = Array.isArray(body.deletes) ? body.deletes.filter((d) => typeof d === "string") : [];
  if (upserts.length === 0 && deletes.length === 0) {
    return NextResponse.json({ success: true, applied: 0 });
  }
  try {
    await syncAdminProducts(upserts, deletes);
    return NextResponse.json({ success: true, applied: upserts.length + deletes.length });
  } catch (err: any) {
    console.error("[Admin Products API] sync failed:", err?.message);
    return NextResponse.json(
      { success: false, message: "Could not save product changes to the database." },
      { status: 503 }
    );
  }
}
