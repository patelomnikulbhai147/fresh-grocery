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
 * Results are biased to FlashKart's service area (Gandhinagar + Ahmedabad) so a
 * query like "Sector 21" resolves to Gandhinagar, not Delhi/Gurgaon. If nothing
 * matches locally we fall back to a countrywide (still region-biased) search so
 * out-of-area queries are not worse than before.
 *
 * GET /api/geo/search?q=Sector%2021%20Gandhinagar
 */
const NOMINATIM = "https://nominatim.openstreetmap.org";
const UA = "FlashKart/1.0 (https://flashkart.co; grocery delivery address picker)";
// Bounding box around the service area (lon1,lat1,lon2,lat2) — Gandhinagar,
// Ahmedabad and the surrounding talukas.
const VIEWBOX = "72.20,23.80,73.15,22.60";

async function nominatimSearch(q: string, bounded: boolean) {
  const url =
    `${NOMINATIM}/search?format=jsonv2&addressdetails=1&countrycodes=in&limit=8` +
    `&viewbox=${VIEWBOX}${bounded ? "&bounded=1" : ""}&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json", "Accept-Language": "en" },
  });
  if (!r.ok) throw new Error(`nominatim ${r.status}`);
  const arr = (await r.json()) as any[];
  return (arr || [])
    .map((x) => ({ label: x.display_name as string, lat: Number(x.lat), lng: Number(x.lon) }))
    .filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lng));
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 3) {
    return NextResponse.json({ success: true, results: [] });
  }
  try {
    // 1) Restrict to the service area first — local results win.
    let results = await nominatimSearch(q, true);
    // 2) Nothing local? Retry countrywide (still viewbox-biased) so sparse or
    //    out-of-area queries still return something rather than nothing.
    if (results.length === 0) {
      results = await nominatimSearch(q, false);
    }
    return NextResponse.json(
      { success: true, results },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  } catch (err: any) {
    console.error("[Geo Search] failed:", err?.message);
    return NextResponse.json(
      { success: false, results: [], message: "Search failed. Please try again." },
      { status: 502 }
    );
  }
}
