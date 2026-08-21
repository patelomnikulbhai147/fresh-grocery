import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { JsonLd } from "@/components/seo/JsonLd";
import { CityNotifyAuto } from "@/components/city/CityModal";
import { CustomerLoginModal } from "@/components/auth/CustomerLoginModal";
import { SessionRestore } from "@/components/auth/SessionRestore";
import { AccountSync } from "@/components/account/AccountSync";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RakshaBandhanTheme, RAKSHA_BANDHAN_THEME } from "@/components/theme/RakshaBandhanTheme";

export const metadata: Metadata = {
  metadataBase: new URL("https://flashkart.co"),
  title: {
    default: "FlashKart | Fresh Vegetables & Seasonal Fruits",
    template: "%s · FlashKart",
  },
  description:
    "FlashKart provides fresh vegetables and seasonal fruits with a focus on quality, fair pricing and reliable supply for hostels, PGs, hotels and shops.",
  keywords: [
    "FlashKart",
    "fresh vegetables Gandhinagar",
    "seasonal fruits Gujarat",
    "hostel vegetable supply",
    "PG grocery supply",
    "hotel produce supplier",
    "fresh produce franchise",
    "buy fresh vegetables direct",
    "FlashKart franchise",
  ],
  authors: [{ name: "FlashKart" }],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "FlashKart",
    title: "FlashKart | Fresh Vegetables & Seasonal Fruits",
    description:
      "Quality-focused fresh produce at better rates, supplied through our growing network of hostels, PGs, hotels and shops.",
    images: ["/logo.svg"],
  },
  twitter: {
    card: "summary_large_image",
    // Kept coherent with the site/OG title rather than a separate tagline.
    // NOTE: images is still /logo.svg (SVG) — no suitable 1200×630 raster asset
    // exists yet; a purpose-built social image is still required (see audit).
    title: "FlashKart | Fresh Vegetables & Seasonal Fruits",
    description: "Fresh vegetables and seasonal fruits supplied directly to hostels, PGs, hotels and shops.",
    images: ["/logo.svg"],
  },
  robots: { index: true, follow: true },
  // No root-level canonical: a canonical set here is inherited by every child
  // route, which made all pages (product, shop, category, about, …) declare the
  // homepage as their canonical. Each page now sets its own self-referential
  // canonical; pages that don't are correctly self-canonical by default.
};

const SITE_URL = "https://flashkart.co";

// Shared PostalAddress — real city/region/country only. No street/postcode is
// invented; only the values already published on the site are used.
const postalAddress = {
  "@type": "PostalAddress",
  addressLocality: "Gandhinagar",
  addressRegion: "Gujarat",
  addressCountry: "IN",
};

// Single coherent @graph so Organization, WebSite and the GroceryStore
// storefront are linked by @id rather than emitted as three unrelated entities.
// Every value below is already present on the site — nothing fabricated:
// no opening hours, price range, geo, ratings, or reviews.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "FlashKart",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      description:
        "Fresh vegetables and seasonal fruits supplied directly for hostels, PGs, hotels and shops.",
      address: postalAddress,
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+91-6352856495",
          contactType: "sales and partnerships",
          contactOption: "Kaushik Patel",
          areaServed: "IN",
        },
        {
          "@type": "ContactPoint",
          telephone: "+91-9773271029",
          contactType: "operations and franchise",
          contactOption: "Om Patel",
          areaServed: "IN",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "FlashKart",
      publisher: { "@id": `${SITE_URL}/#organization` },
      // The shop supports a real ?q= product search, so a SearchAction is valid.
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "GroceryStore",
      "@id": `${SITE_URL}/#store`,
      name: "FlashKart",
      url: SITE_URL,
      image: `${SITE_URL}/logo.svg`,
      telephone: "+91-6352856495",
      address: postalAddress,
      // Real, currently-live service hubs only (Gandhinagar main hub, Ahmedabad
      // network hub). Franchise-upcoming cities are intentionally excluded.
      areaServed: [
        { "@type": "City", name: "Gandhinagar" },
        { "@type": "City", name: "Ahmedabad" },
      ],
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`bg-[#fafaf9] text-purple-950 antialiased font-sans${RAKSHA_BANDHAN_THEME ? " rb-theme" : ""}`}>
        {/* Seasonal decoration only — remove after Raksha Bandhan (one flag) */}
        <RakshaBandhanTheme />
        <JsonLd data={structuredData} />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <CityNotifyAuto />
        <CustomerLoginModal />
        <SessionRestore />
        <AccountSync />
        <Toaster />
      </body>
    </html>
  );
}
