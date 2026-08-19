import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, getUserRole } from "@/lib/auth";
import {
  getAdminProductsFromDb,
  getMeta,
  syncAdminProducts,
  deleteProductById,
  META_ADMIN_EVER_SYNCED,
} from "@/lib/serverCatalog";

/**
 * Hard ceiling on how many products a single explicit-delete request may
 * soft-delete. The admin UI deletes one product at a time (with a
 * confirmation), so this is pure defense-in-depth: it makes a runaway
 * "delete everything" request structurally impossible even if a future bug
 * or a malicious client tried one.
 */
const MAX_EXPLICIT_DELETES = 25;

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

/**
 * Two distinct operations, distinguished by `intent`:
 *
 *  • Normal sync (no `intent`): { upserts: AdminProduct[] } — upsert changed /
 *    new products ONLY. Any `deletes` field is deliberately ignored here: the
 *    debounced admin sync must NEVER delete a product just because it is
 *    momentarily absent from the client list (that was the data-loss bug).
 *
 *  • Explicit delete ({ intent: "delete", id } or { intent: "delete", ids: [] }):
 *    soft-delete specific products. Reached only from the admin's confirmed
 *    Delete button. Capped at MAX_EXPLICIT_DELETES per request.
 */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  let body: { intent?: string; upserts?: any[]; id?: string; ids?: string[]; deletes?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  // ── Explicit, authorized deletion ──
  if (body.intent === "delete") {
    const ids = [
      ...(typeof body.id === "string" ? [body.id] : []),
      ...(Array.isArray(body.ids) ? body.ids : []),
    ].filter((d): d is string => typeof d === "string" && d.length > 0);
    const unique = [...new Set(ids)];
    if (unique.length === 0) {
      return NextResponse.json(
        { success: false, message: "No product id provided for deletion." },
        { status: 400 }
      );
    }
    if (unique.length > MAX_EXPLICIT_DELETES) {
      console.warn(
        `[Admin Products API] rejected delete of ${unique.length} products (cap ${MAX_EXPLICIT_DELETES}).`
      );
      return NextResponse.json(
        { success: false, message: `Refusing to delete more than ${MAX_EXPLICIT_DELETES} products in one request.` },
        { status: 400 }
      );
    }
    try {
      for (const id of unique) await deleteProductById(id);
      return NextResponse.json({ success: true, deleted: unique.length });
    } catch (err: any) {
      console.error("[Admin Products API] delete failed:", err?.message);
      return NextResponse.json(
        { success: false, message: "Could not delete the product." },
        { status: 503 }
      );
    }
  }

  // ── Normal sync: upserts only (deletes intentionally NOT honored here) ──
  const upserts = Array.isArray(body.upserts) ? body.upserts : [];
  if (upserts.length === 0) {
    return NextResponse.json({ success: true, applied: 0 });
  }
  try {
    await syncAdminProducts(upserts);
    return NextResponse.json({ success: true, applied: upserts.length });
  } catch (err: any) {
    console.error("[Admin Products API] sync failed:", err?.message);
    return NextResponse.json(
      { success: false, message: "Could not save product changes to the database." },
      { status: 503 }
    );
  }
}
