import type { Metadata } from "next";
import { BulkPage } from "@/components/bulk/BulkPage";
import { getCustomerProductsSafe } from "@/lib/serverCatalog";

// Wholesale catalogue reads live from the production database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wholesale & Bulk Produce Orders · FlashKart",
  description:
    "Direct wholesale vegetable and fruit supply for hostels, PGs, hotel kitchens, caterers, and retail shops in Gandhinagar, Gujarat.",
};

export default async function Page() {
  const live = await getCustomerProductsSafe();
  const products = live.ok
    ? live.products.filter((p) => p.modes.includes("bulk"))
    : null;
  return (
    <div className="min-h-screen bg-[#fafaf9] text-purple-950 flex flex-col">
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 md:px-8 py-10 md:py-14">
        <BulkPage products={products} />
      </main>
    </div>
  );
}
