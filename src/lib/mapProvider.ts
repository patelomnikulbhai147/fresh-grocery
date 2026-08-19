/**
 * MAP PROVIDER — free & open-source (Leaflet + OpenStreetMap tiles +
 * Nominatim geocoding). No API key, no billing.
 *
 * This is the ONLY place the map/geocoding vendor is referenced. To switch to
 * Google Maps later, reimplement these four exports (loadMap, reverseGeocode,
 * forwardGeocode, searchPlaces) — no calling component needs to change.
 */

const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

let leafletPromise: Promise<any | null> | null = null;

function win(): any {
  return typeof window === "undefined" ? undefined : (window as any);
}

/** Open-source map picking never needs billing — always "available". */
export function mapsAvailable(): boolean {
  return true;
}

/** Load Leaflet (CSS + JS) once from the CDN; resolves window.L (or null). */
export function loadMap(): Promise<any | null> {
  const w = win();
  if (!w) return Promise.resolve(null);
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.getElementById("leaflet-js");
    if (existing) {
      const t = setInterval(() => { if (w.L) { clearInterval(t); resolve(w.L); } }, 150);
      return;
    }
    const s = document.createElement("script");
    s.id = "leaflet-js";
    s.src = LEAFLET_JS;
    s.async = true;
    s.onload = () => resolve(w.L || null);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return leafletPromise;
}

/** A draggable pin icon built from HTML — avoids Leaflet's image-asset default. */
export function pinIcon(L: any): any {
  return L.divIcon({
    className: "",
    html: `<div style="transform:translate(-50%,-100%);font-size:30px;line-height:1;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">📍</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export interface GeocodeResult {
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  formatted?: string;
  lat: number;
  lng: number;
}

/** Thrown so the UI can distinguish "no results" from "request failed". */
export class GeocodeError extends Error {}

/** Reverse-geocode coordinates → address parts (via the server proxy). */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    const r = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`, { headers: { Accept: "application/json" } });
    if (!r.ok) return { lat, lng };
    const d = await r.json();
    return d?.result ? { ...d.result, lat, lng } : { lat, lng };
  } catch {
    return { lat, lng };
  }
}

/** Forward-geocode a text address → coordinates + parts (via the server proxy). */
export async function forwardGeocode(address: string): Promise<GeocodeResult | null> {
  if (!address.trim()) return null;
  const results = await searchPlaces(address);
  return results[0] ? { lat: results[0].lat, lng: results[0].lng, formatted: results[0].label } : null;
}

export interface PlaceSuggestion { label: string; lat: number; lng: number }

/**
 * Search suggestions for the map search box (India-restricted), via the server
 * proxy. Throws GeocodeError on a transport/service failure so the UI can show
 * "unable to search" instead of silently showing "no results".
 */
/** True when the text looks like a shared Google Maps link. */
export function looksLikeMapsLink(text: string): boolean {
  return /(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs|(maps\.)?google\.[a-z.]{2,10}\/(maps|\?))/i.test(text.trim());
}

/** Parse raw "lat, lng" text (e.g. pasted coordinates). */
export function parseLatLngText(text: string): { lat: number; lng: number } | null {
  const m = text.trim().match(/^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat !== 0 || lng !== 0) ? { lat, lng } : null;
}

export interface ResolvedMapsLink { lat: number; lng: number; label?: string }

/**
 * Resolve a shared Google Maps link to coordinates via the server proxy
 * (short links need server-side redirect following — CORS blocks the browser).
 */
export async function resolveMapsLink(link: string): Promise<ResolvedMapsLink | null> {
  const t = link.trim();
  if (!t) return null;
  try {
    const r = await fetch(`/api/geo/resolve-link?url=${encodeURIComponent(t)}`, { headers: { Accept: "application/json" } });
    const d = await r.json().catch(() => null);
    if (!r.ok || !d?.success) return null;
    const lat = Number(d.lat);
    const lng = Number(d.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng, label: typeof d.label === "string" ? d.label : undefined };
  } catch {
    return null;
  }
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (query.trim().length < 3) return [];
  let r: Response;
  try {
    r = await fetch(`/api/geo/search?q=${encodeURIComponent(query.trim())}`, { headers: { Accept: "application/json" } });
  } catch {
    throw new GeocodeError("network");
  }
  if (!r.ok) throw new GeocodeError("service");
  const d = await r.json().catch(() => null);
  if (!d?.success) throw new GeocodeError("service");
  return Array.isArray(d.results) ? d.results : [];
}
