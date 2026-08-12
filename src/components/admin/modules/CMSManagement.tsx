"use client";
import { useState } from "react";
import { LayoutTemplate, MoveUp, MoveDown, Eye, EyeOff, Check, Sparkles, Save, ShieldCheck, Layers } from "lucide-react";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn } from "@/lib/utils";

interface CMSBlock {
  id: string;
  title: string;
  type: string;
  description: string;
  enabled: boolean;
  order: number;
}

export function CMSManagement() {
  const { hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  const [blocks, setBlocks] = useState<CMSBlock[]>([
    { id: "cms-1", title: "Hero Carousel Sliders", type: "Banner Slider", description: "Primary top banner slider showcasing active offers and seasonal produce.", enabled: true, order: 1 },
    { id: "cms-2", title: "Shop by Category Grid", type: "Category Grid", description: "Interactive circular icons for Vegetables, Fruits, Dairy, Bakery, and Staples.", enabled: true, order: 2 },
    { id: "cms-3", title: "Flash Deals & 30-Min SLA Strip", type: "Timer Strip", description: "Countdown timer highlighting urgent discounts and rapid delivery promise.", enabled: true, order: 3 },
    { id: "cms-4", title: "Bestselling Grocery Showcase", type: "Product Grid", description: "Top ranking grocery items based on weekly customer purchase volume.", enabled: true, order: 4 },
    { id: "cms-5", title: "Organic Farm Story Banner", type: "Feature Story", description: "Brand storytelling banner highlighting 100% pesticide-free Gujarat farm partners.", enabled: true, order: 5 },
    { id: "cms-6", title: "Mobile App Download Promo", type: "App Promo", description: "QR code banner prompting users to explore the FlashKart Digital Hub.", enabled: true, order: 6 },
    { id: "cms-7", title: "Weekly Newsletter Subscribe Box", type: "Newsletter Box", description: "Email capture input for exclusive coupon drops and recipe guides.", enabled: false, order: 7 }
  ]);

  const canEdit = hasPermission("cms.edit");

  const handleToggle = (id: string) => {
    if (!canEdit) {
      pushToast("Permission denied: You need 'cms.edit' permission", "info");
      return;
    }
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
    pushToast("Section visibility updated!", "info");
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (!canEdit) {
      pushToast("Permission denied", "info");
      return;
    }
    const next = [...blocks];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= next.length) return;

    const temp = next[index]!;
    next[index] = next[targetIdx]!;
    next[targetIdx] = temp;

    // reindex orders
    next.forEach((b, i) => (b.order = i + 1));
    setBlocks(next);
  };

  const handleSaveAll = () => {
    if (!canEdit) {
      pushToast("Permission denied", "info");
      return;
    }
    pushToast("Homepage CMS layout layout successfully published to storefront!", "success");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Homepage CMS Builder
          </h2>
          <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">
            Configure storefront homepage sections, reorder content blocks, and toggle promotional ribbons without coding.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-xs font-bold flex items-center gap-2 shadow-glow-cta transition active:scale-95 shrink-0"
        >
          <Save className="w-4 h-4" /> Publish Layout
        </button>
      </div>

      {/* Builder List */}
      <div className="space-y-3 max-w-4xl">
        {blocks.map((block, idx) => (
          <div
            key={block.id}
            className={cn(
              "p-5 rounded-3xl border transition flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 shadow-soft",
              !block.enabled && "opacity-60 bg-cream-50 dark:bg-zinc-900/40 border-dashed"
            )}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-zinc-800 font-bold text-xs flex items-center justify-center text-brand-800 dark:text-zinc-300 shrink-0">
                #{block.order}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-base text-brand-950 dark:text-zinc-100 truncate">{block.title}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 dark:bg-zinc-800 text-brand-600 dark:text-zinc-400 border border-brand-100 dark:border-zinc-700">
                    {block.type}
                  </span>
                </div>
                <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{block.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-brand-50 dark:bg-zinc-800 p-1 rounded-xl border border-brand-100 dark:border-zinc-700">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "up")}
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-brand-700 dark:text-zinc-300 disabled:opacity-30 transition"
                  title="Move Up"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  disabled={idx === blocks.length - 1}
                  onClick={() => handleMove(idx, "down")}
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-brand-700 dark:text-zinc-300 disabled:opacity-30 transition"
                  title="Move Down"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleToggle(block.id)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm",
                  block.enabled
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300"
                )}
              >
                {block.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{block.enabled ? "Visible" : "Hidden"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
