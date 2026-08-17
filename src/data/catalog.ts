// FlashKart Product Catalog: Fresh Vegetables & Seasonal Fruits

export type DeliveryMode = "instant" | "bulk" | "subscription";

export type Weight = {
  label: string;
  grams: number;
  price: number;
  mrp: number;
  // bulk price tier
  bulk?: { moq: number; unit: number; discount: number };
  // recurring / supply rate
  subscription?: number;
  // variant management (admin-managed); undefined = active for backward compatibility
  active?: boolean;
  /** @deprecated legacy per-variant pack count — physical stock now lives on the product as stockGrams */
  stock?: number;
};

/** Purchase-visible variants: array order = display order; inactive variants are hidden. */
export const activeWeights = (p: Pick<Product, "weights">): Weight[] =>
  p.weights.filter((w) => w.active !== false);

/**
 * Weight-based availability: all pack sizes sell the SAME physical inventory
 * (product.stockGrams). A pack is orderable while enough grams remain for it.
 * Static catalog entries without stockGrams fall back to the legacy stock flag.
 */
export const variantAvailable = (p: Pick<Product, "stockGrams" | "stock">, w: Weight): boolean =>
  p.stockGrams !== undefined ? p.stockGrams >= Math.max(1, w.grams) : p.stock > 0;

/** How many packs of this size the remaining physical stock can fulfil. */
export const maxPacksAvailable = (p: Pick<Product, "stockGrams" | "stock">, w: Weight): number =>
  p.stockGrams !== undefined
    ? Math.floor(p.stockGrams / Math.max(1, w.grams))
    : p.stock > 0
    ? 99
    : 0;

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  tagline: string;
  description: string;
  image: string;
  gallery: string[];
  weights: Weight[];
  rating: number;
  reviews: number;
  stock: number;
  /** Physical inventory in integer grams, shared by all pack sizes (admin-managed). */
  stockGrams?: number;
  organic?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  benefits: string[];
  storage: string;
  origin: string;
  farm?: string;
  harvestDate?: string;
  shelfLife?: string;
  nutrition: { label: string; value: string }[];
  tags: string[];
  modes: DeliveryMode[];
};

export type Category = {
  slug: string;
  name: string;
  image: string;
  count: number;
  accent: string;
  status?: "Active" | "Coming Soon" | "Hidden";
};

export type City = {
  slug: string;
  name: string;
  live: boolean;
  pincode?: string[];
  eta?: string;
};

// ──────────────────────── Cities / Operational Hubs ────────────────────────
export const cities: City[] = [
  { slug: "gandhinagar", name: "Gandhinagar (Main Hub)", live: true, pincode: ["3820", "3824"], eta: "Direct Supply" },
  { slug: "ahmedabad", name: "Ahmedabad", live: true, pincode: ["3800"], eta: "Network Hub" },
  { slug: "surat", name: "Surat (Franchise Upcoming)", live: false },
  { slug: "vadodara", name: "Vadodara (Franchise Upcoming)", live: false },
  { slug: "rajkot", name: "Rajkot (Franchise Upcoming)", live: false },
];

// ──────────────────────── Categories (Fresh Vegetables & Seasonal Fruits ONLY) ────────────────────────
export const categories: Category[] = [
  { slug: "vegetables", name: "Fresh Vegetables", image: "/images/categories/vegetables.png", count: 24, accent: "from-purple-200 to-amber-100", status: "Active" },
  { slug: "fruits", name: "Seasonal Fruits", image: "/images/categories/fruits.png", count: 12, accent: "from-amber-200 to-orange-100", status: "Active" },
  { slug: "leafy-greens", name: "Leafy Greens", image: "/images/categories/leafy-greens.png", count: 8, accent: "from-lime-200 to-green-100", status: "Active" },
  { slug: "exotic", name: "Exotic & Salad Veggies", image: "/images/categories/exotic.png", count: 7, accent: "from-purple-200 to-fuchsia-100", status: "Active" },
  { slug: "organic", name: "Certified Organic Produce", image: "/images/categories/organic.png", count: 14, accent: "from-emerald-200 to-teal-100", status: "Active" },
];

