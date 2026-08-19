import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side geocoding SEARCH proxy (OpenStreetMap / Nominatim).
 *
 * The browser cannot set a User-Agent, which Nominatim's usage policy requires —
 * so calling it directly from the client gets throttled/blocked and returns
 * nothing. Proxying here lets us send a compliant User-Agent, keep requests
 * controlled, and centralise error handling. Free — no API key, no billing.
 *
 * GET /api/geo/search?q=Sector%2021%20Gandhinagar
 */
const NOMINATIM = "https://nominatim.openstreetmap.org";
const UA = "FlashKart/1.0 (https://flashkart.co; grocery delivery address picker)";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 3) {
    return NextResponse.json({ success: true, results: [] });
  }
  try {
    const url = `${NOMINATIM}/search?format=jsonv2&addressdetails=1&countrycodes=in&limit=6&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json", "Accept-Language": "en" } });
    if (!r.ok) {
      return NextResponse.json({ success: false, results: [], message: "Search service unavailable." }, { status: 502 });
    }
    const arr = (await r.json()) as any[];
    const results = (arr || []).map((x) => ({
      label: x.display_name as string,
      lat: Number(x.lat),
      lng: Number(x.lon),
    })).filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lng));
    return NextResponse.json(
      { success: true, results },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  } catch (err: any) {
    console.error("[Geo Search] failed:", err?.message);
    return NextResponse.json({ success: false, results: [], message: "Search failed. Please try again." }, { status: 502 });
  }
}
