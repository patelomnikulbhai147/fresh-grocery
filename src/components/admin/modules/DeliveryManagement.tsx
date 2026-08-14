"use client";
import { useState } from "react";
import { Truck, Plus, Edit, Trash2, Check, X, MapPin, Clock, DollarSign } from "lucide-react";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn, formatINR } from "@/lib/utils";

interface DeliveryZone {
  id: string;
  name: string;
  pincodes: string[];
  sla: string;
  minOrder: number;
  deliveryFee: number;
  freeAbove: number;
  status: "Active" | "Inactive";
}

export function DeliveryManagement() {
  const { hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  const [zones, setZones] = useState<DeliveryZone[]>([
    { id: "dz-1", name: "North Ahmedabad (Expressway & Chandkheda)", pincodes: ["382424", "382470", "380005"], sla: "20 Min", minOrder: 149, deliveryFee: 25, freeAbove: 399, status: "Active" },
    { id: "dz-2", name: "Gandhinagar Central (Infocity & Sector 1-20)", pincodes: ["382007", "382010", "382016"], sla: "15 Min", minOrder: 199, deliveryFee: 20, freeAbove: 299, status: "Active" },
    { id: "dz-3", name: "Satellite & SG Highway (South West)", pincodes: ["380015", "380054", "380058"], sla: "30 Min", minOrder: 249, deliveryFee: 35, freeAbove: 499, status: "Active" },
    { id: "dz-4", name: "Bopal South & Ghuma", pincodes: ["380058", "382481"], sla: "45 Min", minOrder: 299, deliveryFee: 40, freeAbove: 599, status: "Active" },
    { id: "dz-5", name: "CG Road & Navrangpura Central", pincodes: ["380009", "380006"], sla: "20 Min", minOrder: 149, deliveryFee: 25, freeAbove: 349, status: "Inactive" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [formData, setFormData] = useState<Partial<DeliveryZone>>({});

  const canEdit = hasPermission("delivery.edit");

  const handleOpenAdd = () => {
    if (!canEdit) {
      pushToast("Permission denied: You need 'delivery.edit' permission", "info");
      return;
    }
    setEditingZone(null);
    setFormData({
      name: "New Delivery Zone",
      pincodes: ["380001", "380002"],
      sla: "30 Min",
      minOrder: 199,
      deliveryFee: 30,
      freeAbove: 499,
      status: "Active"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zone: DeliveryZone) => {
    if (!canEdit) {
      pushToast("Permission denied", "info");
      return;
    }
    setEditingZone(zone);
    setFormData({ ...zone });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      pushToast("Zone Name is required", "info");
      return;
    }

    if (editingZone) {
      setZones((prev) => prev.map((z) => (z.id === editingZone.id ? { ...z, ...formData } as DeliveryZone : z)));
      pushToast(`Updated delivery zone "${formData.name}"`, "success");
    } else {
      const newZ: DeliveryZone = {
        id: `dz-${Date.now()}`,
        name: formData.name,
        pincodes: formData.pincodes || ["380000"],
        sla: formData.sla || "30 Min",
        minOrder: formData.minOrder || 199,
        deliveryFee: formData.deliveryFee || 30,
        freeAbove: formData.freeAbove || 499,
        status: formData.status || "Active"
      };
      setZones((prev) => [...prev, newZ]);
      pushToast(`Created zone "${formData.name}"`, "success");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!canEdit) {
      pushToast("Permission denied", "info");
      return;
    }
    if (window.confirm(`Are you sure you want to delete zone "${name}"?`)) {
      setZones((prev) => prev.filter((z) => z.id !== id));
      pushToast(`Deleted zone "${name}"`, "info");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <Truck className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Delivery Zones & SLA Rates
          </h2>
          <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">
            Configure regional pin codes, delivery fee structures, minimum order rules, and promised fulfillment times.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-xs font-bold flex items-center gap-2 shadow-glow-cta transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Delivery Zone
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 p-6 shadow-soft hover:shadow-lift transition flex flex-col justify-between space-y-4 group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-brand-900 dark:text-zinc-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-500" /> Regional Hub Zone
                </span>
                <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full", zone.status === "Active" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400")}>
                  {zone.status}
                </span>
              </div>

              <div className="font-display font-bold text-lg text-brand-950 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                {zone.name}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {zone.pincodes.map((pin) => (
                  <span key={pin} className="text-[11px] font-mono font-bold bg-brand-50 dark:bg-zinc-800 text-brand-800 dark:text-zinc-300 px-2 py-0.5 rounded border border-brand-100 dark:border-zinc-700">
                    PIN {pin}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 pt-3 border-t border-brand-100 dark:border-zinc-800 text-center text-xs">
              <div className="p-2 rounded-xl bg-brand-50/50 dark:bg-zinc-800/50">
                <div className="text-[10px] text-brand-600 dark:text-zinc-400 font-bold uppercase">SLA Time</div>
                <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-500" /> {zone.sla}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-brand-50/50 dark:bg-zinc-800/50">
                <div className="text-[10px] text-brand-600 dark:text-zinc-400 font-bold uppercase">Delivery Fee</div>
                <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 mt-0.5">
                  {formatINR(zone.deliveryFee)}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-brand-50/50 dark:bg-zinc-800/50">
                <div className="text-[10px] text-brand-600 dark:text-zinc-400 font-bold uppercase">Free Above</div>
                <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatINR(zone.freeAbove)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-2">
              <button onClick={() => handleOpenEdit(zone)} className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-zinc-800 hover:bg-brand-100 text-brand-800 dark:text-zinc-200 font-semibold text-xs transition">
                Edit Zone
              </button>
              <button onClick={() => handleDelete(zone.id, zone.name)} className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 border border-brand-100 dark:border-zinc-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-brand-100 dark:border-zinc-800 pb-4">
              <h3 className="font-display text-xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-600" /> {editingZone ? `Edit Zone: ${editingZone.name}` : "Create Delivery Zone"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-brand-700 hover:text-brand-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Ahmedabad (Expressway)"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-sm text-brand-950 dark:text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">PIN Codes (Comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 382424, 382470, 380005"
                  value={formData.pincodes?.join(", ") || ""}
                  onChange={(e) => setFormData({ ...formData, pincodes: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                  className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 font-mono outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Promised Delivery SLA</label>
                  <select
                    value={formData.sla || "30 Min"}
                    onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-semibold text-brand-950 dark:text-zinc-100 outline-none"
                  >
                    <option value="10 Min">10 Min (Ultra Rapid)</option>
                    <option value="15 Min">15 Min</option>
                    <option value="20 Min">20 Min</option>
                    <option value="30 Min">30 Min (Standard)</option>
                    <option value="45 Min">45 Min</option>
                    <option value="Same Day">Same Day</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrder || 199}
                    onChange={(e) => setFormData({ ...formData, minOrder: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Base Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={formData.deliveryFee || 30}
                    onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Free Delivery Above (₹)</label>
                  <input
                    type="number"
                    value={formData.freeAbove || 499}
                    onChange={(e) => setFormData({ ...formData, freeAbove: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-brand-50 dark:bg-zinc-800 rounded-2xl border border-brand-100 dark:border-zinc-700 flex items-center justify-between">
                <span className="font-bold">Active Status</span>
                <input
                  type="checkbox"
                  checked={formData.status === "Active"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "Active" : "Inactive" })}
                  className="w-4 h-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border font-semibold text-brand-800 dark:text-zinc-300 hover:bg-brand-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 text-white font-bold shadow-glow-cta transition active:scale-95"
                >
                  {editingZone ? "Save Zone" : "Create Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
