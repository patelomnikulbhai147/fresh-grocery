import type { Metadata } from "next";
import { SubscriptionPage } from "@/components/subscription/SubscriptionPage";
import { getCustomerProductsSafe } from "@/lib/serverCatalog";

// Subscription catalogue reads live from the production database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dairy Subscription · Farm-fresh milk every morning",
  description:
    "Subscribe to farm-fresh A2 milk, paneer, curd and more. Delivered every morning before 7 AM in Ahmedabad and Gandhinagar.",
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
