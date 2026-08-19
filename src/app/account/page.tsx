import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { CustomerAuthGuard } from "@/components/auth/CustomerAuthGuard";

// Interactive, user-specific page — never edge-cache the HTML shell (a
// statically prerendered shell was being cached for a year, so after a deploy
// customers kept getting the OLD JavaScript bundle / UI). Always serve fresh.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account · FlashKart",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-purple-950 flex flex-col">
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 md:px-8 py-10 md:py-14">
        <CustomerAuthGuard>
          <AccountShell />
        </CustomerAuthGuard>
      </main>
    </div>
  );
}
