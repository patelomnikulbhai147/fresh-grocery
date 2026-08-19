"use client";
import Link from "next/link";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";
import { FlashKartLogo } from "./FlashKartLogo";

/* Brand icons — lucide-react (v1) no longer ships Facebook/Instagram/X marks,
   so these are inline SVGs (no new dependency). currentColor inherits text color. */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

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
  { label: "Business / B2B", href: "/where-we-supply" },
  { label: "Policies", href: "/policies" },
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
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#ea580c] text-white grid place-items-center transition">
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#ea580c] text-white grid place-items-center transition">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter / X"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#ea580c] text-white grid place-items-center transition">
              <XIcon className="w-4 h-4" />
            </a>
            <a href="https://wa.me/919773271029" target="_blank" rel="noreferrer" aria-label="WhatsApp"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#16a34a] text-white grid place-items-center transition">
              <MessageCircle className="w-4 h-4" />
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
