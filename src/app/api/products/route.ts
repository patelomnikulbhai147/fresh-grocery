import { NextResponse } from "next/server";
import { getCustomerProductsFromDb } from "@/lib/serverCatalog";

export const dynamic = "force-dynamic";

/**
 * CUSTOMER product API — returns ONLY customer-visible products
 * (backend-filtered: not deleted, status Active or Out of Stock).
 * On failure it returns an error — NEVER a demo/fallback product list.
 */
export async function GET() {
  try {
    const products = await getCustomerProductsFromDb();
    return NextResponse.json(
      { success: true, products },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[Products API] Failed to load products:", err?.message);
    return NextResponse.json(
      { success: false, message: "Unable to load products. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
