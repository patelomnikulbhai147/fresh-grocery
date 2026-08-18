"use client";
import { useEffect, useRef, useState } from "react";
import { X, LocateFixed, Check, Search, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { loadMap, reverseGeocode, searchPlaces, pinIcon, type GeocodeResult, type PlaceSuggestion } from "@/lib/mapProvider";

/** Gandhinagar city centre — default when nothing is picked yet. */
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
  const Lref = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [pos, setPos] = useState({ lat: initial?.lat ?? DEFAULT_CENTER.lat, lng: initial?.lng ?? DEFAULT_CENTER.lng });
  const [locating, setLocating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [geoMsg, setGeoMsg] = useState("");
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const L = await loadMap();
      if (cancelled) return;
      if (!L || !mapEl.current) { setUnavailable(true); return; }
      Lref.current = L;
      const start: [number, number] = [initial?.lat ?? DEFAULT_CENTER.lat, initial?.lng ?? DEFAULT_CENTER.lng];
      const map = L.map(mapEl.current, { center: start, zoom: 16, zoomControl: true, attributionControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      const marker = L.marker(start, { draggable: true, icon: pinIcon(L) }).addTo(map);
      mapRef.current = map;
      markerRef.current = marker;
      setPos({ lat: start[0], lng: start[1] });

      marker.on("dragend", () => { const p = marker.getLatLng(); setPos({ lat: p.lat, lng: p.lng }); });
      map.on("click", (e: any) => { marker.setLatLng(e.latlng); setPos({ lat: e.latlng.lat, lng: e.latlng.lng }); });
      // Leaflet needs a size recalc when shown inside a modal.
      setTimeout(() => map.invalidateSize(), 200);
      setReady(true);
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

  const useCurrentLocation = () => {
    setGeoMsg("");
    if (!navigator.geolocation) { setGeoMsg("Unable to detect your location. Please enter your address manually."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { moveTo(p.coords.latitude, p.coords.longitude); setLocating(false); },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) setGeoMsg("Location permission was denied. You can enter your address manually or pick a spot on the map.");
        else setGeoMsg("Unable to detect your location. Please try again or enter your address manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Debounced place search.
  useEffect(() => {
    if (q.trim().length < 3) { setSuggestions([]); return; }
    const t = setTimeout(async () => setSuggestions(await searchPlaces(q)), 500);
    return () => clearTimeout(t);
  }, [q]);

  const confirm = async () => {
    setConfirming(true);
    const geo = await reverseGeocode(pos.lat, pos.lng);
    setConfirming(false);
    onConfirm(geo || { lat: pos.lat, lng: pos.lng });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#067a46]" /> Select Delivery Location
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
        </div>

        {!unavailable ? (
          <>
            <div className="p-3 border-b border-slate-100 relative shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search area, street, landmark…" className="input pl-9 focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none" />
              </div>
              {suggestions.length > 0 && (
                <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-[110] max-h-52 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => { moveTo(s.lat, s.lng); setQ(""); setSuggestions([]); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 border-b border-slate-50 last:border-0">
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex-1 min-h-[280px]">
              <div ref={mapEl} className="absolute inset-0 w-full h-full bg-slate-100" />
              {!ready && <div className="absolute inset-0 grid place-items-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin" /></div>}
              <button type="button" onClick={useCurrentLocation}
                className="absolute bottom-3 right-3 z-[110] bg-white shadow-md rounded-full px-3.5 py-2 text-xs font-bold text-[#067a46] flex items-center gap-1.5 hover:bg-emerald-50">
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />} Use current location
              </button>
            </div>

            {geoMsg && (
              <div className="px-5 py-2.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border-t border-amber-100 flex items-center gap-1.5 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {geoMsg}
              </div>
            )}
            <div className="px-5 py-2 text-[11px] text-slate-500 border-t border-slate-100 shrink-0">
              📍 {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)} — drag the pin or tap the map to fine-tune.
            </div>
            <div className="p-4 shrink-0">
              <button type="button" onClick={confirm} disabled={confirming}
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
