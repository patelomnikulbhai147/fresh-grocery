"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { X, SlidersHorizontal, Search, ChevronDown, Grid3x3, LayoutList, ShoppingBag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryComingSoon } from "@/components/shop/CategoryComingSoon";
import { NotifyMeModal } from "@/components/shop/NotifyMeModal";
import { OrderTomorrowModal } from "@/components/shop/OrderTomorrowModal";
import type { Category, Product } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/store/adminStore";
import { isCategoryComingSoon, getCategoryStatus } from "@/lib/categoryHelper";

type Sp = { cat?: string; q?: string; deals?: string; filter?: string; sort?: string };

type Props = {
  products: Product[];
  categories: Category[];
  initial: Sp;
};

export function ShopClient({ products, categories, initial }: Props) {
  const sp = initial;
  const [cat, setCat] = useState(sp?.cat ?? "all");
  const [q, setQ] = useState(sp?.q ?? "");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sort, setSort] = useState<"popular" | "low" | "high" | "new">(
    (sp?.sort as "popular" | "low" | "high" | "new") ?? "popular"
  );
  const [grid, setGrid] = useState<3 | 4>(4);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notifyProduct, setNotifyProduct] = useState<string | null>(null);
  const [orderTomorrowProduct, setOrderTomorrowProduct] = useState<string | null>(null);

  const adminCategories = useAdminStore((s) => s.categories);
  const displayCategories = adminCategories && adminCategories.length > 0 ? adminCategories : categories;

  const filtered = useMemo(() => {
    let list = products;
    if (cat !== "all") list = list.filter((p) => p.category === cat);
    if (q.trim())
      list = list.filter((p) =>
        (p.name + " " + p.subcategory + " " + p.tagline + " " + p.category)
          .toLowerCase()
          .includes(q.toLowerCase())
      );
    if (organicOnly) list = list.filter((p) => p.organic);
    if (sp?.filter === "bestseller") list = list.filter((p) => p.bestSeller);
    if (sp?.filter === "new") list = list.filter((p) => p.newArrival);
    if (sp?.filter === "organic") list = list.filter((p) => p.organic);
    if (sp?.deals === "true")
      list = list.filter((p) => p.weights.some((w) => w.mrp - w.price > 10));
    list = list.filter((p) => p.weights[0].price <= maxPrice);
    list = [...list].sort((a, b) => {
      if (sort === "low") return a.weights[0].price - b.weights[0].price;
      if (sort === "high") return b.weights[0].price - a.weights[0].price;
      if (sort === "new") return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      return b.reviews - a.reviews;
    });
    return list;
  }, [products, cat, q, organicOnly, maxPrice, sort, sp]);

  const activeCategoryObj = displayCategories.find((c) => c.slug === cat);
  const isCurrentCatComingSoon = cat !== "all" && isCategoryComingSoon(cat, displayCategories);

  const isSearchComingSoon =
    q.trim() !== "" &&
    (isCategoryComingSoon(q, displayCategories) ||
      (filtered.length > 0 && filtered.every((p) => isCategoryComingSoon(p.category, displayCategories))) ||
      (filtered.length === 0 &&
        displayCategories.some(
          (c) => c.name.toLowerCase().includes(q.toLowerCase()) && getCategoryStatus(c) === "Coming Soon"
        )));

  const suggestedVegetables = useMemo(() => {
    if (!isSearchComingSoon) return [];
    return products.filter((p) => !isCategoryComingSoon(p.category, displayCategories)).slice(0, 8);
  }, [isSearchComingSoon, products, displayCategories]);

  return (
    <>
      {/* Breadcrumb / Heading */}
      <div className="mb-8">
        <div className="text-xs text-[#067a46] font-bold mb-2">
          <Link href="/" className="hover:text-[#046338]">Home</Link> / Fresh Produce
        </div>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl md:text-5xl text-slate-900 text-balance font-black">
              {cat === "all"
                ? "All Fresh Produce"
                : activeCategoryObj?.name ?? "Fresh Produce"}
            </h1>
            <p className="mt-1 text-slate-600 text-sm">
              {isCurrentCatComingSoon
                ? "Launching Soon"
                : `${filtered.length} fresh items · Hand-graded daily from partner farms`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
              <Grid3x3
                onClick={() => setGrid(4)}
                className={cn("w-4 h-4 cursor-pointer", grid === 4 ? "text-[#067a46]" : "text-slate-400")}
              />
              <LayoutList
                onClick={() => setGrid(3)}
                className={cn("w-4 h-4 cursor-pointer", grid === 3 ? "text-[#067a46]" : "text-slate-400")}
              />
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "popular" | "low" | "high" | "new")}
                className="appearance-none bg-white border border-slate-200 rounded-full pl-4 pr-9 py-2 text-xs font-bold text-slate-800 cursor-pointer hover:border-[#067a46] shadow-sm"
              >
                <option value="popular">Most popular</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="new">Seasonal specials</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 bg-[#067a46] text-white rounded-full px-4 py-2 text-xs font-bold shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6 flex items-center bg-white border border-slate-200 rounded-full pl-4 pr-2 py-1.5 max-w-xl shadow-sm focus-within:border-[#067a46]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search fresh vegetables, seasonal fruits..."
            className="flex-1 bg-transparent outline-none px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {q && (
            <button onClick={() => setQ("")} className="p-1.5 text-slate-400 hover:text-slate-900">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar filters */}
        <aside
          className={cn(
            "lg:block lg:sticky lg:top-28 self-start space-y-6",
            filtersOpen ? "block fixed inset-0 z-50 bg-[#fafaf9] p-6 overflow-y-auto" : "hidden"
          )}
        >
          <div className="flex items-center justify-between lg:hidden mb-4">
            <div className="font-display text-2xl font-bold text-slate-900">Filters</div>
            <button onClick={() => setFiltersOpen(false)} className="p-2 text-slate-900"><X className="w-5 h-5"/></button>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Categories</div>
              <div className="space-y-1">
                <button
                  onClick={() => setCat("all")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-xs transition font-bold",
                    cat === "all" ? "bg-[#067a46] text-white" : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  All Produce
                </button>
                {displayCategories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setCat(c.slug)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-xs transition flex justify-between items-center font-semibold",
                      cat === c.slug ? "bg-[#067a46] text-white font-bold" : "hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className={cat === c.slug ? "text-emerald-100 font-bold" : "text-slate-400"}>
                      {c.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Max Price</div>
              <input
                type="range"
                min={20}
                max={500}
                step={20}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#067a46]"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-bold">
                <span>₹20</span>
                <span>Up to ₹{maxPrice}</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-700 font-bold">
                <input
                  type="checkbox"
                  checked={organicOnly}
                  onChange={(e) => setOrganicOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#067a46] rounded"
                />
                <span>Organic only</span>
              </label>
            </div>

            <button
              onClick={() => {
                setCat("all"); setOrganicOnly(false); setMaxPrice(1000); setQ(""); setSort("popular");
              }}
              className="w-full text-xs text-slate-500 hover:text-[#067a46] underline underline-offset-4 font-bold"
            >
              Reset all filters
            </button>
          </div>
        </aside>

        {/* Results Column */}
        <div>
          {isCurrentCatComingSoon ? (
            <CategoryComingSoon
              category={activeCategoryObj}
              onBrowseVegetables={() => {
                setCat("vegetables");
                setQ("");
              }}
            />
          ) : (
            <>
              {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center shadow-soft">
                  <div className="w-14 h-14 bg-emerald-50 text-[#067a46] rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
                    🌱
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">
                    No matching produce found
                  </h3>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">
                    Try searching for staple vegetables like tomatoes, potatoes, onions, carrots, or seasonal fruits.
                  </p>
                  <button
                    onClick={() => { setQ(""); setCat("all"); }}
                    className="px-5 py-2.5 rounded-full bg-[#067a46] text-white font-bold text-xs hover:bg-[#046338]"
                  >
                    View All Produce
                  </button>
                </div>
              ) : (
                <motion.div
                  layout
                  className={cn(
                    "grid gap-4 md:gap-5",
                    grid === 4
                      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  )}
                >
                  <AnimatePresence>
                    {filtered.map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ProductCard product={p} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      <NotifyMeModal
        isOpen={!!notifyProduct}
        onClose={() => setNotifyProduct(null)}
        productName={notifyProduct || ""}
      />
      <OrderTomorrowModal
        isOpen={!!orderTomorrowProduct}
        onClose={() => setOrderTomorrowProduct(null)}
        productName={orderTomorrowProduct || ""}
      />
    </>
  );
}
