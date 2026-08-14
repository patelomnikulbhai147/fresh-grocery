import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FlashKartLogoProps {
  className?: string;
  variant?: "light" | "dark" | "full" | "iconOnly";
  showTagline?: boolean;
  /** Extra classes for the tagline row (e.g. to hide it on tiny screens) */
  taglineClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

export function FlashKartLogo({
  className,
  variant = "light",
  showTagline = true,
  taglineClassName,
  size = "md",
  href = "/",
}: FlashKartLogoProps) {
  const isDark = variant === "dark";

  // Natural scaling heights for unclipped purple bag icon
  const iconHeightClasses = {
    sm: "h-8 sm:h-9",
    md: "h-9 xs:h-10 sm:h-12",
    lg: "h-14 sm:h-16",
    xl: "h-18 sm:h-20",
  };

  const textSizes = {
    sm: "text-lg sm:text-xl",
    md: "text-xl xs:text-2xl sm:text-[1.75rem]",
    lg: "text-3xl sm:text-4xl",
    xl: "text-4xl sm:text-5xl",
  };

  const taglineSizes = {
    sm: "text-[7.5px] tracking-[0.14em]",
    md: "text-[8px] xs:text-[9px] tracking-[0.18em]",
    lg: "text-[11px] tracking-[0.2em]",
    xl: "text-xs tracking-[0.22em]",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 sm:gap-3 select-none group py-0.5", className)}>
      
      {/* Unclipped HD Purple Bag Icon from Business Card */}
      <div className={cn("relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105", iconHeightClasses[size])}>
        <img
          src="/images/flashkart_icon_hd.png"
          alt="FlashKart Bag Icon"
          className="h-full w-auto object-contain drop-shadow-xs"
        />
      </div>

      {/* Typography: Flash (Deep Purple #36165e) + Kart (Bright Orange #f97316) */}
      {variant !== "iconOnly" && (
        <div className="flex flex-col leading-none justify-center">
          
          {/* Brand Name */}
          <div className={cn("font-display font-black tracking-tight flex items-center", textSizes[size])}>
            <span className={cn(isDark ? "text-white" : "text-[#36165e]")}>
              Flash
            </span>
            <span className="text-[#f97316] font-black ml-0.5">
              Kart
            </span>
          </div>

          {/* Business Card Tagline */}
          {showTagline && (
            <div
              className={cn(
                "uppercase font-extrabold mt-1 flex items-center gap-1.5 whitespace-nowrap",
                taglineSizes[size],
                isDark ? "text-[#00e676]" : "text-slate-800",
                taglineClassName
              )}
            >
              <span className="w-2.5 h-[1.5px] bg-[#f97316] inline-block" />
              <span>Fresh. Fast. Reliable.</span>
              <span className="w-2.5 h-[1.5px] bg-[#f97316] inline-block" />
            </div>
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
