"use client";
import Link from "next/link";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { FlashKartLogo } from "./FlashKartLogo";

const instantLinks = [
  { label: "Vegetables", href: "/shop?cat=vegetables" },
  { label: "Fruits", href: "/shop?cat=fruits" },
  { label: "All Categories", href: "/shop" },
  { label: "Track Order", href: "/track" },
];

const bulkLinks = [
  { label: "FlashKart Business", href: "/bulk" },
  { label: "Who We Supply", href: "/where-we-supply" },
  { label: "Franchise", href: "/franchise" },
  { label: "Business Login", href: "/bulk" },
];

const serviceLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Hostels & PGs", href: "/where-we-supply#hostels-pgs" },
  { label: "Hotels", href: "/where-we-supply#hotels" },
];

export function Footer() {
  return (
    <footer className="relative bg-[#1d1237] text-purple-100 overflow-hidden select-none">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">

        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4 max-w-sm">
          <FlashKartLogo variant="dark" size="md" showTagline={true} />
          <p className="text-xs text-purple-200/80 leading-relaxed">
            Your everyday shopping partner — for home and business. Fresh
            vegetables, fruits and essentials delivered across Gandhinagar.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-1">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#ea580c] text-white grid place-items-center transition text-xs">
              f
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#ea580c] text-white grid place-items-center transition text-xs">
              📸
            </a>
            <a href="https://wa.me/919773271029" target="_blank" rel="noreferrer" aria-label="WhatsApp"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#16a34a] text-white grid place-items-center transition text-xs">
              💬
            </a>
          </div>

          {/* Newsletter */}
          <div className="pt-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Subscribe to our newsletter
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-1.5 max-w-xs">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full min-w-0 bg-white text-slate-900 text-xs px-3 py-2.5 rounded-lg outline-none placeholder:text-slate-400 font-medium"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="bg-[#ea580c] hover:bg-[#c2410c] text-white p-2.5 rounded-lg transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Instant Delivery */}
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            Instant Delivery
          </div>
          <ul className="space-y-2 text-xs font-medium">
            {instantLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-purple-200/80 hover:text-white transition">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Bulk Delivery */}
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            Bulk Delivery
          </div>
          <ul className="space-y-2 text-xs font-medium">
            {bulkLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-purple-200/80 hover:text-white transition">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            Customer Service
          </div>
          <ul className="space-y-2 text-xs font-medium mb-4">
            {serviceLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-purple-200/80 hover:text-white transition">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-2.5 text-xs text-purple-200/80">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
              <a href="tel:+916352856495" className="hover:text-white font-semibold">+91 63528 56495</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
              <a href="tel:+919773271029" className="hover:text-white font-semibold">+91 97732 71029</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
              <a href="mailto:flashkart.co@gmail.com" className="hover:text-white font-semibold break-all">
                flashkart.co@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
              <span>Gandhinagar, Gujarat, India</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-[#160d2b] py-4">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-purple-200/70">
          <div>© {new Date().getFullYear()} FlashKart.co · All Rights Reserved.</div>
          <div>
            FlashKart NOW · FlashKart BUSINESS — <span className="text-[#ea580c] font-bold">Fresh. Fast. Reliable.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
