import type { Metadata } from "next";
import type { ReactNode } from "react";

// The where-we-supply page is a Client Component and cannot export metadata,
// so this server layout supplies its SEO tags. Copy reflects the page's own
// content — real service areas only (Gandhinagar); no invented cities.
export const metadata: Metadata = {
  title: "Where We Supply — Fresh Produce for Hostels, Hotels & Shops",
  description:
    "FlashKart delivers daily-morning fresh vegetables and seasonal fruits to institutional messes, hotel kitchens, PGs, and retail shops across Gandhinagar, Gujarat — reliable direct supply at better rates.",
  alternates: { canonical: "/where-we-supply" },
  openGraph: {
    title: "Where FlashKart Currently Supplies",
    description:
      "Daily fresh vegetable and fruit supply for hostels, PGs, hotel kitchens, and retail shops across Gandhinagar.",
  },
  robots: { index: true, follow: true },
};

export default function WhereWeSupplyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
