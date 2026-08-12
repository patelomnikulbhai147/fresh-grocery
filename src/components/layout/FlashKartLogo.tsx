import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FlashKartLogoProps {
  className?: string;
  variant?: "light" | "dark" | "full" | "iconOnly";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

export function FlashKartLogo({
  className,
  variant = "light",
  showTagline = true,
  size = "md",
  href = "/",
}: FlashKartLogoProps) {
  const isDark = variant === "dark";

  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
    xl: "h-14",
  };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const taglineSizes = {
    sm: "text-[8px] tracking-[0.18em]",
    md: "text-[9px] tracking-[0.22em]",
    lg: "text-[10px] tracking-[0.24em]",
    xl: "text-xs tracking-[0.26em]",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none group", className)}>
      {/* Icon Mark: Purple Shopping Bag with Cart, Lightning & Veggies */}
      <div className={cn("relative shrink-0 flex items-center justify-center", iconSizes[size])}>
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#4a044e" />
            </linearGradient>
            <linearGradient id="logoBoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          {/* Bag Body */}
          <path
            d="M12 22 C12 16 16 12 22 12 L42 12 C48 12 52 16 52 22 L56 54 C56 59 52 62 46 62 L18 62 C12 62 8 59 8 54 Z"
            fill="url(#logoBgGrad)"
          />

          {/* Bag Handle */}
          <path
            d="M22 12 C22 4 42 4 42 12"
            stroke={isDark ? "#e9d5ff" : "#c084fc"}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cart Grid / Basket Lines */}
          <path
            d="M16 34 L48 34 M18 42 L46 42 M24 34 L22 48 M40 34 L42 48"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* Fresh Veggies & Fruits */}
          <circle cx="25" cy="24" r="5" fill="#ef4444" />
          <circle cx="39" cy="23" r="4.5" fill="#f97316" />
          <path d="M32 20 C32 15 36 17 37 21 C34 22 33 22 32 20 Z" fill="#22c55e" />

          {/* Lightning Flash Symbol */}
          <path
            d="M36 14 L22 34 L32 34 L24 54 L44 28 L33 28 Z"
            fill="url(#logoBoltGrad)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography */}
      {variant !== "iconOnly" && (
        <div className="flex flex-col leading-none">
          <div className={cn("font-display font-black tracking-tight flex items-center", textSizes[size])}>
            <span className={cn(isDark ? "text-white" : "text-purple-950")}>Flash</span>
            <span className="text-amber-500 font-extrabold ml-0.5">Kart</span>
          </div>
          {showTagline && (
            <span
              className={cn(
                "uppercase font-bold mt-0.5",
                taglineSizes[size],
                isDark ? "text-emerald-400" : "text-emerald-700"
              )}
            >
              Fresh • Fast • Reliable
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
