"use client";
import { useEffect, useRef, useState } from "react";
import { X, LocateFixed, Check, Search, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { loadMap, reverseGeocode, searchPlaces, pinIcon, GeocodeError, type GeocodeResult, type PlaceSuggestion } from "@/lib/mapProvider";
import { isServiceablePincode } from "@/lib/serviceability";

/** Gandhinagar city centre — the map's starting view only (never saved as a result). */
const DEFAULT_CENTER = { lat: 23.2156, lng: 72.6369 };

export interface PickedLocation extends GeocodeResult {}

export function LocationPickerModal({
  open,
  initial,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initial?: { lat?: number; lng?: number } | null;
  onClose: () => void;
  onConfirm: (loc: PickedLocation) => void;
}) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const reverseSeq = useRef(0);

  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [pos, setPos] = useState({ lat: initial?.lat ?? DEFAULT_CENTER.lat, lng: initial?.lng ?? DEFAULT_CENTER.lng });

  // search
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState("");

  // current location + reverse geocode
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState("");
  const [reverseBusy, setReverseBusy] = useState(false);
  const [detected, setDetected] = useState<GeocodeResult | null>(null);
  const [confirming, setConfirming] = useState(false);

  // ── Build the Leaflet map once the modal opens ──
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const L = await loadMap();
      if (cancelled) return;
      if (!L || !mapEl.current) { setUnavailable(true); return; }
      const start: [number, number] = [initial?.lat ?? DEFAULT_CENTER.lat, initial?.lng ?? DEFAULT_CENTER.lng];
      const map = L.map(mapEl.current, { center: start, zoom: 16, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(map);
      const marker = L.marker(start, { draggable: true, icon: pinIcon(L) }).addTo(map);
      mapRef.current = map;
      markerRef.current = marker;
      setPos({ lat: start[0], lng: start[1] });
      // Marker drag / map tap → new coords → reverse geocode (one request per action §6/§7)
      marker.on("dragend", () => { const p = marker.getLatLng(); setPos({ lat: p.lat, lng: p.lng }); reverseAt(p.lat, p.lng); });
      map.on("click", (e: any) => { marker.setLatLng(e.latlng); setPos({ lat: e.latlng.lat, lng: e.latlng.lng }); reverseAt(e.latlng.lat, e.latlng.lng); });
      setTimeout(() => map.invalidateSize(), 150);
      setReady(true);
      // If we opened on a saved address, describe it immediately.
      if (initial?.lat != null && initial?.lng != null) reverseAt(initial.lat, initial.lng);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const moveTo = (lat: number, lng: number, zoom = 17) => {
    setPos({ lat, lng });
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], zoom);
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  /** Reverse-geocode a point and show the detected address (§5, §7, §14). */
  const reverseAt = async (lat: number, lng: number) => {
    const seq = ++reverseSeq.current;
    setReverseBusy(true);
    const geo = await reverseGeocode(lat, lng);
    if (seq !== reverseSeq.current) return; // a newer move superseded this one
    setReverseBusy(false);
    setDetected(geo || { lat, lng });
  };

  // ── Search: debounced AND button-driven; one in-flight request at a time ──
  const runSearch = async (query: string) => {
    const term = query.trim();
    setSearchMsg("");
    if (term.length < 3) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const results = await searchPlaces(term);
      setSuggestions(results);
      setSearchMsg(
        results.length === 0
          ? "Couldn't find that place. Try adding your area or city (e.g. \"Kudasan, Gandhinagar\"), search your pincode, or drag the map pin to your exact spot."
          : ""
      );
    } catch {
      setSuggestions([]);
      setSearchMsg("Unable to find this location. Please try another search.");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (q.trim().length < 3) { setSuggestions([]); setSearchMsg(""); return; }
    const t = setTimeout(() => runSearch(q), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const pickSuggestion = (s: PlaceSuggestion) => {
    setSuggestions([]);
    setQ("");
    setSearchMsg("");
    moveTo(s.lat, s.lng);
    reverseAt(s.lat, s.lng);
  };

  const useCurrentLocation = () => {
    setGeoMsg("");
    if (!navigator.geolocation) { setGeoMsg("Unable to detect your current location. Please try again or search manually."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false);
        moveTo(p.coords.latitude, p.coords.longitude, 18);
        reverseAt(p.coords.latitude, p.coords.longitude);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED)
          setGeoMsg("Location permission was denied. You can search for your location or select it manually on the map.");
        else setGeoMsg("Unable to detect your current location. Please try again or search manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const confirm = async () => {
    setConfirming(true);
    // Prefer the already-detected address; otherwise reverse-geocode now.
    const geo = detected && detected.lat === pos.lat && detected.lng === pos.lng
      ? detected
      : (await reverseGeocode(pos.lat, pos.lng)) || { lat: pos.lat, lng: pos.lng };
    setConfirming(false);
    onConfirm(geo);
  };

  if (!open) return null;

  const pin = detected?.pincode;
  const serviceable = pin ? isServiceablePincode(pin) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl max-h-[94vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 shrink-0">
          <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#067a46]" /> Select Delivery Location
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
        </div>

        {!unavailable ? (
          <>
            {/* Search + Current location controls (§3) */}
            <div className="p-3 border-b border-slate-100 shrink-0 space-y-2.5 relative">
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); runSearch(q); } }}
                    placeholder="Search area, society, street, pincode…"
                    className="input pl-9 pr-3 w-full focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
                  />
                </div>
                <button type="button" onClick={() => runSearch(q)} disabled={searching || q.trim().length < 3}
                  className="shrink-0 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white text-sm font-bold flex items-center gap-1.5">
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span className="hidden xs:inline">Search</span>
                </button>
              </div>

              <button type="button" onClick={useCurrentLocation} disabled={locating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#067a46]/50 bg-emerald-50 hover:bg-emerald-100 text-[#067a46] text-sm font-bold transition">
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                {locating ? "Detecting your location…" : "Use Current Location"}
              </button>

              {searchMsg && <div className="text-[11px] font-semibold text-amber-700">{searchMsg}</div>}

              {/* Suggestion dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute left-3 right-3 top-full -mt-0.5 bg-white border border-slate-200 rounded-xl shadow-lg z-[120] max-h-56 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => pickSuggestion(s)}
                      className="w-full text-left px-3 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 border-b border-slate-50 last:border-0 flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#067a46] mt-0.5 shrink-0" />
                      <span className="leading-snug">{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="relative flex-1 min-h-[240px]">
              <div ref={mapEl} className="absolute inset-0 w-full h-full bg-slate-100" />
              {!ready && <div className="absolute inset-0 grid place-items-center text-slate-500 pointer-events-none"><Loader2 className="w-6 h-6 animate-spin" /></div>}
            </div>

            {/* Detected address + serviceability + coords (§5, §16) */}
            <div className="px-4 py-2.5 border-t border-slate-100 shrink-0 space-y-1">
              {geoMsg && (
                <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {geoMsg}
                </div>
              )}
              {reverseBusy ? (
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Finding address…</div>
              ) : detected?.formatted ? (
                <div className="text-[11px] text-slate-600 leading-snug line-clamp-2">📍 {detected.formatted}</div>
              ) : null}
              {serviceable === true && <div className="text-[11px] font-bold text-[#067a46]">✓ FlashKart delivers here</div>}
              {serviceable === false && <div className="text-[11px] font-bold text-rose-600">✕ FlashKart currently does not deliver here</div>}
              <div className="text-[10px] text-slate-400">{pos.lat.toFixed(5)}, {pos.lng.toFixed(5)} — drag the pin to fine-tune</div>
            </div>

            {/* Confirm */}
            <div className="p-3 shrink-0">
              <button type="button" onClick={confirm} disabled={confirming || reverseBusy}
                className="w-full bg-[#067a46] hover:bg-[#046338] disabled:bg-slate-300 text-white font-bold py-3 rounded-full text-sm flex items-center justify-center gap-2">
                {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Confirm Location
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 grid place-items-center mb-3"><MapPin className="w-7 h-7" /></div>
            <p className="text-sm text-slate-600 leading-relaxed">The map couldn’t load right now. You can still enter your address manually — every field works without the map.</p>
            <button type="button" onClick={onClose} className="mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-6 rounded-full text-sm">Enter address manually</button>
          </div>
        )}
      </div>
    </div>
  );
}
