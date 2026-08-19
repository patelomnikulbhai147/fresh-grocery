import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Resolve a shared Google Maps link (or raw "lat,lng" text) to coordinates.
 *
 * Free map data misses most Indian societies, so the picker offers a
 * workaround that always works: find the place in the Google Maps app,
 * Share → Copy link, paste it here. This endpoint follows the short link
 * server-side (the browser can't, because of CORS) and extracts the pin.
 *
 * Resolution order:
 *   1. Coordinates already present in the pasted URL (?q=lat,lng, /@lat,lng,
 *      !3d..!4d.., ll=, center=, destination=).
 *   2. Follow redirects (maps.app.goo.gl / goo.gl short links) and parse the
 *      final URL the same way.
 *   3. Parse the final page body for an exact pin marker (!3d<lat>!4d<lng>).
 *
 * Only Google-owned hosts are fetched (SSRF guard).
 *
 * GET /api/geo/resolve-link?url=https%3A%2F%2Fmaps.app.goo.gl%2F...
 */
const ALLOWED_HOST =
  /^(maps\.app\.goo\.gl|goo\.gl|g\.co|maps\.google\.[a-z.]{2,10}|(www\.)?google\.[a-z.]{2,10}|consent\.google\.[a-z.]{2,10})$/i;
const UA_BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

type Coords = { lat: number; lng: number };

const valid = (lat: number, lng: number): Coords | null =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat !== 0 || lng !== 0)
    ? { lat, lng }
    : null;

const NUM = "(-?\\d{1,3}(?:\\.\\d+)?)";

/** Pull coordinates out of a Google Maps URL. Pin (!3d!4d) beats viewport (@). */
function coordsFromUrl(u: string): Coords | null {
  const decoded = decodeURIComponent(u.replace(/\+/g, " "));
  const pin = decoded.match(new RegExp(`!3d${NUM}!4d${NUM}`));
  if (pin) { const c = valid(Number(pin[1]), Number(pin[2])); if (c) return c; }
  const qp = decoded.match(new RegExp(`[?&](?:q|ll|query|center|destination|daddr|saddr)=${NUM}\\s*,\\s*${NUM}`, "i"));
  if (qp) { const c = valid(Number(qp[1]), Number(qp[2])); if (c) return c; }
  const at = decoded.match(new RegExp(`/@${NUM},${NUM}`));
  if (at) { const c = valid(Number(at[1]), Number(at[2])); if (c) return c; }
  return null;
}

/**
 * Pull coordinates out of a Google Maps page body. Only the !3d<lat>!4d<lng>
 * pin marker is trusted — the page's APP_INITIALIZATION_STATE viewport is
 * geolocated from the REQUESTING server's IP (verified), so it would silently
 * return the Cloudflare datacenter's location, not the shared place.
 */
function coordsFromBody(body: string): Coords | null {
  const pin = body.match(new RegExp(`!3d${NUM}!4d${NUM}`));
  if (pin) { const c = valid(Number(pin[1]), Number(pin[2])); if (c) return c; }
  return null;
}

/** Human label from a /maps/place/<name>/ URL, when present. */
function labelFromUrl(u: string): string | undefined {
  const m = u.match(/\/maps\/place\/([^/@?]+)/);
  if (!m) return undefined;
  try {
    const name = decodeURIComponent(m[1].replace(/\+/g, " ")).trim();
    return name && !/^-?\d/.test(name) ? name : undefined;
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("url") || "").trim();

  // Raw "lat, lng" text pasted straight in.
  const rawCoords = raw.match(new RegExp(`^${NUM}\\s*,\\s*${NUM}$`));
  if (rawCoords) {
    const c = valid(Number(rawCoords[1]), Number(rawCoords[2]));
    if (c) return NextResponse.json({ success: true, ...c });
  }

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return NextResponse.json({ success: false, message: "That doesn't look like a Google Maps link." }, { status: 422 });
  }
  if (!ALLOWED_HOST.test(url.hostname)) {
    return NextResponse.json({ success: false, message: "Please paste a Google Maps link (maps.app.goo.gl or google.com/maps)." }, { status: 422 });
  }

  // 1) Coordinates already in the pasted URL — no network needed.
  let coords = coordsFromUrl(url.href);
  let label = labelFromUrl(url.href);

  if (!coords) {
    try {
      const r = await fetch(url.href, {
        redirect: "follow",
        headers: { "User-Agent": UA_BROWSER, "Accept-Language": "en", Accept: "text/html" },
      });
      let finalUrl = r.url || url.href;
      // EU-style consent interstitial wraps the real URL in ?continue=
      const cont = new URL(finalUrl).searchParams.get("continue");
      if (/consent\.google/i.test(finalUrl) && cont) finalUrl = cont;
      coords = coordsFromUrl(finalUrl);
      label = labelFromUrl(finalUrl) || label;
      if (!coords && r.ok) {
        const body = (await r.text()).slice(0, 1_500_000);
        coords = coordsFromBody(body);
      }
    } catch (err: any) {
      console.error("[Geo Link] fetch failed:", err?.message);
    }
  }

  if (coords) {
    return NextResponse.json({ success: true, ...coords, ...(label ? { label } : {}) });
  }
  return NextResponse.json(
    { success: false, message: "Couldn't read a location from that link. In Google Maps tap Share → Copy link, then paste it here." },
    { status: 422 }
  );
}
