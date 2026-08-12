import Link from "next/link";
import {
  ShieldCheck,
  Leaf,
  Store,
  Phone,
  Mail,
  MapPin,
  Building,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { FlashKartLogo } from "./FlashKartLogo";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/shop" },
  { label: "Where We Supply", href: "/where-we-supply" },
  { label: "Franchise Opportunity", href: "/franchise" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const categoriesLinks = [
  { label: "Fresh Vegetables", href: "/shop?cat=vegetables" },
  { label: "Seasonal Fruits", href: "/shop?cat=fruits" },
  { label: "Leafy Greens", href: "/shop?cat=leafy-greens" },
  { label: "Exotic & Salad Veggies", href: "/shop?cat=exotic" },
  { label: "Certified Organic Produce", href: "/shop?cat=organic" },
];

const supplySegments = [
  { label: "Hostels & PGs Supply", href: "/where-we-supply#hostels-pgs" },
  { label: "Hotels & Kitchens", href: "/where-we-supply#hotels" },
  { label: "Retail Shops & Marts", href: "/where-we-supply#shops" },
  { label: "Institutional Inquiries", href: "/contact" },
];

export function Footer() {
  return (
    <>
      {/* Tricolor Independence Day Footer Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-india-saffron via-white to-india-green" />
      <footer className="relative bg-purple-950 text-purple-100 overflow-hidden">
      {/* Background Decorative Glow */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, #a855f7 0, transparent 40%), radial-gradient(circle at 85% 80%, #f59e0b 0, transparent 45%)",
        }}
      />

      {/* Top Banner Band */}
      <div className="relative border-b border-purple-900/60 bg-purple-900/40">
        <div className="mx-auto max-w-7xl px-6 py-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Best Quality • Best Rate • Best Service
            </div>
            <h3 className="font-display text-2xl md:text-3xl text-white font-bold">
              Looking for Fresh Produce Supply in Gandhinagar?
            </h3>
            <p className="text-purple-200 mt-1 text-sm">
              We supply fresh vegetables and seasonal fruits directly to hostels, PGs, hotels, and shops.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Link
              href="/contact"
              className="bg-amber-500 hover:bg-amber-400 text-purple-950 font-bold px-6 py-3 rounded-full text-xs md:text-sm transition shadow-md flex items-center gap-2"
            >
              Get Daily Supply Rates <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/franchise"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-full text-xs md:text-sm border border-white/20 transition"
            >
              Franchise Inquiries
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="relative mx-auto max-w-7xl px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Information */}
        <div className="lg:col-span-2 space-y-4">
          <FlashKartLogo variant="dark" size="lg" showTagline={true} />
          
          <p className="text-purple-200 text-sm leading-relaxed max-w-sm">
            FlashKart is a modern fresh produce brand focused on supplying carefully selected fresh vegetables and seasonal fruits at fair rates directly to hostels, PGs, hotels, and retail shops.
          </p>

          <div className="flex flex-wrap gap-2 text-xs pt-1">
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Direct Farm Sourcing
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-purple-200">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Quality Checked
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-purple-200">
              <Building className="w-3.5 h-3.5 text-purple-300" /> Hostels & Hotels
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-purple-200">
              <Store className="w-3.5 h-3.5 text-amber-300" /> Shop Franchise
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</div>
          <ul className="space-y-2.5 text-xs font-semibold">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-purple-200 hover:text-amber-300 transition">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider mb-4">Fresh Produce</div>
          <ul className="space-y-2.5 text-xs font-semibold">
            {categoriesLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-purple-200 hover:text-amber-300 transition">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Direct Contact Details */}
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact FlashKart</div>
          <ul className="space-y-3 text-xs text-purple-200">
            <li className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <a href="tel:+916352856495" className="font-bold hover:text-white block">
                  6352856495
                </a>
                <span className="text-[11px] text-purple-300">Kaushik Patel</span>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <a href="tel:+919773271029" className="font-bold hover:text-white block">
                  9773271029
                </a>
                <span className="text-[11px] text-purple-300">Om Patel</span>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <a href="mailto:flashkart.co@gmail.com" className="font-bold hover:text-white break-all">
                  flashkart.co@gmail.com
                </a>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Gandhinagar, Gujarat, India</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-purple-900/60 bg-purple-950/80">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-purple-300">
          <div>
            © {new Date().getFullYear()} FlashKart. All rights reserved. • Fresh Vegetables & Seasonal Fruits
          </div>
          <div className="text-[11px] text-purple-300 font-medium">
            Gandhinagar, Gujarat • Direct Supply & Franchise Partner Network
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
