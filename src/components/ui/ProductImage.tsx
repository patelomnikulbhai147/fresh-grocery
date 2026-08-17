"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Universal product image: fills its (relative, overflow-hidden) container
 * completely using a soft blurred backdrop of the same photo, while the
 * product itself stays fully visible via object-contain — no cropping,
 * no stretching, no empty letterbox bars.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  priority = false,
  containPadding = "p-2",
  hoverZoom = false,
  onError,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  containPadding?: string;
  hoverZoom?: boolean;
  onError?: () => void;
}) {
  return (
    <>
      {/* Blurred fill backdrop (decorative) */}
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover scale-110 blur-2xl opacity-50 saturate-[0.85]"
        unoptimized
      />
      {/* Full product, always completely visible */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={onError}
        className={cn(
          "object-contain object-center z-[1]",
          containPadding,
          hoverZoom && "group-hover:scale-105 transition-transform duration-300"
        )}
        unoptimized
      />
    </>
  );
}
