import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side REVERSE-geocoding proxy (OpenStreetMap / Nominatim) — coordinates
 * → structured address. Same rationale as the search proxy: a compliant
 * User-Agent and controlled, centralised requests. Free — no API key.
 *
 * GET /api/geo/reverse?lat=23.21&lng=72.63
 */
const NOMINATIM = "https://nominatim.openstreetmap.org";
const UA = "FlashKart/1.0 (https://flashkart.co; grocery delivery address picker)";

function mapAddress(a: any) {
  a = a || {};
  return {
    street: a.road || a.pedestrian || a.footway || undefined,
    area: a.suburb || a.neighbourhood || a.quarter || a.village || a.hamlet || undefined,
    city: a.city || a.town || a.municipality || a.county || undefined,
    state: a.state || undefined,
    pincode: a.postcode || undefined,
  };
}

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ success: false, message: "Valid lat and lng are required." }, { status: 400 });
  }
  try {
    const url = `${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`;
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json", "Accept-Language": "en" } });
    if (!r.ok) {
      // Still return the coordinates so the caller can save the pin.
      return NextResponse.json({ success: true, result: { lat, lng } });
    }
    const d = (await r.json()) as any;
    return NextResponse.json(
      { success: true, result: { ...mapAddress(d.address), formatted: d.display_name, lat, lng } },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  } catch (err: any) {
    console.error("[Geo Reverse] failed:", err?.message);
    return NextResponse.json({ success: true, result: { lat, lng } });
  }
}
