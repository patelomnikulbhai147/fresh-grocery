"use client";
import { useAccountSync } from "@/lib/useAccountSync";

/**
 * Invisible mount point for {@link useAccountSync}. Kept in the root layout so
 * the logged-in customer's addresses/wishlist/cart stay synced with the server
 * on every page. Renders nothing.
 */
export function AccountSync() {
  useAccountSync();
  return null;
}
