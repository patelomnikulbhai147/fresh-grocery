import { NextRequest, NextResponse } from "next/server";
import { placeOrderStock, type PlaceOrderItem } from "@/lib/serverCatalog";

export const dynamic = "force-dynamic";

/**
 * BACKEND checkout gate. Called before an order is confirmed:
 * re-validates every cart line against the authoritative product database
 * (exists / not deleted / customer-visible / enough shared weight stock)
 * and deducts the weight atomically. An inactive product in an old cart —
 * or a hand-crafted request — is rejected here regardless of what the
 * frontend claimed.
 */
export async function POST(req: NextRequest) {
  let body: { items?: PlaceOrderItem[]; order?: any };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request format." },
      { status: 400 }
    );
  }

  const raw = Array.isArray(body.items) ? body.items : [];
  const items: PlaceOrderItem[] = raw
    .filter((i) => i && typeof i.productId === "string" && i.productId)
    .map((i) => ({
      productId: i.productId,
      name: typeof i.name === "string" ? i.name.slice(0, 120) : undefined,
      grams: Number(i.grams) || 0,
      quantity: Number(i.quantity) || 0,
    }))
    .filter((i) => i.grams > 0 && i.quantity > 0);

  if (items.length === 0) {
    return NextResponse.json(
      { success: false, message: "No valid items in the order." },
      { status: 400 }
    );
  }

  try {
    // The full order (when provided) is stored server-side after the stock
    // deduction succeeds — the admin panel and My Orders read it from there.
    const order = body.order && typeof body.order === "object" ? body.order : null;
    const result = await placeOrderStock(items, order);
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (err: any) {
    console.error("[Checkout API] stock placement failed:", err?.message);
    return NextResponse.json(
      { success: false, message: "Could not verify stock right now. Please try again." },
      { status: 503 }
    );
  }
}
