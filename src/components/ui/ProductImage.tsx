"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Product card image: fills its (relative, overflow-hidden) container
 * completely, edge-to-edge, using object-cover — the photo goes corner to
 * corner with no empty side/letterbox gaps. `unoptimized` because admin images
 * resolve to /api/product-image?…&v=… (a local URL with a query string, which
 * Next rejects in an optimized next/image) and Cloudflare has no image
 * optimizer anyway.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  priority = false,
  // kept for call-site compatibility; no longer used now that the image
  // fills the card edge-to-edge instead of being padded + contained.
  containPadding: _containPadding,
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
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={onError}
      className={cn(
        "object-cover object-center",
        hoverZoom && "group-hover:scale-105 transition-transform duration-300"
      )}
      unoptimized
    />
  );
}