// Helper product factory
const p = (
  id: string,
  name: string,
  category: string,
  subcategory: string,
  tagline: string,
  image: string,
  gallery: string[],
  weights: Weight[],
  modes: DeliveryMode[],
  meta: Partial<Product> = {}
): Product => ({
  id,
  slug: id,
  name,
  category,
  subcategory,
  tagline,
  description:
    "Directly sourced from trusted regional farms for FlashKart. Hand-sorted at peak freshness to ensure premium quality, high nutrition, and fair pricing for our partner hostels, hotels, shops, and direct buyers.",
  image: image || `/images/products/${id}.jpg`,
  gallery: gallery && gallery.length > 0 ? gallery : [image || `/images/products/${id}.jpg`],
  weights,
  rating: 4.8,
  reviews: Math.floor(Math.random() * 200) + 110,
  stock: Math.floor(Math.random() * 300) + 50,
  benefits: [
    "Hand-picked at peak ripeness and freshness",
    "Direct farm sourcing cutting unnecessary middlemen",
    "Tested for quality, crispness, and optimum shelf-life",
  ],
  storage: "Keep in a cool, ventilated area or refrigerate in a perforated bag to maintain natural crispness.",
  origin: "Regional Farms, Gujarat, India",
  farm: "FlashKart Direct Partner Farms",
  harvestDate: "Daily morning dispatch",
  shelfLife: "4–6 days fresh",
  nutrition: [
    { label: "Energy", value: "32 kcal" },
    { label: "Carbs", value: "6.5 g" },
    { label: "Fibre", value: "2.4 g" },
    { label: "Protein", value: "1.4 g" },
  ],
  tags: [subcategory, category, "FlashKart Fresh"],
  modes,
  ...meta,
});

