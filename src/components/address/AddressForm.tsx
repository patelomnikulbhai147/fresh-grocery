"use client";
import { useState } from "react";
import { MapPin, Home, Briefcase, MoreHorizontal, Loader2, CheckCircle2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isServiceablePincode, serviceableAreasLabel } from "@/lib/serviceability";
import { forwardGeocode, mapsAvailable, resolveMapsLink, reverseGeocode } from "@/lib/mapProvider";
import { LocationPickerModal, type PickedLocation } from "./LocationPickerModal";
import type { SavedAddress } from "@/store/addresses";

export type AddressDraft = Omit<SavedAddress, "id" | "userKey">;

const TYPES = [
  { value: "Home", icon: Home },
  { value: "Work", icon: Briefcase },
  { value: "Other", icon: MoreHorizontal },
];

export function AddressForm({
  initial,
  defaultName,
  defaultPhone,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Partial<SavedAddress> | null;
  defaultName?: string;
  defaultPhone?: string;
  onSave: (draft: AddressDraft) => void;
  onCancel?: () => void;
  saving?: boolean;
}) {
  const [f, setF] = useState<AddressDraft>({
    label: initial?.label || "Home",
    name: initial?.name || defaultName || "",
    phone: initial?.phone || defaultPhone || "",
    houseNumber: initial?.houseNumber || "",
    buildingName: initial?.buildingName || "",
    floor: initial?.floor || "",
    street: initial?.street || "",
    area: initial?.area || "",
    landmark: initial?.landmark || "",
    city: initial?.city || "Gandhinagar",
    state: initial?.state || "Gujarat",
    pincode: initial?.pincode || "",
    latitude: initial?.latitude,
    longitude: initial?.longitude,
    addressLine: initial?.addressLine || "",
    isDefault: initial?.isDefault ?? false,
  });
  const [mapOpen, setMapOpen] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [warn, setWarn] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [mapsLink, setMapsLink] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkMsg, setLinkMsg] = useState("");

  const set = (k: keyof AddressDraft, v: any) => setF((s) => ({ ...s, [k]: v }));

  const onPicked = (loc: PickedLocation) => {
    setMapOpen(false);
    setF((s) => ({
      ...s,
      latitude: loc.lat,
      longitude: loc.lng,
      // Autofill where the map knows, but keep everything editable (§3)
      street: loc.street || s.street,
      area: loc.area || s.area,
      city: loc.city || s.city,
      state: loc.state || s.state,
      pincode: loc.pincode || s.pincode,
    }));
    if (loc.pincode && !isServiceablePincode(loc.pincode)) {
      setWarn(`Heads up: the map location's pincode ${loc.pincode} is outside our delivery area.`);
    } else {
      setWarn("");
    }
  };

  /** Paste a shared Google Maps link → resolve to coords, autofill via reverse geocode. */
  const applyMapsLink = async () => {
    const t = mapsLink.trim();
    if (!t) return;
    setLinkBusy(true);
    setLinkMsg("");
    const res = await resolveMapsLink(t);
    if (!res) {
      setLinkBusy(false);
      setLinkMsg("Couldn't read a location from that link. In Google Maps tap Share → Copy link, then paste it here.");
      return;
    }
    const geo = (await reverseGeocode(res.lat, res.lng)) || { lat: res.lat, lng: res.lng };
    setLinkBusy(false);
    setMapsLink("");
    onPicked(geo);
  };

  const validate = (): boolean => {
    const e: Record<string, boolean> = {};
    if (!f.name.trim()) e.name = true;
    if (!/^\d{10}$/.test((f.phone || "").replace(/\D/g, "").slice(-10))) e.phone = true;
    if (!f.houseNumber?.trim()) e.houseNumber = true;
    if (!f.area?.trim()) e.area = true;
    if (!f.city.trim()) e.city = true;
    if (!f.state?.trim()) e.state = true;
    if (!/^\d{6}$/.test(f.pincode)) e.pincode = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    let draft = { ...f };
    // ADDRESS → MAP (§4): if no coordinates yet, try to geocode the address.
    if ((draft.latitude == null || draft.longitude == null) && mapsAvailable()) {
      setGeoBusy(true);
      const composed = `${draft.houseNumber || ""} ${draft.buildingName || ""}, ${draft.street || ""}, ${draft.area || ""}, ${draft.city}, ${draft.state} ${draft.pincode}, India`;
      const geo = await forwardGeocode(composed);
      setGeoBusy(false);
      if (geo) { draft.latitude = geo.lat; draft.longitude = geo.lng; }
    }
    // §10 soft validation: map pincode vs typed pincode mismatch → warn, don't block.
    onSave(draft);
  };

  const pinOk = /^\d{6}$/.test(f.pincode) && isServiceablePincode(f.pincode);
  const pinBad = /^\d{6}$/.test(f.pincode) && !isServiceablePincode(f.pincode);
  const inputCls = (bad?: boolean) =>
    cn("input focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none", bad && "border-rose-400 ring-1 ring-rose-200");

  return (
    <div className="space-y-4">
      {/* Map picker CTA */}
      <button
        type="button"
        onClick={() => setMapOpen(true)}
        className="w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border-2 border-dashed border-[#067a46]/40 bg-emerald-50/50 hover:bg-emerald-50 transition text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-[#067a46] text-white grid place-items-center"><MapPin className="w-4 h-4" /></span>
          <span>
            <span className="block text-sm font-bold text-slate-900">Select Location on Map</span>
            <span className="block text-[11px] text-slate-500">
              {f.latitude != null ? `📍 Location set (${f.latitude.toFixed(4)}, ${f.longitude!.toFixed(4)})` : "Pin your exact delivery point"}
            </span>
          </span>
        </span>
        {f.latitude != null && <CheckCircle2 className="w-5 h-5 text-[#067a46]" />}
      </button>

      {/* Or paste a shared Google Maps link — finds any place, even ones map search misses */}
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={mapsLink}
              onChange={(e) => { setMapsLink(e.target.value); setLinkMsg(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyMapsLink(); } }}
              placeholder="Or paste Google Maps link (Share → Copy link)"
              className="input pl-9 pr-3 w-full text-xs focus:border-[#067a46] focus:ring-1 focus:ring-[#067a46] outline-none"
            />
          </div>
          <button type="button" onClick={applyMapsLink} disabled={linkBusy || !mapsLink.trim()}
            className="shrink-0 px-4 rounded-xl bg-[#067a46] hover:bg-[#046338] disabled:bg-slate-300 text-white text-xs font-bold flex items-center gap-1.5">
            {linkBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            Locate
          </button>
        </div>
        {linkMsg && <div className="text-[11px] font-semibold text-amber-700">{linkMsg}</div>}
      </div>

      {warn && <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">{warn}</div>}

      {/* Contact */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
          <input value={f.name} onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} placeholder="Your name" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
          <input value={f.phone} onChange={(e) => set("phone", e.target.value)} maxLength={10} inputMode="numeric" className={inputCls(errors.phone)} placeholder="10-digit mobile" />
        </div>
      </div>

      {/* Address detail */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">House / Flat / Door No. *</label>
          <input value={f.houseNumber} onChange={(e) => set("houseNumber", e.target.value)} className={inputCls(errors.houseNumber)} placeholder="e.g. Flat 203" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Building / Apartment</label>
          <input value={f.buildingName} onChange={(e) => set("buildingName", e.target.value)} className={inputCls()} placeholder="e.g. ABC Residency" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Floor</label>
          <input value={f.floor} onChange={(e) => set("floor", e.target.value)} className={inputCls()} placeholder="e.g. 2nd" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Street / Road</label>
          <input value={f.street} onChange={(e) => set("street", e.target.value)} className={inputCls()} placeholder="Street or road" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Area / Locality *</label>
          <input value={f.area} onChange={(e) => set("area", e.target.value)} className={inputCls(errors.area)} placeholder="e.g. Sector 21" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Landmark</label>
          <input value={f.landmark} onChange={(e) => set("landmark", e.target.value)} className={inputCls()} placeholder="e.g. Near XYZ Circle" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
          <input value={f.city} onChange={(e) => set("city", e.target.value)} className={inputCls(errors.city)} placeholder="City" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
          <input value={f.state} onChange={(e) => set("state", e.target.value)} className={inputCls(errors.state)} placeholder="State" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
          <input value={f.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} inputMode="numeric" className={inputCls(errors.pincode)} placeholder="382021" />
        </div>
      </div>
      {pinOk && <div className="text-[11px] font-bold text-[#067a46]">✓ Delivery available in this area</div>}
      {pinBad && <div className="text-[11px] font-bold text-rose-600">✕ Currently not providing here. Serviceable: {serviceableAreasLabel()}</div>}

      {/* Address type */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Save address as</label>
        <div className="flex gap-2">
          {TYPES.map((t) => {
            const Icon = t.icon;
            const active = f.label === t.value;
            return (
              <button key={t.value} type="button" onClick={() => set("label", t.value)}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition",
                  active ? "border-[#067a46] bg-emerald-50 text-[#067a46] ring-2 ring-emerald-100" : "border-slate-200 bg-white text-slate-600 hover:border-[#067a46]")}>
                <Icon className="w-3.5 h-3.5" /> {t.value}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
        <input type="checkbox" checked={f.isDefault} onChange={(e) => set("isDefault", e.target.checked)} className="accent-[#067a46] w-4 h-4" />
        Set as default delivery address
      </label>

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-full border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50">Cancel</button>
        )}
        <button type="button" onClick={submit} disabled={saving || geoBusy}
          className="flex-1 bg-[#067a46] hover:bg-[#046338] disabled:bg-slate-300 text-white font-bold py-3 rounded-full text-sm flex items-center justify-center gap-2">
          {(saving || geoBusy) && <Loader2 className="w-4 h-4 animate-spin" />} Save Address
        </button>
      </div>

      <LocationPickerModal open={mapOpen} initial={{ lat: f.latitude, lng: f.longitude }} onClose={() => setMapOpen(false)} onConfirm={onPicked} />
    </div>
  );
}
