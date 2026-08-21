import type { Metadata } from "next";
import { SubscriptionPage } from "@/components/subscription/SubscriptionPage";
import { getCustomerProductsSafe } from "@/lib/serverCatalog";

// Subscription catalogue reads live from the production database.
export const dynamic = "force-dynamic";

// This page is a B2B produce-supply scheduler ("Scheduled daily produce for
// hostels & kitchens"), NOT a dairy page — metadata describes the real service.
// No milk/dairy claims, and no invented prices, quantities, or delivery times.
export const metadata: Metadata = {
  title: "Daily Produce Supply for Hostels & Kitchens",
  description:
    "Schedule daily-morning supply of fresh vegetables, leafy greens and seasonal fruits for hostel messes, PG accommodations and hotel kitchens in Gandhinagar.",
  alternates: { canonical: "/subscription" },
  robots: { index: true, follow: true },
};

export default async function Page() {
  const live = await getCustomerProductsSafe();
  const products = live.ok
    ? live.products.filter((p) => p.modes.includes("subscription"))
    : null;
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-14">
        <SubscriptionPage products={products} />
      </main>
    </div>
  );
}
