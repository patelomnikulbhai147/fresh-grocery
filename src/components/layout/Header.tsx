"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  MapPin,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Leaf,
  Phone,
  Info,
  ShieldCheck,
  Building,
  Store,
  Tag,
} from "lucide-react";
import { useCart, useCity } from "@/store/shop";
import { useCustomerAuth } from "@/store/customerAuth";
import { products, categories, cities } from "@/data/catalog";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FlashKartLogo } from "./FlashKartLogo";
import { CityModal } from "@/components/city/CityModal";

const nav = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/shop" },
  { label: "Where We Supply", href: "/where-we-supply" },
  { label: "Franchise", href: "/franchise" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const router = useRouter();
  const { isAuthenticated, openLoginModal, user } = useCustomerAuth();
  const isAdmin = user?.mobile === "9773271029" || user?.mobile?.includes("9773271029") || user?.email === "admin@flashkart.co";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [query, setQuery] = useState("");

  const itemCount = useCart((s) => s.itemCount());
  const openCart = useCart((s) => s.open);
  const citySlug = useCity((s) => s.slug);
  const currentCity = cities.find((c) => c.slug === citySlug) ?? cities[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const suggestions = query.trim()
    ? products
        .filter((p) =>
          (p.name + " " + p.subcategory + " " + p.category).toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <>
      {/* Tricolor Independence Day Header Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-india-saffron via-white to-india-green" />
      
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "glass-strong shadow-sm border-b border-slate-200"
            : "bg-white/95 backdrop-blur-md border-b border-slate-100"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center gap-3 md:gap-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden p-2 -ml-2 text-navy-950 rounded-xl hover:bg-india-green/10 transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <div className="shrink-0">
            <FlashKartLogo size="md" showTagline={true} />
          </div>

          {/* Location Hub */}
          <button
            onClick={() => setCityOpen(true)}
            className="hidden lg:flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-full hover:bg-india-green/10 text-xs text-navy-900 border border-slate-200 hover:border-india-green/30 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-india-saffron shrink-0" />
            <div className="text-left leading-tight">
              <div className="text-[9px] uppercase tracking-wider text-india-green font-bold">Supply Hub</div>
              <div className="font-bold text-navy-900">{currentCity.name}</div>
            </div>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) {
                router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
                setQuery("");
              }
            }}
            className="flex-1 max-w-md relative hidden md:block"
          >
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full pl-4 pr-1.5 py-1.5 focus-within:border-india-green/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-india-green/20 transition">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fresh vegetables, fruits..."
                className="flex-1 bg-transparent outline-none px-2.5 text-xs text-navy-950 placeholder:text-slate-400 font-medium"
              />
              <button
                type="submit"
                className="text-xs font-bold text-white bg-india-saffron hover:bg-orange-500 px-3.5 py-1.5 rounded-full transition shadow-sm"
              >
                Search
              </button>
            </div>

            {query && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-strong border border-slate-200 rounded-2xl shadow-lift overflow-hidden z-50">
                {suggestions.length === 0 ? (
                  <div className="p-4 text-center text-xs">
                    <div className="font-bold text-navy-950 mb-1">No direct active matches for "{query}"</div>
                    <p className="text-slate-500 mb-2">Check all fresh vegetables and seasonal fruits in our catalog.</p>
                    <Link
                      href={`/shop?q=${encodeURIComponent(query.trim())}`}
                      onClick={() => setQuery("")}
                      className="inline-block px-3 py-1.5 rounded-full bg-navy-900 text-white text-[11px] font-bold"
                    >
                      Browse Catalog →
                    </Link>
                  </div>
                ) : (
                  <>
                    {suggestions.map((s) => (
                      <Link
                        key={s.id}
                        href={`/product/${s.slug}`}
                        onClick={() => setQuery("")}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition border-b border-slate-100 last:border-0"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                          <img src={s.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-navy-950 truncate">{s.name}</div>
                          <div className="text-[10px] text-slate-500">{s.subcategory}</div>
                        </div>
                        <div className="text-xs font-black text-navy-900">₹{s.weights[0].price}</div>
                      </Link>
                    ))}
                    <Link
                      href={`/shop?q=${encodeURIComponent(query.trim())}`}
                      onClick={() => setQuery("")}
                      className="block text-center py-2 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-navy-900 border-t border-slate-200 transition"
                    >
                      View all results for "{query}" →
                    </Link>
                  </>
                )}
              </div>
            )}
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-bold">
            <Link href="/" className="px-3 py-2 rounded-full hover:bg-india-green/10 text-navy-950 transition">
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setCatsOpen(true)}
                onMouseLeave={() => setCatsOpen(false)}
                className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-india-green/10 text-navy-950 transition"
              >
                Products
                <ChevronDown className={cn("w-3 h-3 transition", catsOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {catsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    onMouseEnter={() => setCatsOpen(true)}
                    onMouseLeave={() => setCatsOpen(false)}
                    className="absolute top-full left-0 mt-1 w-[460px] bg-white rounded-2xl shadow-lift border border-slate-200 p-3 grid grid-cols-2 gap-1.5 z-50"
                  >
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/shop?cat=${c.slug}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-india-green/5 transition"
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                          <img src={c.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-navy-950">{c.name}</div>
                          <div className="text-[10px] text-slate-500">{c.count} items</div>
                        </div>
                      </Link>
                    ))}
                    <div className="col-span-2 pt-2 border-t border-slate-100 mt-1">
                      <Link
                        href="/shop"
                        className="block text-center py-1.5 rounded-lg bg-slate-50 text-navy-900 font-bold text-xs hover:bg-slate-100"
                      >
                        View All Fresh Produce →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/where-we-supply" className="px-3 py-2 rounded-full hover:bg-india-green/10 text-navy-950 transition">
              Where We Supply
            </Link>

            <Link
              href="/franchise"
              className="px-3 py-2 rounded-full bg-orange-50 text-orange-900 border border-orange-200/80 hover:bg-orange-100 transition flex items-center gap-1 font-extrabold"
            >
              <Store className="w-3.5 h-3.5 text-india-saffron" /> Franchise
            </Link>

            <Link href="/about" className="px-3 py-2 rounded-full hover:bg-india-green/10 text-navy-950 transition">
              About Us
            </Link>

            <Link href="/contact" className="px-3 py-2 rounded-full hover:bg-india-green/10 text-navy-950 transition">
              Contact
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {isAuthenticated && isAdmin && (
              <Link
                href="/admin"
                title="Go to FlashKart Admin Portal"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-navy-900 to-indigo-900 text-white rounded-full text-xs font-bold hover:shadow-md transition shadow-sm mr-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-india-green" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="md:hidden p-2.5 text-navy-950 hover:bg-india-green/10 rounded-full transition"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (isAuthenticated) router.push("/account");
                else openLoginModal("/account");
              }}
              aria-label="Account"
              className="hidden sm:grid place-items-center p-2.5 text-navy-950 hover:bg-india-green/10 rounded-full transition"
            >
              <User className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (isAuthenticated) router.push("/account?tab=wishlist");
                else openLoginModal("/account?tab=wishlist");
              }}
              aria-label="Wishlist"
              className="relative p-2.5 text-navy-950 hover:bg-india-green/10 rounded-full transition"
            >
              <Heart className="w-5 h-5" />
            </button>

            <button
              onClick={openCart}
              aria-label="Cart"
              className="relative p-2.5 text-navy-950 hover:bg-india-green/10 rounded-full transition"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-india-saffron text-white text-[10px] font-black"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Trigger */}
        <div className="md:hidden px-4 pb-2.5">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-400 font-medium"
          >
            <Search className="w-3.5 h-3.5" /> Search fresh vegetables and seasonal fruits...
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 w-[86%] max-w-sm bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 flex items-center justify-between border-b border-slate-100">
                <FlashKartLogo size="sm" />
                <button onClick={() => setMenuOpen(false)} className="p-2 text-navy-950">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50/60 border-b border-slate-100">
                <div className="text-[11px] font-bold text-navy-950 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-india-green" /> Gandhinagar Main Hub
                </div>
                <div className="text-xs text-slate-500">Supplying Hostels, PGs, Hotels & Shops</div>
              </div>

              <nav className="p-4 space-y-1 text-sm font-bold flex-1 overflow-y-auto">
                {nav.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-navy-950 hover:bg-india-green/10 transition"
                  >
                    {n.label}
                  </Link>
                ))}

                <div className="my-2 border-t border-slate-100 pt-2" />

                <div className="text-[11px] uppercase font-bold text-slate-400 px-3 mb-1">Direct Contact</div>
                <a href="tel:+916352856495" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-navy-900 font-semibold">
                  📞 6352856495 (Kaushik Patel)
                </a>
                <a href="tel:+919773271029" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-navy-900 font-semibold">
                  📞 9773271029 (Om Patel)
                </a>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white p-4 md:hidden"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) {
                  router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
                  setSearchOpen(false);
                  setQuery("");
                }
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-full pl-4 pr-2 py-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search fresh vegetables, fruits..."
                  className="flex-1 bg-transparent outline-none px-2 text-xs text-navy-950 font-medium"
                />
                <button type="submit" className="text-xs font-bold text-white bg-india-saffron px-3 py-1 rounded-full">
                  Go
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="text-xs font-bold text-navy-900 px-2"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* City Modal */}
      <CityModal open={cityOpen} onClose={() => setCityOpen(false)} />
    </>
  );
}
