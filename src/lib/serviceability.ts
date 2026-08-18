import { cities } from "@/data/catalog";

/**
 * Single source of truth for delivery serviceability — a pincode is serviceable
 * if it starts with a prefix of any LIVE city. Used by BOTH the checkout form
 * (instant feedback) and the backend order gate (final authority §9).
 */
export function isServiceablePincode(pin: string): boolean {
  const p = (pin || "").replace(/\D/g, "");
  if (p.length < 6) return false;
  return cities.some((c) => c.live && (c.pincode || []).some((prefix) => p.startsWith(prefix)));
}

/** Human list of serviceable areas for error messages. */
export function serviceableAreasLabel(): string {
  return "Gandhinagar (3820xx / 3824xx) and Ahmedabad (3800xx)";
}
