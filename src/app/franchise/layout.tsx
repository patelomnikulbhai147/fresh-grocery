import type { Metadata } from "next";
import type { ReactNode } from "react";

// The franchise page itself is a Client Component and cannot export metadata,
// so this server layout supplies its SEO tags. Copy is taken from the page's
// own hero content — no invented fees, earnings, counts, or locations.
export const metadata: Metadata = {
  title: "Franchise Partnership — Start a Fresh Produce Business",
  description:
    "Become a FlashKart franchise partner and build your own fresh vegetables and seasonal fruits business with our established brand identity, direct supply network, and operational guidance in Gandhinagar, Gujarat.",
  alternates: { canonical: "/franchise" },
  openGraph: {
    title: "Franchise Partnership — Grow With FlashKart",
    description:
      "Start your own FlashKart fresh-produce shop with our brand, direct supply network, and operational support.",
  },
  robots: { index: true, follow: true },
};

export default function FranchiseLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
