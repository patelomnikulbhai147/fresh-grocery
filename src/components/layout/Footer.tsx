"use client";
import Link from "next/link";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { FlashKartLogo } from "./FlashKartLogo";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Vegetables", href: "/shop?cat=vegetables" },
  { label: "Fruits", href: "/shop?cat=fruits" },
  { label: "Who We Supply", href: "/where-we-supply" },
];

const servicesLinks = [
  { label: "Hostels & PGs", href: "/where-we-supply#hostels-pgs" },
  { label: "Hotels", href: "/where-we-supply#hotels" },
  { label: "Shops", href: "/where-we-supply#shops" },
  { label: "Franchise", href: "/franchise" },
  { label: "Bulk Supply", href: "/bulk" },
];

export function Footer() {
  return (
    <footer className="relative bg-[#042a1a] text-[#e2f7ed] overflow-hidden select-none">
      
      {/* Main Footer Container */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
        
        {/* Brand Column */}
        <div className="lg:col-span-1 space-y-4">
          <FlashKartLogo variant="dark" size="md" showTagline={true} />
          
          <p className="text-xs text-[#a3e6c5] leading-relaxed">
            Supplying fresh vegetables and seasonal fruits to Hostels, PGs, Hotels and Shops.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#16a34a] text-white grid place-items-center transition text-xs"
            >
              f
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#16a34a] text-white grid place-items-center transition text-xs"
            >
              📸
            </a>
            <a
              href="https://wa.me/919773271029"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#16a34a] text-white grid place-items-center transition text-xs"
            >
              💬
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-800/60 pb-2">
            Quick Links
          </div>
          <ul className="space-y-2 text-xs font-medium">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[#a3e6c5] hover:text-white transition">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Our Services */}
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-800/60 pb-2">
            Our Services
          </div>
          <ul className="space-y-2 text-xs font-medium">
            {servicesLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[#a3e6c5] hover:text-white transition">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-800/60 pb-2">
            Contact Us
          </div>
          <ul className="space-y-2.5 text-xs text-[#a3e6c5]">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
              <a href="tel:+916352856495" className="hover:text-white font-semibold">
                +91 63528 56495
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
              <a href="tel:+919773271029" className="hover:text-white font-semibold">
                +91 97732 71029
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
              <a href="mailto:flashkart.co@gmail.com" className="hover:text-white font-semibold break-all">
                flashkart.co@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
              <span>Gandhinagar, Gujarat, India</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div>
          <div className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-800/60 pb-2">
            Newsletter
          </div>
          <p className="text-xs text-[#a3e6c5] mb-3 leading-relaxed">
            Subscribe to get updates on new arrivals and offers.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-1.5">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-lg outline-none placeholder:text-slate-400 font-medium"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="bg-[#16a34a] hover:bg-[#15803d] text-white p-2 rounded-lg transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-emerald-900/80 bg-[#031f13] py-4">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#a3e6c5]">
          <div>
            © {new Date().getFullYear()} FlashKart. All Rights Reserved.
          </div>
          <div>
            Made with <span className="text-red-500">❤️</span> for Fresh India
          </div>
        </div>
      </div>

    </footer>
  );
}
