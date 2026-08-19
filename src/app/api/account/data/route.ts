import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { getAccountData, setAccountKind, isAccountKind } from "@/lib/serverAccount";

export const dynamic = "force-dynamic";

/** The authenticated customer's real server id, or null. A registration token
 *  (`reg_…`) is NOT an account yet, so it can neither read nor write data. */
function sessionCustomerId(req: NextRequest): string | null {
  const token = req.cookies.get("flashkart_session")?.value;
  const payload = token ? verifySessionToken(token) : null;
  const id = payload?.sub;
  if (!id || id.startsWith("reg_")) return null;
  return id;
}

/** GET → the logged-in customer's addresses + wishlist + cart (server copy). */
export async function GET(req: NextRequest) {
  const id = sessionCustomerId(req);
  if (!id) {
    // Soft response: a browser without a server session simply has no
    // server-side account data — nothing to leak.
    return NextResponse.json(
      { success: false, code: "UNAUTHORIZED", addresses: [], wishlist: [], cart: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
  try {
    const data = await getAccountData(id);
    return NextResponse.json(
      { success: true, ...data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[account/data GET] failed:", err?.message);
    return NextResponse.json(
      { success: false, message: "Account data unavailable." },
      { status: 503 }
    );
  }
}

/** POST { kind, data } → replace one collection for the logged-in customer. */
export async function POST(req: NextRequest) {
  const id = sessionCustomerId(req);
  if (!id) {
    return NextResponse.json(
      { success: false, code: "UNAUTHORIZED", message: "Login required." },
      { status: 401 }
    );
  }
  let body: { kind?: string; data?: any };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }
  if (!isAccountKind(body.kind) || !Array.isArray(body.data)) {
    return NextResponse.json({ success: false, message: "Invalid payload." }, { status: 400 });
  }
  // Defensive cap — an account's own address/wishlist/cart is small; this
  // blocks a runaway/abusive payload without affecting real usage.
  if (body.data.length > 500) {
    return NextResponse.json({ success: false, message: "Too many items." }, { status: 400 });
  }
  try {
    await setAccountKind(id, body.kind, body.data);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[account/data POST] failed:", err?.message);
    return NextResponse.json(
      { success: false, message: "Could not save account data." },
      { status: 503 }
    );
  }
}
