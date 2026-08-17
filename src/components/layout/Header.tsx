"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  PhoneCall,
  MapPin,
  ChevronDown,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { useCart } from "@/store/shop";
import { useCustomerAuth } from "@/store/customerAuth";
import { products } from "@/data/catalog";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FlashKartLogo } from "./FlashKartLogo";

const cities = ["Gandhinagar", "Ahmedabad", "Surat", "Vadodara", "Rajkot"];

const moreLinks = [
  { label: "Who We Supply", href: "/where-we-supply" },
  { label: "Franchise", href: "/franchise" },
  { label: "Bulk Order", href: "/bulk" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, openLoginModal, user } = useCustomerAuth();


  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Gandhinagar");
  const [locationOpen, setLocationOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const rawItemCount = useCart((s) => s.itemCount());
  const openCart = useCart((s) => s.open);

  // Persisted stores (cart, auth) differ between server render and hydration —
  // show their values only after mount so the first client render matches SSR.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const itemCount = hydrated ? rawItemCount : 0;
  const showAuthed = hydrated && isAuthenticated;

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setLocationOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = query.trim()
    ? products
        .filter((p) =>
          (p.name + " " + p.subcategory + " " + p.category)
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <>
      {/* Main Header Container */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        
        {/* Top Header Row: Delivery Location on Top Right */}
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-1.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="hidden sm:flex items-center gap-2 text-slate-500 font-medium">
            <span>🇮🇳</span>
            <span>Fresh Vegetables & Seasonal Fruits Supply across Gujarat</span>
          </div>

          {/* Delivery Location Selector */}
          <div className="ml-auto relative" ref={locationRef}>
            <button
              onClick={() => setLocationOpen(!locationOpen)}
              className="flex items-center gap-1.5 text-slate-700 hover:text-[#067a46] font-medium transition py-0.5 px-2 rounded-lg hover:bg-emerald-50/60"
            >
              <MapPin className="w-4 h-4 text-[#067a46] shrink-0" />
              <span>Deliver to:</span>
              <span className="font-extrabold text-[#067a46]">
                {selectedLocation}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-[#067a46] transition-transform duration-200",
                  locationOpen && "rotate-180"
                )}
              />
            </button>

            {/* City Selection Dropdown */}
            <AnimatePresence>
              {locationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select City
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedLocation(city);
                        setLocationOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition",
                        selectedLocation === city
                          ? "bg-emerald-50 text-[#067a46]"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span>{city}</span>
                      {selectedLocation === city && (
                        <Check className="w-3.5 h-3.5 text-[#067a46]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Navigation Row */}
        <div className="w-full px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden p-2 -ml-2 text-slate-800 rounded-xl hover:bg-slate-100 transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo - Existing FlashKart Logo intact (tagline hidden on tiny screens for fit) */}
          <div className="shrink-0">
            <FlashKartLogo size="md" showTagline={true} taglineClassName="hidden xs:flex" />
          </div>

          {/* Large Responsive Search Bar (Center) */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 max-w-2xl hidden md:block"
          >
            <div className="flex items-center bg-white border border-[#067a46] focus-within:ring-2 focus-within:ring-[#067a46]/20 rounded-xl px-3.5 py-2.5 transition shadow-2xs">
              <Search className="w-4 h-4 text-[#067a46] shrink-0 mr-2.5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for vegetables, fruits, dairy products..."
                className="w-full bg-transparent outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions */}
            {query && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50">
                {suggestions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No items found matching "{query}"
                  </div>
                ) : (
                  suggestions.map((s) => (
                    <Link
                      key={s.id}
                      href={`/product/${s.slug}`}
                      onClick={() => setQuery("")}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50/60 transition border-b border-slate-100 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-full h-full object-contain p-0.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {s.name}
                        </div>
                        <div className="text-[10px] font-semibold text-[#067a46]">
                          ₹{s.weights[0].price} / {s.weights[0].label}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </form>

          {/* Right Action Items */}
          <div className="flex items-center gap-1 xs:gap-2 sm:gap-4 shrink-0">
            



            {/* Login / Signup */}
            <button
              onClick={() => {
                if (isAuthenticated) router.push("/account");
                else openLoginModal("/account");
              }}
              className="flex items-center gap-2 text-slate-800 hover:text-[#067a46] font-bold text-xs sm:text-sm py-1.5 px-1 xs:px-2 rounded-xl hover:bg-slate-50 transition"
            >
              <User className="w-5 h-5 text-slate-700" />
              <span className="hidden sm:inline">
                {showAuthed
                  ? user?.name
                    ? user.name.split(" ")[0]
                    : "Account"
                  : "Login / Signup"}
              </span>
            </button>

            {/* Divider */}
            <span className="h-5 w-[1px] bg-slate-200 hidden lg:inline-block" />

            {/* More Menu Dropdown */}
            <div className="relative hidden lg:block" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="flex items-center gap-1.5 text-slate-800 hover:text-[#067a46] font-bold text-xs sm:text-sm py-1.5 px-2 rounded-xl hover:bg-slate-50 transition"
              >
                <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 shrink-0">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </div>
                <span>More</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-slate-500 transition-transform duration-200",
                    moreOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50"
                  >
                    {moreLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "block px-3.5 py-2 text-xs font-bold rounded-lg transition",
                          pathname === link.href
                            ? "bg-emerald-50 text-[#067a46]"
                            : "text-slate-700 hover:bg-slate-50 hover:text-[#067a46]"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart with Item Count Badge */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 text-slate-800 hover:text-[#067a46] font-bold text-xs sm:text-sm py-1.5 px-1 xs:px-2 rounded-xl hover:bg-slate-50 transition relative"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-slate-700" />
                <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-[#16a34a] text-white text-[10px] font-black shadow-xs">
                  {itemCount}
                </span>
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>

            {/* Green "Get in Touch" Button */}
            <Link
              href="/contact"
              className="bg-[#067a46] hover:bg-[#046338] text-white font-extrabold px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-sm hover:shadow-md active:scale-95 shrink-0"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span className="hidden lg:inline">Get in Touch</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="px-4 pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center bg-white border border-[#067a46] rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-[#067a46] shrink-0 mr-2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vegetables, fruits, dairy..."
                className="w-full bg-transparent outline-none text-xs text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>
          </form>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <FlashKartLogo size="sm" />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-emerald-50/60 border-b border-emerald-100/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin className="w-4 h-4 text-[#067a46]" />
                  <span>Deliver to:</span>
                  <span className="text-[#067a46]">{selectedLocation}</span>
                </div>
              </div>

              <nav className="p-4 space-y-1 text-sm font-bold flex-1 overflow-y-auto">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-800 hover:bg-emerald-50 hover:text-[#067a46] transition"
                >
                  Home
                </Link>
                <Link
                  href="/shop?cat=vegetables"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-800 hover:bg-emerald-50 hover:text-[#067a46] transition"
                >
                  Vegetables
                </Link>
                <Link
                  href="/shop?cat=fruits"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-800 hover:bg-emerald-50 hover:text-[#067a46] transition"
                >
                  Fruits
                </Link>
                <Link
                  href="/shop?cat=dairy"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-800 hover:bg-emerald-50 hover:text-[#067a46] transition"
                >
                  Dairy Products
                </Link>

                <div className="my-3 border-t border-slate-100 pt-2" />

                {moreLinks.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-[#067a46] transition"
                  >
                    {n.label}
                  </Link>
                ))}

                <div className="my-4 border-t border-slate-100 pt-3" />

                <Link
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#067a46] text-white py-3 rounded-xl font-bold text-sm shadow-sm"
                >
                  <PhoneCall className="w-4 h-4" /> Get in Touch
                </Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

