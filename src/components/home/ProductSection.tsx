import { ProductCard } from "@/components/product/ProductCard";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/data/catalog";

export function ProductSection({
  eyebrow,
  title,
  description,
  products,
  cta,
  columns,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  products: Product[];
  cta?: { label: string; href: string };
  columns?: number;
}) {
  const cols = columns ?? 4;
  const grid =
    cols === 4
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : cols === 3
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-2 md:grid-cols-3";
  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.24em] font-bold text-purple-700 mb-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              {eyebrow}
            </div>
            <h2 className="font-display text-3xl md:text-5xl text-purple-950 text-balance leading-tight">{title}</h2>
            {description && <p className="mt-2 text-slate-600 max-w-xl text-sm md:text-base">{description}</p>}
          </div>
          {cta && (
            <Link
              href={cta.href}
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-purple-900 hover:text-amber-600 transition whitespace-nowrap group"
            >
              {cta.label} <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>
        <div className={`grid ${grid} gap-4 md:gap-5`}>
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}
