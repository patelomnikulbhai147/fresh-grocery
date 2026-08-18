"use client";
import { Home, Briefcase, MapPin, MoreHorizontal, Pencil, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SavedAddress } from "@/store/addresses";

const iconFor = (label: string) => (/home/i.test(label) ? Home : /work|office/i.test(label) ? Briefcase : MoreHorizontal);

/** Client-safe display formatter (avoids importing server-only lib/auth). */
const fmtPhone = (raw: string) => {
  const d = (raw || "").replace(/\D/g, "").slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : raw;
};

/** Clean, multi-line address display (§6) — never one confusing long line. */
export function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onMakeDefault,
  compact,
}: {
  address: SavedAddress;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMakeDefault?: () => void;
  compact?: boolean;
}) {
  const Icon = iconFor(address.label);
  const line2 = [address.houseNumber, address.buildingName].filter(Boolean).join(", ");
  const line3 = address.floor ? `${address.floor} Floor` : "";
  const line4 = [address.street, address.area].filter(Boolean).join(", ");
  const line5 = address.landmark ? `Near ${address.landmark}` : "";
  const line6 = `${address.city}${address.state ? `, ${address.state}` : ""} - ${address.pincode}`;
  const hasLoc = address.latitude != null && address.longitude != null;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "rounded-2xl border p-4 transition bg-white",
        onSelect && "cursor-pointer",
        selected ? "border-[#067a46] ring-2 ring-emerald-100 bg-emerald-50/40" : "border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className={cn("w-7 h-7 rounded-lg grid place-items-center", selected ? "bg-[#067a46] text-white" : "bg-slate-100 text-[#067a46]")}>
            <Icon className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-black uppercase tracking-wide text-slate-800">{address.label}</span>
          {address.isDefault && (
            <span className="text-[9px] uppercase font-bold bg-[#067a46] text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5" fill="currentColor" /> Default
            </span>
          )}
        </div>
        {!compact && (
          <div className="flex items-center gap-1">
            {onEdit && <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil className="w-3.5 h-3.5" /></button>}
            {onDelete && <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>}
          </div>
        )}
      </div>

      <div className="text-sm font-bold text-slate-900">{address.name}</div>
      {address.phone && <div className="text-xs text-slate-500 mb-1.5">{fmtPhone(address.phone)}</div>}

      <div className="text-xs text-slate-600 leading-relaxed">
        {line2 && <div>{line2}</div>}
        {line3 && <div>{line3}</div>}
        {line4 && <div>{line4}</div>}
        {line5 && <div>{line5}</div>}
        {!line2 && !line4 && address.addressLine && <div>{address.addressLine}</div>}
        <div>{line6}</div>
      </div>

      <div className="mt-2 flex items-center gap-3">
        {hasLoc && <span className="text-[11px] font-bold text-[#067a46] flex items-center gap-1"><MapPin className="w-3 h-3" /> Exact location saved</span>}
        {!compact && onMakeDefault && !address.isDefault && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onMakeDefault(); }} className="text-[11px] font-bold text-slate-500 hover:text-[#067a46]">Set as default</button>
        )}
      </div>
    </div>
  );
}
