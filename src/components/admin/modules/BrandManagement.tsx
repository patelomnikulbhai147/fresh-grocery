"use client";
import { useState } from "react";
import { Tag, Plus, Edit, Trash2, Check, X, ShieldCheck, ExternalLink, Package } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn } from "@/lib/utils";

interface BrandItem {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: "Active" | "Inactive";
  featured: boolean;
}

export function BrandManagement() {
  const { products } = useAdminStore();
  const { hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  const [brands, setBrands] = useState<BrandItem[]>([
    { id: "br-1", name: "FlashKart Fresh", logo: "🌿", description: "100% pesticide-free fresh farm produce from Gujarat.", status: "Active", featured: true },
    { id: "br-2", name: "Amul", logo: "🧈", description: "The Taste of India — Fresh milk, butter, cheese and dairy.", status: "Active", featured: true },
    { id: "br-3", name: "Tata Sampann", logo: "🌾", description: "Unpolished dal, spices, and besan with natural oils intact.", status: "Active", featured: true },
    { id: "br-4", name: "Britannia", logo: "🍞", description: "Fresh breads, wholesome biscuits and cakes.", status: "Active", featured: false },
    { id: "br-5", name: "Nestlé", logo: "☕", description: "Coffee, cereals, noodles, and daily essentials.", status: "Active", featured: false },
    { id: "br-6", name: "Haldiram's", logo: "🥨", description: "Traditional Indian snacks, namkeen, and sweets.", status: "Active", featured: true },
    { id: "br-7", name: "Real Fruit Power", logo: "🧃", description: "Fruit juices and energy beverages.", status: "Active", featured: false },
    { id: "br-8", name: "Fortune", logo: "🌻", description: "Edible sunflower and soya bean cooking oils.", status: "Active", featured: false }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [formData, setFormData] = useState<Partial<BrandItem>>({});

  const canEdit = hasPermission("brands.edit");

  const handleOpenAdd = () => {
    if (!canEdit) {
      pushToast("Permission denied: You need 'brands.edit' permission", "info");
      return;
    }
    setEditingBrand(null);
    setFormData({
      name: "",
      logo: "🌟",
      description: "Premium partner grocery brand.",
      status: "Active",
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: BrandItem) => {
    if (!canEdit) {
      pushToast("Permission denied", "info");
      return;
    }
    setEditingBrand(brand);
    setFormData({ ...brand });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      pushToast("Brand Name is required", "info");
      return;
    }

    if (editingBrand) {
      setBrands((prev) => prev.map((b) => (b.id === editingBrand.id ? { ...b, ...formData } as BrandItem : b)));
      pushToast(`Updated brand "${formData.name}"`, "success");
    } else {
      const newB: BrandItem = {
        id: `br-${Date.now()}`,
        name: formData.name,
        logo: formData.logo || "🌟",
        description: formData.description || "Partner brand.",
        status: formData.status || "Active",
        featured: formData.featured ?? false
      };
      setBrands((prev) => [newB, ...prev]);
      pushToast(`Created brand "${formData.name}"`, "success");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!canEdit) {
      pushToast("Permission denied", "info");
      return;
    }
    if (window.confirm(`Are you sure you want to delete brand "${name}"?`)) {
      setBrands((prev) => prev.filter((b) => b.id !== id));
      pushToast(`Deleted brand "${name}"`, "info");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <Tag className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Brand Management
          </h2>
          <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">
            Manage grocery supplier brands, partner showcases, and brand filter badges.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-xs font-bold flex items-center gap-2 shadow-glow-cta transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Brand
        </button>
      </div>

      {/* Brands Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {brands.map((br) => {
          const prodCount = products.filter((p) => p.brand.toLowerCase() === br.name.toLowerCase() || p.brand.includes(br.name)).length;

          return (
            <div key={br.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 p-5 shadow-soft hover:shadow-lift transition flex flex-col justify-between space-y-4 group">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-cream-100 dark:bg-zinc-800 flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-sm border border-brand-100 dark:border-zinc-700">
                    {br.logo}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", br.status === "Active" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400")}>
                      {br.status}
                    </span>
                    {br.featured && (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                        ★ Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="font-display font-bold text-base text-brand-950 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                  {br.name}
                </div>
                <p className="text-xs text-brand-600 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {br.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-brand-700 dark:text-zinc-400 pt-3 border-t border-brand-100/60 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Package className="w-3.5 h-3.5 text-brand-500" /> {prodCount} Products
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(br)}
                    className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-zinc-800 text-brand-700 dark:text-zinc-300 transition"
                    title="Edit Brand"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(br.id, br.name)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 transition"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 border border-brand-100 dark:border-zinc-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-brand-100 dark:border-zinc-800 pb-4">
              <h3 className="font-display text-xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-600" /> {editingBrand ? `Edit Brand: ${editingBrand.name}` : "Create New Brand"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-brand-700 hover:text-brand-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FlashKart Fresh"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-semibold text-sm text-brand-950 dark:text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Logo Icon / Emoji *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🌿 or 🥛"
                  value={formData.logo || ""}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xl text-center outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Brand Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl p-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-brand-50 dark:bg-zinc-800 rounded-2xl border border-brand-100 dark:border-zinc-700 flex items-center justify-between">
                  <span className="font-bold">Active Status</span>
                  <input
                    type="checkbox"
                    checked={formData.status === "Active"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "Active" : "Inactive" })}
                    className="w-4 h-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <div className="p-3 bg-brand-50 dark:bg-zinc-800 rounded-2xl border border-brand-100 dark:border-zinc-700 flex items-center justify-between">
                  <span className="font-bold">Featured</span>
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-200 dark:border-zinc-700 font-semibold text-brand-800 dark:text-zinc-300 hover:bg-brand-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 text-white font-bold shadow-glow-cta transition active:scale-95"
                >
                  {editingBrand ? "Save Brand" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
