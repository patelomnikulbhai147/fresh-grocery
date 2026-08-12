"use client";
import { useState } from "react";
import { Percent, Plus, Edit, Trash2, CheckCircle2, X, Tag, Calendar, DollarSign, ShieldCheck } from "lucide-react";
import { useAdminStore, type AdminCoupon } from "@/store/adminStore";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn, formatINR } from "@/lib/utils";

export function CouponManagement() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useAdminStore();
  const { user, hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [formData, setFormData] = useState<Partial<AdminCoupon>>({});

  const canEdit = hasPermission("coupons.edit");

  const handleOpenAdd = () => {
    if (!canEdit) {
      pushToast("Permission denied: You need 'coupons.edit' permission", "info");
      return;
    }
    setEditingCoupon(null);
    setFormData({
      code: "FLASH30",
      title: "Flat 30% Off on Fresh Produce",
      discountType: "Percentage",
      value: 30,
      minOrder: 499,
      maxDiscount: 150,
      usageLimit: 500,
      usedCount: 0,
      validFrom: new Date().toISOString().slice(0, 10),
      validTo: "2026-12-31",
      status: "Active"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cpn: AdminCoupon) => {
    if (!canEdit) {
      pushToast("Permission denied", "info");
      return;
    }
    setEditingCoupon(cpn);
    setFormData({ ...cpn });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) {
      pushToast("Coupon Code and Title are required", "info");
      return;
    }

    const u = user?.name || "Super Admin";
    const r = user?.role || "Super Admin";

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, formData as Partial<AdminCoupon>, u, r);
      pushToast(`Updated coupon "${formData.code}"`, "success");
    } else {
      addCoupon(
        {
          code: formData.code.toUpperCase().replace(/\s+/g, ""),
          title: formData.title,
          discountType: formData.discountType || "Percentage",
          value: formData.value || 10,
          minOrder: formData.minOrder || 299,
          maxDiscount: formData.maxDiscount || 100,
          usageLimit: formData.usageLimit || 1000,
          usedCount: 0,
          validFrom: formData.validFrom || new Date().toISOString().slice(0, 10),
          validTo: formData.validTo || "2026-12-31",
          status: formData.status || "Active"
        },
        u,
        r
      );
      pushToast(`Created promo code "${formData.code}"!`, "success");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, code: string) => {
    if (!canEdit) {
      pushToast("Permission denied", "info");
      return;
    }
    if (window.confirm(`Are you sure you want to delete promo code "${code}"?`)) {
      deleteCoupon(id, user?.name || "Super Admin", user?.role || "Super Admin");
      pushToast(`Deleted coupon "${code}"`, "info");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <Percent className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Coupons & Offers Management
          </h2>
          <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">
            Create promotional discount codes, configure minimum order thresholds, and track campaign usage limits.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-xs font-bold flex items-center gap-2 shadow-glow-cta transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {coupons.map((cpn) => {
          const isExpired = cpn.status === "Expired" || new Date(cpn.validTo || cpn.expiryDate || "2030-01-01") < new Date();
          const usagePct = Math.round((cpn.usedCount / cpn.usageLimit) * 100);

          return (
            <div key={cpn.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 p-5 shadow-soft hover:shadow-lift transition flex flex-col justify-between space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-500/10 to-transparent rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-bold text-sm tracking-wider px-3 py-1 rounded-xl bg-brand-900 dark:bg-brand-600 text-white shadow-sm flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> {cpn.code}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                      cpn.status === "Active" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
                    )}
                  >
                    {cpn.status}
                  </span>
                </div>

                <div className="font-display font-bold text-base text-brand-950 dark:text-zinc-100">{cpn.title}</div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {cpn.discountType === "Percentage" ? `${cpn.value}% OFF` : `Flat ₹${cpn.value} OFF`}
                  <span className="text-brand-600 dark:text-zinc-400 font-normal"> (Min Order: {formatINR(cpn.minOrder || cpn.minCartValue || 0)})</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-brand-100/60 dark:border-zinc-800">
                <div className="flex justify-between text-[11px] text-brand-600 dark:text-zinc-400 font-semibold">
                  <span>Usage: {cpn.usedCount} / {cpn.usageLimit}</span>
                  <span>{usagePct}%</span>
                </div>
                <div className="w-full h-1.5 bg-brand-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div style={{ width: `${Math.min(100, usagePct)}%` }} className="h-full bg-brand-500 rounded-full" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-brand-600 dark:text-zinc-500 pt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Valid to: {cpn.validTo || cpn.expiryDate}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEdit(cpn)} className="p-1 rounded hover:bg-brand-50 text-brand-700 dark:text-zinc-300" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(cpn.id, cpn.code)} className="p-1 rounded hover:bg-rose-50 text-rose-600" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 border border-brand-100 dark:border-zinc-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-brand-100 dark:border-zinc-800 pb-4">
              <h3 className="font-display text-xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-600" /> {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Promo Code"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-brand-700 hover:text-brand-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FLASH50"
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono font-bold text-sm text-brand-950 dark:text-zinc-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType || "Percentage"}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-semibold text-brand-950 dark:text-zinc-100 outline-none"
                  >
                    <option value="Percentage">Percentage (% Off)</option>
                    <option value="Flat">Flat Amount (₹ Off)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Offer Title / Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 30% off on all organic fruits & veggies"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Discount Value ({formData.discountType === "Percentage" ? "%" : "₹"}) *</label>
                  <input
                    type="number"
                    required
                    value={formData.value || 10}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-base outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrder || 299}
                    onChange={(e) => setFormData({ ...formData, minOrder: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount || 100}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit || 1000}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value, 10) || 100 })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Valid From Date</label>
                  <input
                    type="date"
                    value={formData.validFrom || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Valid To Date</label>
                  <input
                    type="date"
                    value={formData.validTo || "2026-12-31"}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border font-semibold text-brand-800 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 text-white font-bold shadow-glow-cta transition active:scale-95"
                >
                  {editingCoupon ? "Save Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