// ──────────────────────── Products (Vegetables & Seasonal Fruits) ────────────────────────
export const products: Product[] = [
  // ── Fresh Vegetables ──
  p(
    "tomato",
    "Vine-Ripened Fresh Tomatoes / Tameta",
    "vegetables",
    "Fresh Vegetables",
    "Plump, firm & rich in flavour",
    "/images/products/tomato.jpg",
    ["/images/products/tomato.jpg"],
    [
      { label: "500 g", grams: 500, price: 20, mrp: 25, subscription: 18 },
      { label: "1 kg", grams: 1000, price: 38, mrp: 48, bulk: { moq: 10, unit: 32, discount: 16 } },
      { label: "5 kg Crates", grams: 5000, price: 180, mrp: 240, bulk: { moq: 2, unit: 160, discount: 20 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 240, bestSeller: true, organic: true }
  ),
  p(
    "potato",
    "Farm-Fresh Potatoes / Bataka / Aloo",
    "vegetables",
    "Fresh Vegetables",
    "Premium golden potatoes, versatile & clean",
    "/images/products/potato.jpg",
    ["/images/products/potato.jpg"],
    [
      { label: "1 kg", grams: 1000, price: 22, mrp: 28, subscription: 20 },
      { label: "2 kg", grams: 2000, price: 42, mrp: 55, bulk: { moq: 10, unit: 38, discount: 15 } },
      { label: "5 kg Sack", grams: 5000, price: 100, mrp: 135, bulk: { moq: 5, unit: 90, discount: 20 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 320, bestSeller: true }
  ),
  p(
    "onion",
    "Red Onions / Dungari / Pyaaz",
    "vegetables",
    "Fresh Vegetables",
    "Firm, dry-cured red onions with pungent aroma",
    "/images/products/onion.jpg",
    ["/images/products/onion.jpg"],
    [
      { label: "1 kg", grams: 1000, price: 26, mrp: 34, subscription: 24 },
      { label: "2 kg", grams: 2000, price: 50, mrp: 68, bulk: { moq: 10, unit: 45, discount: 15 } },
      { label: "5 kg Sack", grams: 5000, price: 120, mrp: 165, bulk: { moq: 5, unit: 110, discount: 18 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 280, bestSeller: true }
  ),
  p(
    "carrot",
    "Fresh Red Carrot / Desi Gajar",
    "vegetables",
    "Fresh Vegetables",
    "Sweet, crunchy & rich in beta-carotene",
    "/images/products/carrot.jpg",
    ["/images/products/carrot.jpg"],
    [
      { label: "500 g", grams: 500, price: 22, mrp: 28, subscription: 20 },
      { label: "1 kg", grams: 1000, price: 42, mrp: 54, bulk: { moq: 10, unit: 36, discount: 15 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 160, bestSeller: true, organic: true, newArrival: true }
  ),
  p(
    "cucumber",
    "Fresh English Cucumber / Khira Kakdi",
    "vegetables",
    "Exotic & Salad Veggies",
    "Crisp, hydrating & salad-ready",
    "/images/products/cucumber.jpg",
    ["/images/products/cucumber.jpg"],
    [
      { label: "500 g", grams: 500, price: 18, mrp: 24, subscription: 16 },
      { label: "1 kg", grams: 1000, price: 35, mrp: 48, bulk: { moq: 10, unit: 30, discount: 15 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 140, bestSeller: true, organic: true }
  ),
  p(
    "cauliflower",
    "White Cauliflower / Phool Gobi / Fulevar",
    "vegetables",
    "Fresh Vegetables",
    "Snow-white, compact florets hand-trimmed",
    "/images/products/cauliflower.jpg",
    ["/images/products/cauliflower.jpg"],
    [
      { label: "1 head (approx 600g-800g)", grams: 700, price: 24, mrp: 32, subscription: 22 },
      { label: "2 heads", grams: 1400, price: 45, mrp: 62, bulk: { moq: 8, unit: 40, discount: 15 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 95, bestSeller: true }
  ),
  p(
    "cabbage",
    "Fresh Green Cabbage / Kobij",
    "vegetables",
    "Fresh Vegetables",
    "Tightly layered, crunchy & sweet heads",
    "/images/products/cabbage.jpg",
    ["/images/products/cabbage.jpg"],
    [
      { label: "1 head (approx 800g-1kg)", grams: 900, price: 18, mrp: 24, subscription: 16 },
      { label: "5 heads (Bulk)", grams: 4500, price: 80, mrp: 115, bulk: { moq: 4, unit: 72, discount: 18 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 190, bestSeller: true }
  ),
  p(
    "capsicum",
    "Green Bell Pepper / Capsicum / Simla Marcha",
    "vegetables",
    "Fresh Vegetables",
    "Glossy green, thick-walled & aromatic",
    "/images/products/capsicum.jpg",
    ["/images/products/capsicum.jpg"],
    [
      { label: "500 g", grams: 500, price: 28, mrp: 36, subscription: 25 },
      { label: "1 kg", grams: 1000, price: 54, mrp: 70, bulk: { moq: 5, unit: 48, discount: 15 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 110, newArrival: true }
  ),
  p(
    "spinach",
    "Fresh Baby Spinach Bunch / Palak",
    "leafy-greens",
    "Leafy Greens",
    "Tender green leaves, washed & nutrient-rich",
    "/images/products/spinach.jpg",
    ["/images/products/spinach.jpg"],
    [
      { label: "1 bunch (approx 250g)", grams: 250, price: 15, mrp: 20, subscription: 13 },
      { label: "500 g", grams: 500, price: 28, mrp: 38 },
    ],
    ["instant", "subscription"],
    { stock: 120, bestSeller: true, organic: true }
  ),
  p(
    "okra",
    "Tender Green Okra / Bhindi",
    "vegetables",
    "Fresh Vegetables",
    "Hand-graded tender pods, no stringiness",
    "/images/products/okra.jpg",
    ["/images/products/okra.jpg"],
    [
      { label: "500 g", grams: 500, price: 22, mrp: 28, subscription: 20 },
      { label: "1 kg", grams: 1000, price: 42, mrp: 55, bulk: { moq: 10, unit: 36, discount: 15 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 85, organic: true }
  ),
  p(
    "green-chilli",
    "Spicy Green Chilli / Hari Mirch / Marcha",
    "vegetables",
    "Fresh Vegetables",
    "Pungent, hand-sorted dark green chillies",
    "/images/products/green-chilli.jpg",
    ["/images/products/green-chilli.jpg"],
    [
      { label: "250 g", grams: 250, price: 18, mrp: 24, subscription: 16 },
      { label: "500 g", grams: 500, price: 34, mrp: 46 },
    ],
    ["instant", "subscription"],
    { stock: 70 }
  ),
  p(
    "bottle-gourd",
    "Fresh Dudhi / Bottle Gourd / Lauki",
    "vegetables",
    "Fresh Vegetables",
    "Tender, naturally sweet & cooling",
    "/images/products/bottle-gourd.jpg",
    ["/images/products/bottle-gourd.jpg"],
    [
      { label: "1 pc (approx 700g)", grams: 700, price: 20, mrp: 26, subscription: 18 },
    ],
    ["instant", "subscription"],
    { stock: 90, newArrival: true }
  ),
  p(
    "bitter-gourd",
    "Fresh Karela / Bitter Gourd",
    "vegetables",
    "Fresh Vegetables",
    "Deep green, crisp & antioxidant-rich",
    "/images/products/bitter-gourd.jpg",
    ["/images/products/bitter-gourd.jpg"],
    [
      { label: "500 g", grams: 500, price: 20, mrp: 26, subscription: 18 },
      { label: "1 kg", grams: 1000, price: 38, mrp: 50 },
    ],
    ["instant", "subscription"],
    { stock: 55, organic: true }
  ),
  p(
    "brinjal",
    "Fresh Ringan / Brinjal / Eggplant",
    "vegetables",
    "Fresh Vegetables",
    "Glossy purple, ideal for Bhartha or curry",
    "/images/products/brinjal.jpg",
    ["/images/products/brinjal.jpg"],
    [
      { label: "500 g", grams: 500, price: 18, mrp: 24, subscription: 16 },
      { label: "1 kg", grams: 1000, price: 34, mrp: 46, bulk: { moq: 10, unit: 28, discount: 18 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 105, bestSeller: true }
  ),
  p(
    "sweet-corn",
    "Sweet Corn Cobs / Makai",
    "vegetables",
    "Fresh Vegetables",
    "Juicy golden kernels bursting with natural sweetness",
    "/images/products/sweet-corn.jpg",
    ["/images/products/sweet-corn.jpg"],
    [
      { label: "2 pcs (approx 500g)", grams: 500, price: 24, mrp: 30, subscription: 22 },
      { label: "4 pcs (approx 1kg)", grams: 1000, price: 45, mrp: 58, bulk: { moq: 10, unit: 38, discount: 15 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 130, bestSeller: true }
  ),
  p(
    "beetroot",
    "Fresh Red Beetroot / Beet",
    "vegetables",
    "Fresh Vegetables",
    "Earthy sweetness, rich in natural iron & antioxidants",
    "/images/products/beetroot.jpg",
    ["/images/products/beetroot.jpg"],
    [
      { label: "500 g", grams: 500, price: 24, mrp: 30, subscription: 22 },
      { label: "1 kg", grams: 1000, price: 46, mrp: 58 },
    ],
    ["instant", "subscription"],
    { stock: 80, organic: true }
  ),
  p(
    "green-leafy-bhaji",
    "Green Amaranth Bhaji / Chaulai",
    "leafy-greens",
    "Leafy Greens",
    "Tender local leafy greens, iron-packed",
    "/images/products/green-leafy-bhaji.jpg",
    ["/images/products/green-leafy-bhaji.jpg"],
    [
      { label: "1 bunch (approx 250g)", grams: 250, price: 16, mrp: 22, subscription: 14 },
    ],
    ["instant", "subscription"],
    { stock: 60, organic: true }
  ),
  p(
    "sponge-gourd",
    "Fresh Galka / Ridge Gourd / Turiya",
    "vegetables",
    "Fresh Vegetables",
    "Soft texture, farm-picked fresh daily",
    "/images/products/sponge-gourd.jpg",
    ["/images/products/sponge-gourd.jpg"],
    [
      { label: "500 g", grams: 500, price: 18, mrp: 24, subscription: 16 },
      { label: "1 kg", grams: 1000, price: 34, mrp: 46 },
    ],
    ["instant", "subscription"],
    { stock: 45 }
  ),

  // ── Seasonal Fruits ──
  p(
    "alphonso-mango",
    "Seasonal Ratnagiri / Gir Kesar Mangoes",
    "fruits",
    "Seasonal Fruits",
    "Naturally ripened, fragrant & exceptionally sweet",
    "/images/categories/fruits.png",
    ["/images/categories/fruits.png"],
    [
      { label: "1 kg (approx 3-4 pcs)", grams: 1000, price: 140, mrp: 180, subscription: 130 },
      { label: "1 Box (3 kg)", grams: 3000, price: 399, mrp: 520, bulk: { moq: 3, unit: 360, discount: 15 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 75, bestSeller: true, newArrival: true }
  ),
  p(
    "nagpur-orange",
    "Juicy Nagpur Oranges / Santra",
    "fruits",
    "Seasonal Fruits",
    "Tangy-sweet, vitamin C powerhouse with easy-peel skin",
    "/images/categories/fruits.png",
    ["/images/categories/fruits.png"],
    [
      { label: "1 kg (approx 5-6 pcs)", grams: 1000, price: 65, mrp: 85, subscription: 60 },
      { label: "2 kg", grams: 2000, price: 125, mrp: 165, bulk: { moq: 5, unit: 110, discount: 15 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 120, bestSeller: true }
  ),
  p(
    "shimla-apple",
    "Royal Delicious Shimla Apples / Seb",
    "fruits",
    "Seasonal Fruits",
    "Crisp, sweet & hand-graded hill orchard apples",
    "/images/categories/fruits.png",
    ["/images/categories/fruits.png"],
    [
      { label: "500 g (approx 3 pcs)", grams: 500, price: 85, mrp: 110, subscription: 80 },
      { label: "1 kg", grams: 1000, price: 160, mrp: 210, bulk: { moq: 5, unit: 145, discount: 15 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 110, bestSeller: true, organic: true }
  ),
  p(
    "fresh-banana",
    "Fresh Robusta Bananas / Kela",
    "fruits",
    "Seasonal Fruits",
    "Naturally sweet, energy-rich table bananas",
    "/images/categories/fruits.png",
    ["/images/categories/fruits.png"],
    [
      { label: "1 Dozen (12 pcs)", grams: 1200, price: 48, mrp: 60, subscription: 45 },
      { label: "2 Dozens", grams: 2400, price: 90, mrp: 120, bulk: { moq: 5, unit: 80, discount: 15 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 160, bestSeller: true }
  ),
  p(
    "pomegranate",
    "Ruby Red Pomegranate / Anaar",
    "fruits",
    "Seasonal Fruits",
    "Plump arils full of antioxidants and sweet juice",
    "/images/categories/fruits.png",
    ["/images/categories/fruits.png"],
    [
      { label: "500 g (approx 2 pcs)", grams: 500, price: 75, mrp: 95, subscription: 70 },
      { label: "1 kg", grams: 1000, price: 145, mrp: 185, bulk: { moq: 5, unit: 130, discount: 15 } },
    ],
    ["instant", "bulk", "subscription"],
    { stock: 65, newArrival: true }
  ),
  p(
    "sweet-papaya",
    "Farm-Fresh Semi-Ripe Papaya / Papaiya",
    "fruits",
    "Seasonal Fruits",
    "Rich golden flesh, aiding digestion and gut wellness",
    "/images/categories/fruits.png",
    ["/images/categories/fruits.png"],
    [
      { label: "1 pc (approx 1kg)", grams: 1000, price: 45, mrp: 60, subscription: 40 },
    ],
    ["instant", "subscription"],
    { stock: 85 }
  ),
];

// ──────────────────────── Testimonials ────────────────────────
export const testimonials = [
  {
    name: "Ramesh Sharma",
    location: "Infocity PG & Hostel Hub, Gandhinagar",
    avatar: "/images/avatars/photo-1507003211169-0a1dd7228f2d.jpg",
    rating: 5,
    text: "FlashKart has solved our daily kitchen procurement completely. Every morning the tomatoes, onions, and greens are fresh, clean, and delivered at unmatched wholesale rates for our 200+ students.",
    role: "Hostel & Mess Manager",
    verified: true,
  },
  {
    name: "Chef Bhavesh Solanki",
    location: "Hotel Grand Heritage Kitchen, Gandhinagar",
    avatar: "/images/avatars/photo-1500648767791-00dcc994a43e.jpg",
    rating: 5,
    text: "The vegetable grading by FlashKart is top-tier. No bruised produce, zero wastage in our prep line, and direct billing is completely transparent. Their team is extremely reliable.",
    role: "Executive Hotel Chef",
    verified: true,
  },
  {
    name: "Dharmesh Patel",
    location: "Sector 21 Retail Mart, Gandhinagar",
    avatar: "/images/avatars/photo-1494790108377-be9c29b29330.jpg",
    rating: 5,
    text: "We stock our shop with FlashKart fresh vegetables and seasonal fruits every morning. Customers notice the crisp quality immediately, and our margins have improved significantly.",
    role: "Local Retail Shop Owner",
    verified: true,
  },
  {
    name: "Pooja Varma",
    location: "Sargasan Resident, Gandhinagar",
    avatar: "/images/avatars/photo-1438761681033-6461ffad8d80.jpg",
    rating: 5,
    text: "We buy directly through the FlashKart network counter near our complex. The freshness of the leafy vegetables and seasonal fruits is vastly better than ordinary mandi stalls.",
    role: "Direct Customer",
    verified: true,
  },
];

// ──────────────────────── Accessors ────────────────────────
export const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const getProductsByCategory = (cat: string) => products.filter((p) => p.category === cat);

export const activeProducts = products;
export const bestSellers = products.filter((p) => p.bestSeller);
export const newArrivals = products.filter((p) => p.newArrival);
export const organic = products.filter((p) => p.organic);
export const vegetableProducts = products.filter((p) => p.category === "vegetables" || p.category === "leafy-greens" || p.category === "exotic");
export const fruitProducts = products.filter((p) => p.category === "fruits");
export const bulkProducts = products.filter((p) => p.modes.includes("bulk"));

// ──────────────────────── FlashKart Farmer Network ────────────────────────
export const farmers = [
  {
    name: "Rameshbhai Patel",
    farm: "FlashKart Partner Organic Farm",
    location: "Sanand, Ahmedabad - Gandhinagar Belt",
    since: "2019",
    image: "/images/avatars/photo-1507003211169-0a1dd7228f2d.jpg",
    quote:
      "Partnering with FlashKart means our harvest reaches hostels, hotels, and retail shops on the same day without middleman deductions. Fair prices for us and fresh produce for the community.",
    produce: ["Tomatoes", "Okra", "Brinjal"],
    certification: "Natural Farming · Tested",
  },
  {
    name: "Harshad Solanki",
    farm: "Shree Greenfield Hydro & Shade-Net",
    location: "Dehgam, Gandhinagar",
    since: "2020",
    image: "/images/avatars/photo-1500648767791-00dcc994a43e.jpg",
    quote:
      "We supply high-grade spinach, methi, coriander, and crisp cucumbers exclusively for FlashKart's supply network. Quality check happens right at the farm gate.",
    produce: ["Spinach", "Methi", "Cucumbers", "Coriander"],
    certification: "Clean Produce · Zero Harmful Sprays",
  },
  {
    name: "Pravinbhai Chaudhary",
    farm: "Saurashtra Fruit Orchards",
    location: "Talala / Mahuva Region",
    since: "2021",
    image: "/images/avatars/photo-1500648767791-00dcc994a43e.jpg",
    quote:
      "Our seasonal Kesar mangoes and fresh citrus are sorted and delivered directly to FlashKart hubs, ensuring maximum sweetness and crisp freshness.",
    produce: ["Kesar Mangoes", "Citrus", "Papaya"],
    certification: "GI Registered · Naturally Ripened",
  },
];

export const subscriptionProducts = products.filter((p) => p.modes.includes("subscription"));

