import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side geocoding SEARCH proxy.
 *
 * The browser cannot set a User-Agent, which Nominatim's usage policy requires —
 * so calling it directly from the client gets throttled/blocked and returns
 * nothing. Proxying here lets us send a compliant User-Agent, keep requests
 * controlled, and centralise error handling.
 *
 * Indian society/apartment names (e.g. "Yogi Parisar") are often missing from
 * OpenStreetMap entirely, so a single Nominatim lookup fails far too often.
 * This route runs a layered pipeline and returns the first layer that finds
 * anything:
 *
 *   1. Google Places Text Search — only when GOOGLE_MAPS_API_KEY is set.
 *      Best society-level coverage in India; skipped silently without a key.
 *   2. Nominatim, bounded to the service area (Gandhinagar + Ahmedabad).
 *   3. Photon (OSM-based, typo-tolerant fuzzy search), bounded the same way.
 *   4. Nominatim countrywide (still viewbox-biased).
 *   5. Photon countrywide (filtered to India).
 *   6. Query relaxation: drop leading words one at a time ("yogi parisar
 *      sector 6" → "sector 6") so the area still resolves when the society
 *      itself is not in the map data.
 *
 * GET /api/geo/search?q=Sector%2021%20Gandhinagar
 */
const NOMINATIM = "https://nominatim.openstreetmap.org";
const PHOTON = "https://photon.komoot.io";
const UA = "FlashKart/1.0 (https://flashkart.co; grocery delivery address picker)";
// Service area (Gandhinagar, Ahmedabad and surrounding talukas).
const VIEWBOX = "72.20,23.80,73.15,22.60"; // Nominatim: lon1,lat1,lon2,lat2
const PHOTON_BBOX = "72.20,22.60,73.15,23.80"; // Photon: minLon,minLat,maxLon,maxLat
const BIAS = { lat: 23.2156, lng: 72.6369 }; // Gandhinagar centre

type Hit = { label: string; lat: number; lng: number };

const finite = (h: Hit) => Number.isFinite(h.lat) && Number.isFinite(h.lng);

async function nominatimSearch(q: string, bounded: boolean): Promise<Hit[]> {
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
    .filter(finite);
}

async function photonSearch(q: string, bounded: boolean): Promise<Hit[]> {
  const url =
    `${PHOTON}/api?q=${encodeURIComponent(q)}&limit=8&lang=en` +
    `&lat=${BIAS.lat}&lon=${BIAS.lng}` +
    (bounded ? `&bbox=${PHOTON_BBOX}` : "");
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!r.ok) throw new Error(`photon ${r.status}`);
  const d = (await r.json()) as any;
  return ((d?.features || []) as any[])
    .filter((f) => f?.properties?.countrycode === "IN")
    .map((f) => {
      const p = f.properties || {};
      const parts = [p.name, p.street, p.district, p.city, p.county, p.state, p.postcode]
        .filter(Boolean)
        // drop consecutive duplicates like district === city
        .filter((v, i, a) => a.indexOf(v) === i);
      return {
        label: parts.join(", "),
        lat: Number(f?.geometry?.coordinates?.[1]),
        lng: Number(f?.geometry?.coordinates?.[0]),
      };
    })
    .filter((h) => h.label && finite(h));
}

/** Society-level coverage — only used when a Google Maps API key is configured. */
async function googleSearch(q: string, key: string): Promise<Hit[]> {
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
    },
    body: JSON.stringify({
      textQuery: q,
      regionCode: "IN",
      locationBias: {
        circle: { center: { latitude: BIAS.lat, longitude: BIAS.lng }, radius: 50000 },
      },
      pageSize: 8,
    }),
  });
  if (!r.ok) throw new Error(`google places ${r.status}`);
  const d = (await r.json()) as any;
  return ((d?.places || []) as any[])
    .map((p) => {
      const name = p?.displayName?.text as string | undefined;
      const addr = (p?.formattedAddress as string) || "";
      const label = name && !addr.toLowerCase().includes(name.toLowerCase()) ? `${name}, ${addr}` : addr || name || "";
      return { label, lat: Number(p?.location?.latitude), lng: Number(p?.location?.longitude) };
    })
    .filter((h) => h.label && finite(h));
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 3) {
    return NextResponse.json({ success: true, results: [] });
  }

  const googleKey = process.env.GOOGLE_MAPS_API_KEY || "";
  const strategies: Array<() => Promise<Hit[]>> = [];
  if (googleKey) strategies.push(() => googleSearch(q, googleKey));
  strategies.push(
    () => nominatimSearch(q, true),
    () => photonSearch(q, true),
    () => nominatimSearch(q, false),
    () => photonSearch(q, false)
  );
  // Relaxation: peel leading words (most specific first in Indian addresses) so
  // "yogi parisar sector 6" still lands on "sector 6" when the society is
  // missing from the map data. Cap at 2 extra lookups to stay within
  // Nominatim's rate limits.
  const tokens = q.split(/[\s,]+/).filter(Boolean);
  for (let i = 1; i < Math.min(tokens.length, 3); i++) {
    const sub = tokens.slice(i).join(" ");
    if (sub.length >= 3) strategies.push(() => nominatimSearch(sub, true));
  }

  let anySucceeded = false;
  for (const run of strategies) {
    try {
      const results = await run();
      anySucceeded = true;
      if (results.length > 0) {
        return NextResponse.json(
          { success: true, results },
          { headers: { "Cache-Control": "public, max-age=300" } }
        );
      }
    } catch (err: any) {
      console.error("[Geo Search] layer failed:", err?.message);
    }
  }

  if (anySucceeded) {
    // Every provider answered; the place genuinely isn't in the map data.
    return NextResponse.json(
      { success: true, results: [] },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  }
  return NextResponse.json(
    { success: false, results: [], message: "Search failed. Please try again." },
    { status: 502 }
  );
}
