import type { Metadata } from "next";
import { BulkPage } from "@/components/bulk/BulkPage";

export const metadata: Metadata = {
  title: "Wholesale & Bulk Produce Orders · FlashKart",
  description:
    "Direct wholesale vegetable and fruit supply for hostels, PGs, hotel kitchens, caterers, and retail shops in Gandhinagar, Gujarat.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-purple-950 flex flex-col">
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 md:px-8 py-10 md:py-14">
        <BulkPage />
      </main>
    </div>
  );
}
