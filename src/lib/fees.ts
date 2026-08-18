/**
 * FlashKart checkout fee structure — the SINGLE SOURCE OF TRUTH.
 *
 * The customer UI (product card, cart, checkout) displays charges computed by
 * `computeOrderCharges`, but the SERVER (/api/checkout/place) re-runs the exact
 * same function against server-side prices and is the authority on the payable
 * amount. Nothing hardcodes these numbers anywhere else.
 */
export const FEE_CONFIG = {
  /** Flat delivery fee when the items subtotal does NOT clear the threshold. */
  deliveryFee: 30,
  /**
   * Free delivery applies only when subtotal is STRICTLY GREATER than this.
   * ₹150 → still ₹30; ₹151 → free. (subtotal <= threshold ⇒ paid delivery)
   */
  freeDeliveryThreshold: 150,
  /** Fixed per-order handling fee. */
  handlingFee: 5,
  /** Fixed per-order convenience fee. */
  convenienceFee: 5,
} as const;

export type OrderCharges = {
  subtotal: number;
  deliveryFee: number;
  handlingFee: number;
  convenienceFee: number;
  /** Optional coupon/discount already subtracted before fees (0 if none). */
  couponDiscount: number;
  total: number;
  /** true when delivery is free (subtotal cleared the threshold). */
  freeDelivery: boolean;
};

/**
 * Computes every checkout charge from the items subtotal.
 * @param subtotal   Sum of (selling price × quantity) across all cart lines.
 * @param couponDiscount  Amount already validated to subtract (defaults to 0).
 */
export function computeOrderCharges(subtotal: number, couponDiscount = 0): OrderCharges {
  const cleanSubtotal = Math.max(0, Math.round(subtotal));
  const discount = Math.max(0, Math.min(Math.round(couponDiscount), cleanSubtotal));

  // Delivery threshold is evaluated on the ITEMS subtotal (pre-coupon), per spec.
  const freeDelivery = cleanSubtotal > FEE_CONFIG.freeDeliveryThreshold;
  const deliveryFee = freeDelivery ? 0 : FEE_CONFIG.deliveryFee;
  const handlingFee = FEE_CONFIG.handlingFee;
  const convenienceFee = FEE_CONFIG.convenienceFee;

  const total = Math.max(
    0,
    cleanSubtotal - discount + deliveryFee + handlingFee + convenienceFee
  );

  return {
    subtotal: cleanSubtotal,
    deliveryFee,
    handlingFee,
    convenienceFee,
    couponDiscount: discount,
    total,
    freeDelivery,
  };
}

/**
 * Message nudging the customer toward free delivery.
 * Returns null when delivery is already free (don't show anything).
 */
export function freeDeliveryHint(subtotal: number): string | null {
  const s = Math.max(0, Math.round(subtotal));
  if (s > FEE_CONFIG.freeDeliveryThreshold) return null;
  // Need to reach threshold + 1 (₹151 for a ₹150 threshold).
  const needed = FEE_CONFIG.freeDeliveryThreshold + 1 - s;
  return `Add ₹${needed} more for FREE delivery`;
}
