import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccountShell } from "@/components/account/AccountShell";
import { CustomerAuthGuard } from "@/components/auth/CustomerAuthGuard";

export const metadata: Metadata = {
  title: "My Account · FlashKart",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-purple-950 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 md:px-8 py-10 md:py-14">
        <CustomerAuthGuard>
          <AccountShell />
        </CustomerAuthGuard>
      </main>
      <Footer />
    </div>
  );
}
