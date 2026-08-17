"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, ShoppingCart, Minus, Plus } from "lucide-react";
import { products, Product } from "@/data/catalog";
import { useCart, useToasts } from "@/store/shop";

const vegGridItems = [
  { id: "v-tomato", slug: "tomato", name: "Tomato", singlePrice: "₹28 / kg", rawPrice: 28, image: "/images/products/tomato.jpg" },
  { id: "v-potato", slug: "potato", name: "Potato", singlePrice: "₹22 / kg", rawPrice: 22, image: "/images/products/potato.jpg" },
  { id: "v-onion", slug: "onion", name: "Onion", singlePrice: "₹24 / kg", rawPrice: 24, image: "/images/products/onion.jpg" },
  { id: "v-capsicum", slug: "capsicum", name: "Capsicum", singlePrice: "₹42 / kg", rawPrice: 42, image: "/images/products/capsicum.jpg" },
  { id: "v-cabbage", slug: "cabbage", name: "Cabbage", singlePrice: "₹18 / kg", rawPrice: 18, image: "/images/products/cabbage.jpg" },
  { id: "v-beans", slug: "beans", name: "Beans", singlePrice: "₹35 / kg", rawPrice: 35, image: "/images/products/cluster-beans.jpg" },
  { id: "v-cucumber", slug: "cucumber", name: "Cucumber", singlePrice: "₹20 / kg", rawPrice: 20, image: "/images/products/cucumber.jpg" },
  { id: "v-bitter-gourd", slug: "bitter-gourd", name: "Bitter Gourd", singlePrice: "₹28 / kg", rawPrice: 28, image: "/images/products/bitter-gourd.jpg" },
  { id: "v-brinjal", slug: "brinjal", name: "Brinjal", singlePrice: "₹26 / kg", rawPrice: 26, image: "/images/products/brinjal.jpg" },
];

function ProductCardGridItem({ item }: { item: typeof vegGridItems[0] }) {
  const [qty, setQty] = useState(1);
  const addCartItem = useCart((s) => s.add);
  const pushToast = useToasts((s) => s.push);

  const matchedProduct = products.find((p) => p.id === item.slug || p.slug.includes(item.slug)) || ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: "vegetables",
    subcategory: "Fresh Vegetables",
    tagline: "Farm fresh",
    description: "Direct farm fresh produce",
    image: item.image,
    gallery: [item.image],
    weights: [{ label: "1 kg", grams: 1000, price: item.rawPrice, mrp: Math.round(item.rawPrice * 1.3) }],
    rating: 4.8,
    reviews: 120,
    stock: 200,
    benefits: [],
    storage: "",
    origin: "",
    nutrition: [],
    tags: [],
    modes: ["instant"],
  } as Product);

  // Single price sourced from the catalog entry (same one the cart charges from)
  const unitWeight = matchedProduct.weights[0];
  const displayPrice = `₹${unitWeight.price} / ${unitWeight.label}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    for (let i = 0; i < qty; i++) {
      addCartItem(matchedProduct, 0, "instant");
    }
    pushToast(`Added ${qty} kg ${item.name} to cart!`);
  };

  return (
    <div className="group bg-white rounded-[16px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between h-full">
      <Link href={`/product/${matchedProduct.slug}`} className="flex flex-col w-full">
        {/* Full-Width Cover Image (No side margins/padding) */}
        <div className="relative w-full aspect-[5/4] bg-slate-50">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain object-center p-2 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
            unoptimized
          />
        </div>

        {/* Product Name & Single Price */}
        <div className="p-2 xs:p-2.5 sm:p-4 text-center">
          <h3 className="font-bold text-sm sm:text-lg text-slate-900 group-hover:text-[#16a34a] transition-colors truncate">
            {item.name}
          </h3>
          <p className="text-xs sm:text-base font-semibold text-[#16a34a] mt-0.5 sm:mt-1">
            {displayPrice}
          </p>
        </div>
      </Link>

      {/* Bottom Section (Green Glassy Footer) */}
      <div className="mx-2 mb-2 sm:mx-3 sm:mb-3 p-1.5 sm:p-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-[12px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2 sm:h-[52px]">
        {/* Quantity Selector: [- 1 kg +] */}
        <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              setQty((q) => Math.max(1, q - 1));
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-emerald-300 text-[#16a34a] font-bold flex items-center justify-center hover:bg-emerald-50 active:scale-95 transition shrink-0"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5 text-[#16a34a]" />
          </button>

          <span className="text-xs sm:text-sm font-bold text-slate-800 min-w-[28px] text-center">
            {qty} kg
          </span>

          <button
            onClick={(e) => {
              e.preventDefault();
              setQty((q) => q + 1);
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-emerald-300 text-[#16a34a] font-bold flex items-center justify-center hover:bg-emerald-50 active:scale-95 transition shrink-0"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5 text-[#16a34a]" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="bg-[#16a34a] hover:bg-[#15803d] active:scale-95 text-white font-bold text-xs sm:text-sm px-3 py-2 sm:px-4 rounded-[10px] flex items-center justify-center gap-1.5 transition shadow-sm shrink-0 w-full sm:w-auto"
          title={`Add ${item.name} to Cart`}
          aria-label={`Add ${item.name} to Cart`}
        >
          <ShoppingCart className="w-4 h-4 text-white" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}

export function CategoryGridSection() {
  return (
    <section className="py-6 sm:py-8 md:py-10 bg-transparent">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="bg-white rounded-[24px] p-5 sm:p-7 md:p-8 border border-slate-100 shadow-sm">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100/80 text-[#16a34a] border border-emerald-200/80 grid place-items-center shrink-0">
                <Leaf className="w-5 h-5 text-[#16a34a]" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-2xl text-slate-900">
                  Fresh Vegetables
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Daily farm-fresh produce at best rates
                </p>
              </div>
            </div>

            <Link
              href="/shop?cat=vegetables"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#16a34a] hover:text-[#15803d] transition hover:translate-x-0.5 duration-200"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3x3 Product Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
            {vegGridItems.map((item) => (
              <ProductCardGridItem key={item.id} item={item} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
