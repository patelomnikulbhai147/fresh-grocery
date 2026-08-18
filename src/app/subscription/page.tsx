import type { Metadata } from "next";
import { SubscriptionPage } from "@/components/subscription/SubscriptionPage";

export const metadata: Metadata = {
  title: "Dairy Subscription · Farm-fresh milk every morning",
  description:
    "Subscribe to farm-fresh A2 milk, paneer, curd and more. Delivered every morning before 7 AM in Ahmedabad and Gandhinagar.",
};

export default function Page() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-14">
        <SubscriptionPage />
      </main>
    </div>
  );
}
