import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CustomerAuthGuard } from "@/components/auth/CustomerAuthGuard";

export const metadata: Metadata = {
  title: "Order Fulfillment & Checkout · FlashKart",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-purple-950 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 md:px-8 py-10 md:py-14">
        <CustomerAuthGuard>
          <CheckoutForm />
        </CustomerAuthGuard>
      </main>
      <Footer />
    </div>
  );
}
