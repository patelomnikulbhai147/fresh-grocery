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
const NOMINATIM = "https://nominatim.openstreetmap.org";

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

function mapNominatim(a: any): Omit<GeocodeResult, "lat" | "lng"> {
  a = a || {};
  return {
    street: a.road || a.pedestrian || a.footway || undefined,
    area: a.suburb || a.neighbourhood || a.quarter || a.village || a.hamlet || undefined,
    city: a.city || a.town || a.municipality || a.county || undefined,
    state: a.state || undefined,
    pincode: a.postcode || undefined,
  };
}

/** Reverse-geocode coordinates → address parts (OpenStreetMap / Nominatim). */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    const r = await fetch(`${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`, {
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return { lat, lng };
    const d = await r.json();
    return { ...mapNominatim(d.address), formatted: d.display_name, lat, lng };
  } catch {
    return { lat, lng };
  }
}

/** Forward-geocode a text address → coordinates + parts. */
export async function forwardGeocode(address: string): Promise<GeocodeResult | null> {
  if (!address.trim()) return null;
  try {
    const r = await fetch(`${NOMINATIM}/search?format=jsonv2&addressdetails=1&countrycodes=in&limit=1&q=${encodeURIComponent(address)}`, {
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return null;
    const arr = await r.json();
    const best = arr?.[0];
    if (!best) return null;
    return { ...mapNominatim(best.address), formatted: best.display_name, lat: Number(best.lat), lng: Number(best.lon) };
  } catch {
    return null;
  }
}

export interface PlaceSuggestion { label: string; lat: number; lng: number }

/** Search suggestions for the map search box (India-restricted). */
export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (query.trim().length < 3) return [];
  try {
    const r = await fetch(`${NOMINATIM}/search?format=jsonv2&countrycodes=in&limit=5&q=${encodeURIComponent(query)}`, {
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return [];
    const arr = await r.json();
    return (arr || []).map((x: any) => ({ label: x.display_name, lat: Number(x.lat), lng: Number(x.lon) }));
  } catch {
    return [];
  }
}
