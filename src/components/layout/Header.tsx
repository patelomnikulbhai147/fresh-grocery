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
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { useCart, useCity } from "@/store/shop";
import { useCustomerAuth } from "@/store/customerAuth";
import { products, categories, cities } from "@/data/catalog";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FlashKartLogo } from "./FlashKartLogo";
import { CityModal } from "@/components/city/CityModal";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Vegetables", href: "/shop?cat=vegetables" },
  { label: "Fruits", href: "/shop?cat=fruits" },
  { label: "Who We Supply", href: "/where-we-supply" },
  { label: "Franchise", href: "/franchise" },
  { label: "Contact Us", href: "/contact" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, openLoginModal, user } = useCustomerAuth();
  const isAdmin = user?.mobile === "9773271029" || user?.mobile?.includes("9773271029") || user?.email === "admin@flashkart.co";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [query, setQuery] = useState("");

  const itemCount = useCart((s) => s.itemCount());
  const openCart = useCart((s) => s.open);
  const citySlug = useCity((s) => s.slug);
  const currentCity = cities.find((c) => c.slug === citySlug) ?? cities[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
      {/* Top Announcement Bar - Reference Mockup Style */}
      <div className="w-full bg-[#063b25] text-white py-1.5 px-4 text-center text-xs font-semibold select-none flex items-center justify-center gap-2 z-50">
        <span>🇮🇳 Celebrate 15 August with Freshness – Supporting a Healthy & Strong India!</span>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300 bg-white",
          scrolled ? "shadow-md border-b border-slate-200" : "border-b border-slate-100"
        )}
      >
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden p-2 -ml-2 text-slate-800 rounded-xl hover:bg-slate-100 transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo - Existing FlashKart Logo intact */}
          <div className="shrink-0">
            <Link href="/" className="block">
              <FlashKartLogo size="md" showTagline={true} />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-700">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "relative py-1 transition-colors hover:text-[#067a46]",
                    isActive ? "text-[#067a46] font-extrabold" : "text-slate-700"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#067a46] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Get in Touch CTA */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) {
                  router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
                  setQuery("");
                }
              }}
              className="relative hidden xl:block w-48"
            >
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 focus-within:border-[#067a46] focus-within:bg-white transition">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search produce..."
                  className="flex-1 bg-transparent outline-none px-2 text-xs text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>

              {query && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  {suggestions.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500">No items found</div>
                  ) : (
                    suggestions.map((s) => (
                      <Link
                        key={s.id}
                        href={`/product/${s.slug}`}
                        onClick={() => setQuery("")}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition border-b border-slate-100 last:border-0"
                      >
                        <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0">
                          <img src={s.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">{s.name}</div>
                          <div className="text-[10px] text-slate-500">₹{s.weights[0].price}</div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </form>

            {isAuthenticated && isAdmin && (
              <Link
                href="/admin"
                title="Go to FlashKart Admin Portal"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#063b25] text-white rounded-full text-xs font-bold hover:bg-[#042a1a] transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin</span>
              </Link>
            )}

            {/* Account Icon */}
            <button
              onClick={() => {
                if (isAuthenticated) router.push("/account");
                else openLoginModal("/account");
              }}
              aria-label="Account"
              className="p-2 text-slate-700 hover:text-[#067a46] rounded-full hover:bg-slate-100 transition"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Cart Icon */}
            <button
              onClick={openCart}
              aria-label="Cart"
              className="relative p-2 text-slate-700 hover:text-[#067a46] rounded-full hover:bg-slate-100 transition"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Primary Get in Touch CTA - Reference Mockup Style */}
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-2 bg-[#067a46] hover:bg-[#046338] text-white font-bold px-5 py-2 rounded-full text-xs sm:text-sm transition shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Get in Touch</span>
            </Link>
          </div>
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
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 flex items-center justify-between border-b border-slate-100">
                <FlashKartLogo size="sm" />
                <button onClick={() => setMenuOpen(false)} className="p-2 text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4 space-y-1 text-sm font-bold flex-1 overflow-y-auto">
                {navLinks.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-800 hover:bg-[#067a46]/10 hover:text-[#067a46] transition"
                  >
                    {n.label}
                  </Link>
                ))}

                <div className="my-4 border-t border-slate-100 pt-3" />

                <Link
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#067a46] text-white py-3 rounded-full font-bold text-sm shadow-sm"
                >
                  <PhoneCall className="w-4 h-4" /> Get in Touch
                </Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* City Modal */}
      <CityModal open={cityOpen} onClose={() => setCityOpen(false)} />
    </>
  );
}
