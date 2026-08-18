import { NextRequest, NextResponse } from "next/server";
import { getProductImageFromDb } from "@/lib/serverCatalog";

export const dynamic = "force-dynamic";

/**
 * Serves admin-uploaded product photos (stored as data URIs in the product
 * database) as real, long-cached image responses. This keeps pages and the
 * product API small — the browser downloads each photo once instead of every
 * page embedding megabytes of base64.
 *
 * /api/product-image/{productId}?i={galleryIndex}&v={version}
 *   i absent or -1 → the product's main image
 *   v              → cache-buster (product's updated_at) — response is immutable
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const iParam = req.nextUrl.searchParams.get("i");
  const idx = iParam === null ? -1 : Number(iParam);

  let dataUri: string | null = null;
  try {
    dataUri = await getProductImageFromDb(id, Number.isFinite(idx) ? idx : -1);
  } catch (err: any) {
    console.error("[Product Image] load failed:", err?.message);
    return new NextResponse("Image unavailable", { status: 503 });
  }
  if (!dataUri) return new NextResponse("Not found", { status: 404 });

  // Stored value may be a normal path (seed images) — redirect to the asset.
  if (!dataUri.startsWith("data:")) {
    return NextResponse.redirect(new URL(dataUri, req.nextUrl.origin), 302);
  }

  const match = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(dataUri);
  if (!match) return new NextResponse("Invalid image", { status: 404 });
  const contentType = match[1] || "image/webp";
  const isBase64 = !!match[2];
  const body = isBase64
    ? Buffer.from(match[3], "base64")
    : Buffer.from(decodeURIComponent(match[3]), "utf8");

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
