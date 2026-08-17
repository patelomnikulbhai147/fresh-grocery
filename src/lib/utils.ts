import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...args: ClassValue[]) => twMerge(clsx(args));

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Human-readable weight from integer grams.
 * 10000 → "10 kg" · 9500 → "9.5 kg" · 1250 → "1.25 kg" · 750 → "750 g"
 */
export const formatWeight = (grams: number): string => {
  const g = Math.max(0, Math.round(grams));
  if (g < 1000) return `${g} g`;
  const kg = g / 1000;
  const rounded = Math.round(kg * 100) / 100;
  return `${rounded} kg`;
};

export const percentOff = (mrp: number, price: number) =>
  Math.max(0, Math.round(((mrp - price) / mrp) * 100));
