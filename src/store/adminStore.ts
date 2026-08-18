"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { categories as initialCategories, type Product, type Category, type Weight, type DeliveryMode } from "@/data/catalog";
import { type AdminRole } from "./adminAuth";
import { formatWeight } from "@/lib/utils";
import {
  normalizeVariantStocks,
  packCountsToGrams,
  productStockInfo,
  buildInitialAdminProducts,
} from "@/lib/inventory";

// Re-exported so existing imports from the store keep working — the pure logic
// now lives in "@/lib/inventory" and is shared with the server product source.
export { normalizeVariantStocks, packCountsToGrams, productStockInfo };

export type ProductStatus = "Active" | "Draft" | "Hidden" | "Out of Stock";
export type DeliveryTimeOption = "10 Min" | "20 Min" | "30 Min" | "45 Min" | "Same Day" | "Morning" | "Daily Morning";
export type ProductLabel = "Organic" | "Fresh" | "Bestseller" | "Trending" | "New Arrival" | "Seasonal";
export type ProductBadge = "Discount" | "Limited Stock" | "Combo Offer" | "None";

export interface AdminProduct extends Product {
  price?: number;
  mrp?: number;
  /** Physical inventory in integer grams — ONE shared pool for all pack sizes. */
  stockGrams: number;
  /** Low-stock threshold in grams (weight-based, configurable per product). */
  minStockGrams: number;
  sku: string;
  barcode: string;
  brand: string;
  unit: string;
  variant: string;
  costPrice: number;
  taxPercent: number;
  marginPercent: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStock: number;
  maxStock: number;
  warehouse: string;
  batchNumber: string;
  status: ProductStatus;
  labels: ProductLabel[];
  badge: ProductBadge;
  deliveryTime: DeliveryTimeOption;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
}

export interface AdminCategory extends Category {
  icon?: string;
  featured?: boolean;
  status?: "Active" | "Coming Soon" | "Hidden";
  order?: number;
}

export interface InventoryLog {
  id: string;
  date: string;
  time?: string;
  type: "Stock In" | "Stock Out" | "Purchase Entry" | "Supplier Entry" | "Warehouse Transfer" | "Damaged Stock" | "Expired Stock" | "Stock Adjustment" | "Transfer" | "Damage" | "Return";
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceNo: string;
  warehouse: string;
  supplierName?: string;
  notes?: string;
}

export interface PriceHistoryRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  oldPrice: number;
  newPrice: number;
  oldMrp?: number;
  newMrp?: number;
  user: string;
  date: string;
  time: string;
  reason?: string;
}

export interface StockHistoryRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  oldStock: number;
  newStock: number;
  reason: "Purchase" | "Sale" | "Manual Update" | "Damage" | "Return" | "Transfer" | "Adjustment";
  user: string;
  date: string;
  time: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  categorySupply: string;
  rating: number;
  status: "Active" | "Inactive";
}

export type OrderStatus = "Pending" | "Confirmed" | "Processing" | "Packed" | "Out for Delivery" | "Delivered" | "Cancelled" | "Refunded" | "Returned";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  weight: string;
  unit?: string;
  price: number;
  quantity: number;
  /** Pack weight in grams at purchase time (preserved on the order). */
  packGrams?: number;
  /** packGrams × quantity — total physical weight this line consumed. */
  totalGrams?: number;
}

export interface AdminOrder {
  id: string;
  date: string;
  createdAt?: string;
  /** The logged-in account that placed the order (may differ from the delivery contact). */
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  deliveryAddress?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: "Paid" | "Pending" | "Refunded" | "Failed";
  paymentMethod: "Credit Card" | "UPI" | "Wallet" | "Cash on Delivery";
  deliverySlot: string;
  assignedPartner?: any;
  assignedDriver?: any;
  customerNotes?: string;
  invoiceNo: string;
}

export interface AdminAddress {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  date: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High";
  lastMessage: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  joinedAt?: string;
  avatar: string;
  walletBalance: number;
  rewardPoints: number;
  loyaltyPoints?: number;
  ordersCount?: number;
  totalOrders: number;
  totalSpent: number;
  status: "Active" | "Blocked";
  addresses: any[];
  tickets: SupportTicket[];
}

export type CouponType = "Percentage Discount" | "Flat Discount" | "Buy One Get One" | "Flash Sale" | "Festival Sale" | "Happy Hour" | "Combo Offer";

export interface AdminCoupon {
  id: string;
  code: string;
  title: string;
  type: CouponType;
  discountType?: string;
  discountValue: number; // percentage or flat INR
  value?: number;
  minCartValue: number;
  minOrder?: number;
  maxDiscountCap: number;
  maxDiscount?: number;
  expiryDate: string;
  validFrom?: string;
  validTo?: string;
  usageLimit: number;
  usedCount: number;
  status: "Active" | "Expired" | "Disabled";
}

export interface AdminBanner {
  id: string;
  title: string;
  slot: "Homepage Hero" | "Offer Banner" | "Category Banner" | "Popup Banner" | "Announcement Bar";
  imageUrl: string;
  linkUrl: string;
  status: "Active" | "Scheduled" | "Disabled";
  startDate?: string;
  endDate?: string;
  displayOrder: number;
}

export interface AdminCMSSection {
  id: string;
  title: string;
  slug: string;
  type: "Hero Slider" | "Featured Grid" | "Trending Products" | "Seasonal Showcase" | "Testimonials" | "FAQ" | "Footer";
  isActive: boolean;
  order: number;
  contentSummary: string;
}

export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  createdAt?: string;
  status: "Approved" | "Pending" | "Rejected";
  isSpam: boolean;
  verifiedPurchase?: boolean;
  reply?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  citySlug: string;
  pincodes: string[];
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  minOrderValue: number;
  estimatedTime: string;
  status: "Active" | "Inactive";
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: "Email" | "SMS" | "WhatsApp" | "Push";
  triggerEvent: "Order Placed" | "Order Out for Delivery" | "Order Delivered" | "Order Cancelled" | "Welcome New Customer" | "Low Stock Warning";
  subject?: string;
  content: string;
  isActive: boolean;
}

export interface AdminSettings {
  websiteName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  defaultTaxPercent: number;
  defaultDeliveryFee: number;
  freeDeliveryThreshold: number;
  themePrimaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  smtpServer: string;
  smtpPort: string;
  smtpUser: string;
  smsApiKey: string;
  whatsappApiKey: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  gaId: string;
  fbPixelId: string;
  globalMetaTitle: string;
  globalMetaDescription: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  ip: string;
  browser: string;
  user: string;
  role: AdminRole;
  action: string;
  module: string;
}

function buildInitialOrders(): AdminOrder[] {
  return [
    {
      id: "FRM-ORD-88210",
      date: "2026-07-25 10:15 AM",
      customerName: "Aarav Sharma",
      customerEmail: "aarav.sharma@example.com",
      customerPhone: "+91 98765 43210",
      shippingAddress: "402, Sunrise Towers, SG Highway, Ahmedabad 380054",
      items: [
        { productId: "p1", name: "Alphonso Mangoes (Ratnagiri)", image: "/images/products/mango.png", weight: "1 kg (4-5 pcs)", price: 440, quantity: 2 },
        { productId: "p2", name: "Farm Fresh Cow Milk", image: "/images/products/milk.png", weight: "1 L Pouch", price: 68, quantity: 3 }
      ],
      subtotal: 1084,
      discount: 84,
      deliveryFee: 0,
      tax: 50,
      total: 1050,
      status: "Out for Delivery",
      paymentStatus: "Paid",
      paymentMethod: "UPI",
      deliverySlot: "Today 10:30 AM - 11:00 AM (30 Min Express)",
      assignedPartner: { name: "Vikram Rathod", phone: "+91 91234 56780", vehicleNo: "GJ 01 AB 8910" },
      customerNotes: "Please leave the bag near the door if bell is unanswered.",
      invoiceNo: "INV-2026-88210"
    },
    {
      id: "FRM-ORD-88209",
      date: "2026-07-25 09:30 AM",
      customerName: "Priya Patel",
      customerEmail: "priya.p@example.com",
      customerPhone: "+91 98980 11223",
      shippingAddress: "12, Green Bungalows, Infocity, Gandhinagar 382007",
      items: [
        { productId: "p3", name: "Organic Spinach (Palak)", image: "/images/products/spinach.png", weight: "250 g Bunch", price: 35, quantity: 4 },
        { productId: "p4", name: "Cold-Pressed Mustard Oil", image: "/images/products/mustard-oil.png", weight: "1 L Bottle", price: 290, quantity: 1 }
      ],
      subtotal: 430,
      discount: 30,
      deliveryFee: 20,
      tax: 20,
      total: 440,
      status: "Delivered",
      paymentStatus: "Paid",
      paymentMethod: "Credit Card",
      deliverySlot: "Today 09:30 AM - 10:00 AM",
      assignedPartner: { name: "Suresh Kumar", phone: "+91 99887 76655", vehicleNo: "GJ 18 XY 4321" },
      invoiceNo: "INV-2026-88209"
    },
    {
      id: "FRM-ORD-88208",
      date: "2026-07-24 07:45 PM",
      customerName: "Rohan Mehta",
      customerEmail: "rohan.mehta@example.com",
      customerPhone: "+91 97654 32109",
      shippingAddress: "B-501, Heritage Residency, Satellite, Ahmedabad 380015",
      items: [
        { productId: "p5", name: "Crisp Fuji Apples", image: "/images/products/apple.png", weight: "1 kg Pack", price: 280, quantity: 2 },
        { productId: "p6", name: "Greek Yogurt (Plain)", image: "/images/products/yogurt.png", weight: "400 g Tub", price: 150, quantity: 2 }
      ],
      subtotal: 860,
      discount: 60,
      deliveryFee: 0,
      tax: 40,
      total: 840,
      status: "Processing",
      paymentStatus: "Paid",
      paymentMethod: "Wallet",
      deliverySlot: "Today 11:00 AM - 12:00 PM",
      invoiceNo: "INV-2026-88208"
    },
    {
      id: "FRM-ORD-88207",
      date: "2026-07-24 05:20 PM",
      customerName: "Sneha Joshi",
      customerEmail: "sneha.j@example.com",
      customerPhone: "+91 94321 09876",
      shippingAddress: "C-14, Shivalik Plaza, Vastrapur, Ahmedabad 380052",
      items: [
        { productId: "p7", name: "Fresh Tender Coconut Water", image: "/images/products/coconut.png", weight: "2 Bottles (500ml each)", price: 140, quantity: 3 }
      ],
      subtotal: 420,
      discount: 0,
      deliveryFee: 30,
      tax: 21,
      total: 471,
      status: "Pending",
      paymentStatus: "Pending",
      paymentMethod: "Cash on Delivery",
      deliverySlot: "Today 02:00 PM - 03:00 PM",
      customerNotes: "Call upon arrival.",
      invoiceNo: "INV-2026-88207"
    }
  ];
}

function buildInitialCustomers(): AdminCustomer[] {
  return [
    {
      id: "CUST-101",
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "+91 98765 43210",
      joinedDate: "2025-11-12",
      avatar: "/images/avatars/farmer-1.jpg",
      walletBalance: 420,
      rewardPoints: 2450,
      totalOrders: 23,
      totalSpent: 14850,
      status: "Active",
      addresses: [
        { id: "addr-1", label: "Home", addressLine: "402, Sunrise Towers, SG Highway", city: "Ahmedabad", pincode: "380054", isDefault: true }
      ],
      tickets: [
        { id: "TICK-901", subject: "Inquiry on Organic Mango certification", date: "2026-07-20", status: "Resolved", priority: "Low", lastMessage: "Shared NPOP organic certificate via email." }
      ]
    },
    {
      id: "CUST-102",
      name: "Priya Patel",
      email: "priya.p@example.com",
      phone: "+91 98980 11223",
      joinedDate: "2026-01-05",
      avatar: "/images/avatars/farmer-2.jpg",
      walletBalance: 150,
      rewardPoints: 820,
      totalOrders: 11,
      totalSpent: 6420,
      status: "Active",
      addresses: [
        { id: "addr-2", label: "Office", addressLine: "12, Green Bungalows, Infocity", city: "Gandhinagar", pincode: "382007", isDefault: true }
      ],
      tickets: []
    },
    {
      id: "CUST-103",
      name: "Rohan Mehta",
      email: "rohan.mehta@example.com",
      phone: "+91 97654 32109",
      joinedDate: "2026-03-18",
      avatar: "/images/avatars/farmer-3.jpg",
      walletBalance: 0,
      rewardPoints: 310,
      totalOrders: 6,
      totalSpent: 3980,
      status: "Active",
      addresses: [
        { id: "addr-3", label: "Home", addressLine: "B-501, Heritage Residency, Satellite", city: "Ahmedabad", pincode: "380015", isDefault: true }
      ],
      tickets: [
        { id: "TICK-902", subject: "Request for later delivery slot option", date: "2026-07-24", status: "Open", priority: "Medium", lastMessage: "Customer wants 9 PM - 10 PM delivery slot." }
      ]
    },
    {
      id: "CUST-104",
      name: "Sneha Joshi",
      email: "sneha.j@example.com",
      phone: "+91 94321 09876",
      joinedDate: "2026-05-02",
      avatar: "/images/avatars/farmer-4.jpg",
      walletBalance: 50,
      rewardPoints: 190,
      totalOrders: 3,
      totalSpent: 1420,
      status: "Active",
      addresses: [
        { id: "addr-4", label: "Home", addressLine: "C-14, Shivalik Plaza, Vastrapur", city: "Ahmedabad", pincode: "380052", isDefault: true }
      ],
      tickets: []
    }
  ];
}

function buildInitialSuppliers(): Supplier[] {
  return [
    { id: "SUP-01", name: "Green Valley Organic Farms", contactPerson: "Rajesh Bhai Patel", email: "orders@greenvalley.in", phone: "+91 98250 11223", address: "Anand-Sojitra Road, Anand, Gujarat 388001", categorySupply: "Fresh Vegetables & Leafy Greens", rating: 4.9, status: "Active" },
    { id: "SUP-02", name: "Amrut Dairy Co-op Ltd", contactPerson: "Sanjay Desai", email: "supply@amrutdairy.com", phone: "+91 99780 44556", address: "Mehsana Highway, Mehsana 384002", categorySupply: "Milk & Dairy Products", rating: 4.8, status: "Active" },
    { id: "SUP-03", name: "Ratnagiri Orchard Guild", contactPerson: "Vijay Kulkarni", email: "export@ratnagiriorchard.in", phone: "+91 94230 77889", address: "Devgad Highway, Ratnagiri, MH 415612", categorySupply: "Seasonal Fruits & Mangoes", rating: 5.0, status: "Active" },
    { id: "SUP-04", name: "PureHarvest Spice & Grains", contactPerson: "Amitabh Shah", email: "contact@pureharvest.co.in", phone: "+91 98989 33221", address: "Unjha APMC Market, Unjha 384170", categorySupply: "Cooking Essentials & Dry Fruits", rating: 4.6, status: "Active" }
  ];
}

function buildInitialCoupons(): AdminCoupon[] {
  return [
    { id: "CPN-1", code: "FRESH20", title: "20% Off on First Grocery Order", type: "Percentage Discount", discountValue: 20, minCartValue: 499, maxDiscountCap: 200, expiryDate: "2026-08-31", usageLimit: 1000, usedCount: 342, status: "Active" },
    { id: "CPN-2", code: "FLAT150", title: "Flat ₹150 Off on Weekend Shopping", type: "Flat Discount", discountValue: 150, minCartValue: 1499, maxDiscountCap: 150, expiryDate: "2026-07-31", usageLimit: 500, usedCount: 489, status: "Active" },
    { id: "CPN-3", code: "BOGOMILK", title: "Buy 2 Get 1 Free on Dairy Essentials", type: "Buy One Get One", discountValue: 100, minCartValue: 299, maxDiscountCap: 75, expiryDate: "2026-08-15", usageLimit: 300, usedCount: 112, status: "Active" },
    { id: "CPN-4", code: "FLASHSAVE", title: "Flash Sale: 30% Off for Next 2 Hours", type: "Flash Sale", discountValue: 30, minCartValue: 799, maxDiscountCap: 350, expiryDate: "2026-07-26", usageLimit: 200, usedCount: 198, status: "Active" }
  ];
}

function buildInitialBanners(): AdminBanner[] {
  return [
    { id: "BAN-1", title: "Monsoon Fresh Organic Harvest", slot: "Homepage Hero", imageUrl: "/images/categories/vegetables.png", linkUrl: "/shop?cat=vegetables", status: "Active", displayOrder: 1 },
    { id: "BAN-2", title: "Devgad Alphonso Mangoes Same Day Delivery", slot: "Homepage Hero", imageUrl: "/images/categories/fruits.png", linkUrl: "/shop?cat=fruits", status: "Active", displayOrder: 2 },
    { id: "BAN-3", title: "Get Flat 20% Off with code FRESH20", slot: "Announcement Bar", imageUrl: "", linkUrl: "/shop", status: "Active", displayOrder: 1 },
    { id: "BAN-4", title: "Free 10 Min Delivery on Dairy Essentials", slot: "Offer Banner", imageUrl: "/images/categories/dairy.png", linkUrl: "/shop?cat=dairy", status: "Active", displayOrder: 1 },
    { id: "BAN-5", title: "Welcome Offer: Free FlashKart Produce Bag on Orders > ₹999", slot: "Popup Banner", imageUrl: "/images/categories/essentials.png", linkUrl: "/shop", status: "Active", displayOrder: 1 }
  ];
}

function buildInitialCMS(): AdminCMSSection[] {
  return [
    { id: "CMS-1", title: "Hero Carousel Slider", slug: "hero-slider", type: "Hero Slider", isActive: true, order: 1, contentSummary: "Displays top promotional banners with vibrant gradients and CTA buttons." },
    { id: "CMS-2", title: "Shop by Category Grid", slug: "featured-categories", type: "Featured Grid", isActive: true, order: 2, contentSummary: "12 category cards with hover animations and item counts." },
    { id: "CMS-3", title: "Trending & Bestsellers", slug: "trending-products", type: "Trending Products", isActive: true, order: 3, contentSummary: "Curated list of top 8 selling grocery items with quick-add to cart." },
    { id: "CMS-4", title: "Partner Farmer Stories & Testimonials", slug: "testimonials", type: "Testimonials", isActive: true, order: 4, contentSummary: "Customer and farmer stories highlighting organic pesticide-free quality." },
    { id: "CMS-5", title: "Frequently Asked Questions", slug: "faq", type: "FAQ", isActive: true, order: 5, contentSummary: "8 common questions regarding delivery slots, return policy, and organic certification." }
  ];
}

function buildInitialReviews(): AdminReview[] {
  return [
    { id: "REV-101", productId: "p1", productName: "Alphonso Mangoes (Ratnagiri)", customerName: "Aarav Sharma", rating: 5, comment: "Super sweet and juicy! Delivered perfectly ripe without any chemical smell. Highly recommend.", date: "2026-07-24", status: "Approved", isSpam: false, reply: "Thank you Aarav! We source directly from Ratnagiri orchard guilds." },
    { id: "REV-102", productId: "p2", productName: "Farm Fresh Cow Milk", customerName: "Priya Patel", rating: 5, comment: "Very fresh and boils well with good cream layer. Kids love the taste.", date: "2026-07-23", status: "Approved", isSpam: false },
    { id: "REV-103", productId: "p3", productName: "Organic Spinach (Palak)", customerName: "Rohan Mehta", rating: 4, comment: "Crisp and fresh leaves. Just wish the bunch was slightly larger.", date: "2026-07-22", status: "Approved", isSpam: false },
    { id: "REV-104", productId: "p5", productName: "Crisp Fuji Apples", customerName: "Anonymous User", rating: 1, comment: "CLICK HERE FOR FREE BITCOIN CASINO REWARDS -> http://spamlink.xyz", date: "2026-07-25", status: "Pending", isSpam: true }
  ];
}

function buildInitialZones(): DeliveryZone[] {
  return [
    { id: "ZONE-1", name: "Ahmedabad West & SG Highway", citySlug: "ahmedabad", pincodes: ["380054", "380058", "380059", "380060"], deliveryCharge: 20, freeDeliveryThreshold: 499, minOrderValue: 149, estimatedTime: "10-20 Min Express", status: "Active" },
    { id: "ZONE-2", name: "Ahmedabad Central & East", citySlug: "ahmedabad", pincodes: ["380001", "380009", "380015", "380052"], deliveryCharge: 30, freeDeliveryThreshold: 499, minOrderValue: 149, estimatedTime: "30-40 Min Standard", status: "Active" },
    { id: "ZONE-3", name: "Gandhinagar Infocity & Sector 1-30", citySlug: "gandhinagar", pincodes: ["382007", "382009", "382010", "382028"], deliveryCharge: 25, freeDeliveryThreshold: 599, minOrderValue: 199, estimatedTime: "30-45 Min Standard", status: "Active" }
  ];
}

function buildInitialNotifications(): NotificationTemplate[] {
  return [
    { id: "NOTIF-1", name: "Order Confirmation SMS/WhatsApp", channel: "WhatsApp", triggerEvent: "Order Placed", subject: "Order Placed Successfully", content: "Hi {{customer_name}}, your FlashKart produce order #{{order_id}} for ₹{{total}} has been placed! We are preparing your fresh harvest right now.", isActive: true },
    { id: "NOTIF-2", name: "Driver Assigned & Out for Supply", channel: "SMS", triggerEvent: "Order Out for Delivery", content: "Your FlashKart order #{{order_id}} is dispatched with {{driver_name}} ({{driver_phone}}). Arriving shortly!", isActive: true },
    { id: "NOTIF-3", name: "Fulfillment Completed Thank You Note", channel: "Email", triggerEvent: "Order Delivered", subject: "Your FlashKart Produce Has Arrived! 🥦🍎", content: "Hi {{customer_name}}, your produce order has been fulfilled! Please let us know how we did by leaving a quick review.", isActive: true },
    { id: "NOTIF-4", name: "Low Stock Alert for Warehouse Managers", channel: "Email", triggerEvent: "Low Stock Warning", subject: "[URGENT] Low Stock Alert for {{product_name}}", content: "Alert: Product {{product_name}} (SKU: {{sku}}) has dropped below minimum threshold (Current: {{current_stock}}, Min: {{min_stock}}). Please reorder from supplier.", isActive: true }
  ];
}

function buildInitialSettings(): AdminSettings {
  return {
    websiteName: "FlashKart — Fresh Vegetables & Seasonal Fruits",
    supportEmail: "flashkart.co@gmail.com",
    supportPhone: "+91 6352856495 / 9773271029",
    currency: "₹ (INR)",
    defaultTaxPercent: 5,
    defaultDeliveryFee: 0,
    freeDeliveryThreshold: 0,
    themePrimaryColor: "#581c87",
    logoUrl: "/logo.svg",
    faviconUrl: "/favicon.ico",
    smtpServer: "smtp.flashkart.internal",
    smtpPort: "587",
    smtpUser: "notifications@flashkart.co",
    smsApiKey: "MSG91_KEY_SIMULATED_88921",
    whatsappApiKey: "WA_META_SIMULATED_TOKEN_99812",
    razorpayKeyId: "rzp_live_flashkart_simulated_id",
    razorpayKeySecret: "••••••••••••••••••••••••",
    gaId: "G-FLASHKART88",
    fbPixelId: "FB_PIX_881920",
    globalMetaTitle: "FlashKart — Fresh Vegetables & Seasonal Fruits",
    globalMetaDescription: "Fresh vegetables and seasonal fruits supplied directly to hostels, PGs, hotels, and retail shops."
  };
}

interface AdminStoreState {
  products: AdminProduct[];
  categories: AdminCategory[];
  inventoryLogs: InventoryLog[];
  suppliers: Supplier[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  coupons: AdminCoupon[];
  banners: AdminBanner[];
  cmsSections: AdminCMSSection[];
  reviews: AdminReview[];
  deliveryZones: DeliveryZone[];
  notificationTemplates: NotificationTemplate[];
  settings: AdminSettings;
  activityLogs: ActivityLog[];
  priceHistory: PriceHistoryRecord[];
  stockHistory: StockHistoryRecord[];

  // Actions - Products
  addProduct: (product: Omit<AdminProduct, "id">, user: string, role: AdminRole) => void;
  updateProduct: (id: string, updates: Partial<AdminProduct>, user: string, role: AdminRole) => void;
  deleteProduct: (id: string, user: string, role: AdminRole) => void;
  duplicateProduct: (id: string, user: string, role: AdminRole) => void;
  archiveProduct: (id: string, user: string, role: AdminRole) => void;
  restoreProduct: (id: string, user: string, role: AdminRole) => void;
  bulkUpdateProducts: (ids: string[], updates: Partial<AdminProduct>, actionName: string, user: string, role: AdminRole) => void;
  updateProductStock: (id: string, newStock: number, user: string, role: AdminRole) => void;
  /** Set the product's shared physical stock in integer grams (weight-based inventory). */
  updateProductStockGrams: (id: string, grams: number, user: string, role: AdminRole) => void;
  recordPriceChange: (record: Omit<PriceHistoryRecord, "id" | "date" | "time">) => void;
  recordStockChange: (record: Omit<StockHistoryRecord, "id" | "date" | "time">) => void;
  batchUpdateProductsInline: (edits: Record<string, Partial<AdminProduct>>, user: string, role: AdminRole, reason?: string) => void;
  importProductsCSV: (importedList: Partial<AdminProduct>[], user: string, role: AdminRole) => { updatedCount: number; createdCount: number };

  // Actions - Inventory
  addInventoryLog: (log: Omit<InventoryLog, "id" | "date">, user: string, role: AdminRole) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>, user: string, role: AdminRole) => void;
  addSupplier: (supplier: Omit<Supplier, "id">, user: string, role: AdminRole) => void;

  // Actions - Categories & Brands
  addCategory: (cat: any, user: string, role: AdminRole) => void;
  updateCategory: (slug: string, updates: any, user: string, role: AdminRole) => void;
  deleteCategory: (slug: string, user: string, role: AdminRole) => void;

  // Actions - Orders & Customers
  /**
   * Storefront checkout → validates stock for EVERY item first; only if all fit does it
   * create the order and decrement the exact variant stocks (atomic: all-or-nothing).
   */
  placeCustomerOrder: (order: AdminOrder) => { ok: boolean; message?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus, user: string, role: AdminRole) => void;
  assignDeliveryPartner: (orderId: string, partner: { name: string; phone: string; vehicleNo: string }, user: string, role: AdminRole) => void;
  assignOrderDriver: (orderId: string, driver: any, user: string, role: AdminRole) => void;
  bulkUpdateOrderStatus: (ids: string[], status: OrderStatus, user: string, role: AdminRole) => void;
  updateCustomerWallet: (customerId: string, amount: number, reason: string, user: string, role: AdminRole) => void;
  adjustCustomerWallet: (customerId: string, amount: number, reason: string, user: string, role: AdminRole) => void;
  toggleBlockCustomer: (customerId: string, user: string, role: AdminRole) => void;
  updateCustomerStatus: (customerId: string, status: "Active" | "Blocked", user: string, role: AdminRole) => void;

  // Actions - Marketing & Content
  addCoupon: (coupon: any, user: string, role: AdminRole) => void;
  updateCoupon: (id: string, updates: any, user: string, role: AdminRole) => void;
  deleteCoupon: (id: string, user: string, role: AdminRole) => void;
  addBanner: (banner: Omit<AdminBanner, "id">, user: string, role: AdminRole) => void;
  updateBanner: (id: string, updates: Partial<AdminBanner>, user: string, role: AdminRole) => void;
  deleteBanner: (id: string, user: string, role: AdminRole) => void;
  updateCMSSection: (id: string, updates: Partial<AdminCMSSection>, user: string, role: AdminRole) => void;
  updateReviewStatus: (reviewId: string, status: "Approved" | "Rejected" | "Pending", user: string, role: AdminRole, reply?: string) => void;

  // Actions - Delivery, Notifications & Settings
  addDeliveryZone: (zone: Omit<DeliveryZone, "id">, user: string, role: AdminRole) => void;
  updateDeliveryZone: (id: string, updates: Partial<DeliveryZone>, user: string, role: AdminRole) => void;
  updateNotificationTemplate: (id: string, updates: Partial<NotificationTemplate>, user: string, role: AdminRole) => void;
  updateSettings: (newSettings: Partial<AdminSettings>, user: string, role: AdminRole) => void;

  // Activity Log helper
  logAction: (user: string, role: AdminRole, action: string, module: string) => void;
  clearActivityLogs: () => void;
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set, get) => ({
      products: buildInitialAdminProducts(),
      categories: initialCategories,
      inventoryLogs: [
        { id: "LOG-1", date: "2026-07-25 08:00 AM", type: "Stock In", productId: "p1", productName: "Alphonso Mangoes (Ratnagiri)", sku: "FRM-SKU-1000", quantity: 50, previousStock: 20, newStock: 70, referenceNo: "PO-2026-401", warehouse: "Hub-A (North Ahmedabad)", supplierName: "Ratnagiri Orchard Guild", notes: "Fresh morning batch arrived." },
        { id: "LOG-2", date: "2026-07-24 02:30 PM", type: "Stock Out", productId: "p2", productName: "Farm Fresh Cow Milk", sku: "FRM-SKU-1001", quantity: 15, previousStock: 60, newStock: 45, referenceNo: "ORD-BATCH-991", warehouse: "Hub-B (Gandhinagar Central)", notes: "Dispatched for express afternoon delivery." },
        { id: "LOG-3", date: "2026-07-23 11:15 AM", type: "Damaged Stock", productId: "p3", productName: "Organic Spinach (Palak)", sku: "FRM-SKU-1002", quantity: 4, previousStock: 30, newStock: 26, referenceNo: "DMG-8812", warehouse: "Hub-A (North Ahmedabad)", notes: "Wilted leaves during transport." }
      ],
      suppliers: buildInitialSuppliers(),
      orders: buildInitialOrders(),
      customers: buildInitialCustomers(),
      coupons: buildInitialCoupons(),
      banners: buildInitialBanners(),
      cmsSections: buildInitialCMS(),
      reviews: buildInitialReviews(),
      deliveryZones: buildInitialZones(),
      notificationTemplates: buildInitialNotifications(),
      settings: buildInitialSettings(),
      priceHistory: [
        { id: "PH-1", productId: "p1", productName: "Alphonso Mangoes (Ratnagiri)", sku: "FRM-SKU-1000", oldPrice: 420, newPrice: 440, oldMrp: 480, newMrp: 500, user: "Super Admin", date: "2026-07-25", time: "08:30 AM", reason: "Seasonal supplier price increase" }
      ],
      stockHistory: [
        { id: "SH-1", productId: "p1", productName: "Alphonso Mangoes (Ratnagiri)", sku: "FRM-SKU-1000", oldStock: 20, newStock: 70, reason: "Purchase", user: "Super Admin", date: "2026-07-25", time: "08:00 AM", notes: "Fresh morning batch arrived." },
        { id: "SH-2", productId: "p2", productName: "Farm Fresh Cow Milk", sku: "FRM-SKU-1001", oldStock: 60, newStock: 45, reason: "Sale", user: "System", date: "2026-07-24", time: "02:30 PM", notes: "Order dispatch batch #991" }
      ],
      activityLogs: [
        { id: "ACT-1", timestamp: "2026-07-25 09:00 AM", date: "2026-07-25", time: "09:00 AM", ip: "192.168.1.104", browser: "Chrome 126.0 (Windows)", user: "Aarav Patel (Super Admin)", role: "Super Admin", action: "Logged in to Admin Dashboard", module: "Authentication" },
        { id: "ACT-2", timestamp: "2026-07-25 09:15 AM", date: "2026-07-25", time: "09:15 AM", ip: "192.168.1.104", browser: "Chrome 126.0 (Windows)", user: "Aarav Patel (Super Admin)", role: "Super Admin", action: "Updated stock for Alphonso Mangoes (+50 units)", module: "Inventory" },
        { id: "ACT-3", timestamp: "2026-07-25 09:45 AM", date: "2026-07-25", time: "09:45 AM", ip: "192.168.1.104", browser: "Chrome 126.0 (Windows)", user: "Aarav Patel (Super Admin)", role: "Super Admin", action: "Assigned Delivery Partner Vikram Rathod to order #FRM-ORD-88210", module: "Orders" }
      ],

      logAction: (user, role, action, module) => {
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const newLog: ActivityLog = {
          id: `ACT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          timestamp: `${dateStr} ${timeStr}`,
          date: dateStr,
          time: timeStr,
          ip: "192.168.1.104 (Local)",
          browser: typeof navigator !== "undefined" ? navigator.userAgent.split(" ")[0] || "Web Browser" : "Server/Node",
          user: user || "System Admin",
          role: role || "Super Admin",
          action,
          module
        };
        set((s) => ({ activityLogs: [newLog, ...s.activityLogs.slice(0, 199)] }));
      },

      clearActivityLogs: () => set({ activityLogs: [] }),

      // Products CRUD
      addProduct: (prodData, user, role) => {
        const id = `prod_${Math.random().toString(36).slice(2, 9)}`;
        const newProd: AdminProduct = { ...prodData, id };
        set((s) => ({ products: [newProd, ...s.products] }));
        get().logAction(user, role, `Added new product: ${newProd.name} (${newProd.sku})`, "Products");
      },

      updateProduct: (id, updates, user, role) => {
        set((s) => ({
          products: s.products.map((p) => {
            if (p.id === id) {
              const updated = { ...p, ...updates };
              if (updates.costPrice !== undefined || updates.weights !== undefined) {
                const sp = updated.weights[0]?.price ?? p.weights[0]?.price ?? 100;
                const cp = updated.costPrice ?? p.costPrice;
                updated.marginPercent = Math.round(((sp - cp) / sp) * 100);
              }
              return updated;
            }
            return p;
          })
        }));
        const target = get().products.find((p) => p.id === id);
        get().logAction(user, role, `Updated product details for ${target?.name || id}`, "Products");
      },

      deleteProduct: (id, user, role) => {
        const target = get().products.find((p) => p.id === id);
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        get().logAction(user, role, `Deleted product: ${target?.name || id}`, "Products");
      },

      duplicateProduct: (id, user, role) => {
        const target = get().products.find((p) => p.id === id);
        if (!target) return;
        const newId = `prod_${Math.random().toString(36).slice(2, 9)}`;
        const copy: AdminProduct = {
          ...target,
          id: newId,
          name: `${target.name} (Copy)`,
          sku: `${target.sku}-COPY-${Math.floor(Math.random()*100)}`,
          barcode: `${target.barcode}${Math.floor(Math.random()*10)}`,
          status: "Draft"
        };
        set((s) => ({ products: [copy, ...s.products] }));
        get().logAction(user, role, `Duplicated product ${target.name} -> ${copy.name}`, "Products");
      },

      archiveProduct: (id, user, role) => {
        get().updateProduct(id, { status: "Hidden" }, user, role);
        const target = get().products.find((p) => p.id === id);
        get().logAction(user, role, `Archived product: ${target?.name || id}`, "Products");
      },

      restoreProduct: (id, user, role) => {
        get().updateProduct(id, { status: "Active" }, user, role);
        const target = get().products.find((p) => p.id === id);
        get().logAction(user, role, `Restored product to Active: ${target?.name || id}`, "Products");
      },

      bulkUpdateProducts: (ids, updates, actionName, user, role) => {
        set((s) => ({
          products: s.products.map((p) => ids.includes(p.id) ? { ...p, ...updates } : p)
        }));
        get().logAction(user, role, `Bulk ${actionName} applied on ${ids.length} products`, "Products");
      },

      updateProductStock: (id, newStock, user, role) => {
        const p = get().products.find((x) => x.id === id);
        if (p && p.currentStock !== newStock) {
          get().recordStockChange({
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            oldStock: p.currentStock,
            newStock,
            reason: "Manual Update",
            user: user || "Super Admin",
            notes: "Quick inline stock update"
          });
        }
        set((s) => ({
          products: s.products.map((p) => p.id === id ? { ...p, currentStock: newStock, availableStock: newStock - (p.reservedStock || 0), status: newStock > 0 ? "Active" : "Out of Stock" } : p)
        }));
        get().logAction(user, role, `Updated stock for product ${id} to ${newStock}`, "Inventory");
      },

      updateProductStockGrams: (id, grams, user, role) => {
        const p = get().products.find((x) => x.id === id);
        if (!p) return;
        const prev = p.stockGrams ?? 0;
        const safe = Math.max(0, Math.round(grams)); // integer grams — no float arithmetic
        const info = productStockInfo({ weights: p.weights, stockGrams: safe, minStockGrams: p.minStockGrams });
        set((s) => ({
          products: s.products.map((x) =>
            x.id === id
              ? {
                  ...x,
                  stockGrams: safe,
                  currentStock: safe,
                  stock: safe,
                  availableStock: safe,
                  status: info.allOut ? (x.status === "Active" ? "Out of Stock" : x.status) : (x.status === "Out of Stock" ? "Active" : x.status),
                }
              : x
          ),
        }));
        get().recordStockChange({
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          oldStock: prev,
          newStock: safe,
          reason: "Manual Update",
          user: user || "Super Admin",
          notes: `Stock set to ${formatWeight(safe)}`,
        });
        get().logAction(user, role, `Stock changed: ${p.name} — ${formatWeight(prev)} → ${formatWeight(safe)}`, "Inventory");
      },

      recordPriceChange: (recordData) => {
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const newRecord: PriceHistoryRecord = {
          ...recordData,
          id: `PH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          date: dateStr,
          time: timeStr
        };
        set((s) => ({ priceHistory: [newRecord, ...s.priceHistory.slice(0, 499)] }));
      },

      recordStockChange: (recordData) => {
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const newRecord: StockHistoryRecord = {
          ...recordData,
          id: `SH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          date: dateStr,
          time: timeStr
        };
        set((s) => ({ stockHistory: [newRecord, ...s.stockHistory.slice(0, 499)] }));
      },

      batchUpdateProductsInline: (edits, user, role, reason) => {
        const currentList = get().products;
        const newPriceRecords: Omit<PriceHistoryRecord, "id" | "date" | "time">[] = [];
        const newStockRecords: Omit<StockHistoryRecord, "id" | "date" | "time">[] = [];

        const updatedProducts = currentList.map((p) => {
          const edit = edits[p.id];
          if (!edit) return p;

          const oldPrice = p.weights[0]?.price ?? p.price;
          const oldMrp = p.weights[0]?.mrp ?? p.mrp;
          const newPrice = edit.price !== undefined ? edit.price : oldPrice;
          const newMrp = edit.mrp !== undefined ? edit.mrp : oldMrp;

          if (newPrice !== oldPrice || newMrp !== oldMrp) {
            newPriceRecords.push({
              productId: p.id,
              productName: p.name,
              sku: p.sku,
              oldPrice,
              newPrice,
              oldMrp,
              newMrp,
              user: user || "Super Admin",
              reason: reason || "Spreadsheet inline price update"
            });
          }

          if (edit.currentStock !== undefined && edit.currentStock !== p.currentStock) {
            newStockRecords.push({
              productId: p.id,
              productName: p.name,
              sku: p.sku,
              oldStock: p.currentStock,
              newStock: edit.currentStock,
              reason: "Manual Update",
              user: user || "Super Admin",
              notes: reason || "Spreadsheet inline stock update"
            });
          }

          const updated = { ...p, ...edit };
          if (edit.price !== undefined || edit.costPrice !== undefined || edit.weights !== undefined) {
            const sp = edit.price !== undefined ? edit.price : (updated.weights[0]?.price ?? p.weights[0]?.price ?? 100);
            const cp = edit.costPrice !== undefined ? edit.costPrice : p.costPrice;
            updated.marginPercent = Math.round(((sp - cp) / sp) * 100);
            if (updated.weights && updated.weights.length > 0) {
              updated.weights = updated.weights.map((w, idx) => idx === 0 ? { ...w, price: sp, mrp: edit.mrp !== undefined ? edit.mrp : (w.mrp ?? newMrp) } : w);
            }
          }
          if (edit.currentStock !== undefined) {
            updated.availableStock = edit.currentStock - (p.reservedStock || 0);
            if (edit.status === undefined) {
              updated.status = edit.currentStock > 0 ? "Active" : "Out of Stock";
            }
          }
          return updated;
        });

        set({ products: updatedProducts });

        newPriceRecords.forEach((r) => get().recordPriceChange(r));
        newStockRecords.forEach((r) => get().recordStockChange(r));

        get().logAction(user, role, `Spreadsheet inline batch updated ${Object.keys(edits).length} products`, "Products");
      },

      importProductsCSV: (importedList, user, role) => {
        let updatedCount = 0;
        let createdCount = 0;
        const currentList = get().products;
        const edits: Record<string, Partial<AdminProduct>> = {};

        importedList.forEach((item, idx) => {
          const match = currentList.find((p) =>
            (item.sku && p.sku.toLowerCase() === item.sku.toLowerCase()) ||
            (item.barcode && p.barcode && p.barcode.toLowerCase() === item.barcode.toLowerCase()) ||
            (item.id && p.id === item.id)
          );
          if (match) {
            updatedCount++;
            edits[match.id] = item;
          } else if (item.name) {
            createdCount++;
            get().addProduct({
              name: item.name,
              slug: item.name.toLowerCase().replace(/\s+/g, "-"),
              sku: item.sku || `FLK-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
              barcode: item.barcode || `890100${Math.floor(1000 + Math.random() * 9000)}`,
              category: item.category || "vegetables",
              subcategory: item.subcategory || "Fresh Produce",
              brand: item.brand || "FlashKart Fresh",
              tagline: item.tagline || "Fresh produce",
              description: item.description || "Fresh quality produce.",
              image: item.image || "/images/categories/vegetables.png",
              gallery: item.gallery || ["/images/categories/vegetables.png"],
              weights: [{ label: item.unit || "1 unit", grams: 500, price: item.price ?? 100, mrp: item.mrp ?? 120 }],
              costPrice: item.costPrice ?? 70,
              taxPercent: item.taxPercent ?? 5,
              marginPercent: item.marginPercent ?? 25,
              currentStock: item.currentStock ?? 50,
              reservedStock: 0,
              availableStock: item.currentStock ?? 50,
              minStock: item.minStock ?? 15,
              maxStock: item.maxStock ?? 250,
              warehouse: item.warehouse || "Gandhinagar Central Hub",
              batchNumber: `BATCH-2026-${Math.floor(100 + Math.random()*900)}`,
              status: (item.status as any) || "Active",
              labels: (item.labels as any) || ["Fresh"],
              badge: (item.badge as any) || "None",
              deliveryTime: (item.deliveryTime as any) || "Morning",
              seoTitle: `${item.name} at FlashKart`,
              seoDescription: `Buy fresh ${item.name}`,
              seoKeywords: `${item.name}, fresh vegetables, seasonal fruits`,
              ogImage: item.image || "/images/categories/vegetables.png",
              benefits: ["Fresh", "Organic"],
              storage: "Cool dry place",
              origin: "India",
              rating: 4.8,
              reviews: 5,
              modes: ["instant"]
            } as any, user, role);
          }
        });

        if (Object.keys(edits).length > 0) {
          get().batchUpdateProductsInline(edits, user, role, "CSV Bulk Import");
        }

        get().logAction(user, role, `CSV Import: Updated ${updatedCount} existing and created ${createdCount} new products`, "Products");
        return { updatedCount, createdCount };
      },

      // Inventory Actions
      addInventoryLog: (logData, user, role) => {
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
        const newLog: InventoryLog = {
          ...logData,
          id: `LOG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          date: dateStr
        };
        set((s) => ({
          inventoryLogs: [newLog, ...s.inventoryLogs],
          products: s.products.map((p) => p.id === logData.productId ? { ...p, currentStock: logData.newStock, availableStock: logData.newStock - p.reservedStock, status: logData.newStock > 0 ? "Active" : "Out of Stock" } : p)
        }));
        get().logAction(user, role, `Stock adjustment (${logData.type}): ${logData.productName} -> New stock: ${logData.newStock}`, "Inventory");
      },

      updateSupplier: (id, updates, user, role) => {
        set((s) => ({ suppliers: s.suppliers.map((sup) => sup.id === id ? { ...sup, ...updates } : sup) }));
        get().logAction(user, role, `Updated supplier info for ID: ${id}`, "Inventory");
      },

      addSupplier: (supData, user, role) => {
        const id = `SUP-${Math.floor(10 + Math.random() * 90)}`;
        set((s) => ({ suppliers: [...s.suppliers, { ...supData, id }] }));
        get().logAction(user, role, `Added new supplier: ${supData.name}`, "Inventory");
      },

      // Categories & Brands
      addCategory: (cat, user, role) => {
        set((s) => ({ categories: [...s.categories, cat] }));
        get().logAction(user, role, `Created new category: ${cat.name}`, "Categories");
      },
      updateCategory: (slug, updates, user, role) => {
        set((s) => ({ categories: s.categories.map((c) => c.slug === slug ? { ...c, ...updates } : c) }));
        get().logAction(user, role, `Updated category: ${slug}`, "Categories");
      },
      deleteCategory: (slug, user, role) => {
        set((s) => ({ categories: s.categories.filter((c) => c.slug !== slug) }));
        get().logAction(user, role, `Deleted category: ${slug}`, "Categories");
      },

      // Orders & Customers
      placeCustomerOrder: (order) => {
        const before = get().products;
        // Grams a line consumes: pack weight (from the product's live variant list,
        // falling back to any grams stamped on the item) × quantity.
        const packGramsOf = (i: OrderItem): number => {
          const p = before.find((x) => x.id === i.productId);
          const w = p?.weights.find((wt) => wt.label === i.weight);
          return Math.max(1, Math.round(w?.grams ?? i.packGrams ?? 1));
        };
        // 1) VALIDATE: total ordered WEIGHT per product vs the shared gram pool.
        // All lines of a product draw from the same physical inventory.
        const wantedGrams = new Map<string, number>();
        order.items.forEach((i) => {
          wantedGrams.set(i.productId, (wantedGrams.get(i.productId) || 0) + packGramsOf(i) * i.quantity);
        });
        for (const [productId, grams] of wantedGrams) {
          const p = before.find((x) => x.id === productId);
          if (!p) continue;
          const available = p.stockGrams ?? 0;
          if (grams > available) {
            return {
              ok: false,
              message:
                available <= 0
                  ? `"${p.name}" is out of stock.`
                  : `Only ${formatWeight(available)} of "${p.name}" available.`,
            };
          }
        }
        // 2) COMMIT: stamp exact weights on the order (preserved history) and deduct
        // integer grams from each product's shared pool — all-or-nothing.
        const stampedOrder: AdminOrder = {
          ...order,
          items: order.items.map((i) => ({
            ...i,
            packGrams: packGramsOf(i),
            totalGrams: packGramsOf(i) * i.quantity,
          })),
        };
        wantedGrams.forEach((grams, productId) => {
          const p = before.find((x) => x.id === productId);
          if (!p) return;
          const prev = p.stockGrams ?? 0;
          get().recordStockChange({
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            oldStock: prev,
            newStock: Math.max(0, prev - grams),
            reason: "Sale",
            user: order.customerName || "Customer",
            notes: `Order ${order.id} — ${formatWeight(grams)} sold`,
          });
        });
        set((s) => ({
          orders: [stampedOrder, ...s.orders],
          products: s.products.map((p) => {
            const grams = wantedGrams.get(p.id);
            if (!grams) return p;
            const next = Math.max(0, (p.stockGrams ?? 0) - grams);
            const info = productStockInfo({ weights: p.weights, stockGrams: next, minStockGrams: p.minStockGrams });
            return {
              ...p,
              stockGrams: next,
              currentStock: next,
              stock: next,
              availableStock: next,
              // Out of Stock only when the remaining grams can't fulfil any active pack
              status: info.allOut && p.status === "Active" ? "Out of Stock" : !info.allOut && p.status === "Out of Stock" ? "Active" : p.status,
            };
          }),
        }));
        get().logAction(
          order.customerName || "Customer",
          "Read Only",
          `New order ${order.id} placed — ${order.items.length} item(s), total ₹${order.total}`,
          "Orders"
        );
        return { ok: true };
      },
      updateOrderStatus: (orderId, status, user, role) => {
        const RESTORED: OrderStatus[] = ["Cancelled", "Returned", "Refunded"];
        const order = get().orders.find((o) => o.id === orderId);
        // Restore stock to the EXACT variants bought when an order is cancelled/returned
        // for the first time (guarded so a repeat status change never double-restores).
        const shouldRestore = !!order && RESTORED.includes(status) && !RESTORED.includes(order.status);
        if (shouldRestore && order) {
          const before = get().products;
          // Restore the EXACT weight each line consumed (stamped at purchase time,
          // with the pack's live gram weight as fallback for older orders).
          const restoreGrams = new Map<string, number>();
          order.items.forEach((i) => {
            const p = before.find((x) => x.id === i.productId);
            const w = p?.weights.find((wt) => wt.label === i.weight);
            const grams = (i.totalGrams ?? Math.max(1, Math.round(w?.grams ?? 1)) * i.quantity);
            restoreGrams.set(i.productId, (restoreGrams.get(i.productId) || 0) + grams);
          });
          restoreGrams.forEach((grams, productId) => {
            const p = before.find((x) => x.id === productId);
            if (!p) return;
            const prev = p.stockGrams ?? 0;
            get().recordStockChange({
              productId: p.id,
              productName: p.name,
              sku: p.sku,
              oldStock: prev,
              newStock: prev + grams,
              reason: "Return",
              user: user || "Super Admin",
              notes: `Order ${orderId} ${status.toLowerCase()} — ${formatWeight(grams)} restored`,
            });
          });
          set((s) => ({
            products: s.products.map((p) => {
              const grams = restoreGrams.get(p.id);
              if (!grams) return p;
              const next = (p.stockGrams ?? 0) + grams;
              const info = productStockInfo({ weights: p.weights, stockGrams: next, minStockGrams: p.minStockGrams });
              return {
                ...p,
                stockGrams: next,
                currentStock: next,
                stock: next,
                availableStock: next,
                status: !info.allOut && p.status === "Out of Stock" ? "Active" : p.status,
              };
            }),
          }));
        }
        set((s) => ({ orders: s.orders.map((o) => o.id === orderId ? { ...o, status } : o) }));
        get().logAction(user, role, `Updated Order #${orderId} status to '${status}'${shouldRestore ? " — item stock restored to variants" : ""}`, "Orders");
      },
      assignDeliveryPartner: (orderId, partner, user, role) => {
        set((s) => ({ orders: s.orders.map((o) => o.id === orderId ? { ...o, assignedPartner: partner, status: "Out for Delivery" } : o) }));
        get().logAction(user, role, `Assigned delivery partner ${partner.name} to Order #${orderId}`, "Orders");
      },
      assignOrderDriver: (orderId, driver, user, role) => {
        set((s) => ({ orders: s.orders.map((o) => o.id === orderId ? { ...o, assignedDriver: driver, assignedPartner: { name: driver.name, phone: driver.phone, vehicleNo: driver.vehicleNo || driver.vehicle || "GJ-01-AB-1234" }, status: "Out for Delivery" } : o) }));
        get().logAction(user, role, `Assigned order driver ${driver.name} to Order #${orderId}`, "Orders");
      },
      bulkUpdateOrderStatus: (ids, status, user, role) => {
        set((s) => ({ orders: s.orders.map((o) => ids.includes(o.id) ? { ...o, status } : o) }));
        get().logAction(user, role, `Bulk updated ${ids.length} orders to status '${status}'`, "Orders");
      },
      updateCustomerWallet: (customerId, amount, reason, user, role) => {
        set((s) => ({
          customers: s.customers.map((c) => {
            if (c.id === customerId) {
              const newBal = Math.max(0, c.walletBalance + amount);
              return { ...c, walletBalance: newBal };
            }
            return c;
          })
        }));
        get().logAction(user, role, `Wallet adjusted (${amount >= 0 ? "+" : ""}${amount} INR) for customer ${customerId}. Reason: ${reason}`, "Customers");
      },
      adjustCustomerWallet: (customerId, amount, reason, user, role) => {
        get().updateCustomerWallet(customerId, amount, reason, user, role);
      },
      toggleBlockCustomer: (customerId, user, role) => {
        let newStatus = "Active";
        set((s) => ({
          customers: s.customers.map((c) => {
            if (c.id === customerId) {
              newStatus = c.status === "Active" ? "Blocked" : "Active";
              return { ...c, status: newStatus as "Active" | "Blocked" };
            }
            return c;
          })
        }));
        get().logAction(user, role, `Changed status of customer ${customerId} to ${newStatus}`, "Customers");
      },
      updateCustomerStatus: (customerId, status, user, role) => {
        set((s) => ({
          customers: s.customers.map((c) => c.id === customerId ? { ...c, status } : c)
        }));
        get().logAction(user, role, `Changed status of customer ${customerId} to ${status}`, "Customers");
      },

      // Marketing & Content
      addCoupon: (couponData, user, role) => {
        const id = `CPN-${Math.floor(10 + Math.random() * 90)}`;
        const newCpn: AdminCoupon = { ...couponData, id, usedCount: 0 };
        set((s) => ({ coupons: [newCpn, ...s.coupons] }));
        get().logAction(user, role, `Created new coupon code: ${newCpn.code}`, "Coupons");
      },
      updateCoupon: (id, updates, user, role) => {
        set((s) => ({ coupons: s.coupons.map((c) => c.id === id ? { ...c, ...updates } : c) }));
        get().logAction(user, role, `Updated coupon ID: ${id}`, "Coupons");
      },
      deleteCoupon: (id, user, role) => {
        set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) }));
        get().logAction(user, role, `Deleted coupon ID: ${id}`, "Coupons");
      },

      addBanner: (bannerData, user, role) => {
        const id = `BAN-${Math.floor(10 + Math.random() * 90)}`;
        set((s) => ({ banners: [...s.banners, { ...bannerData, id }] }));
        get().logAction(user, role, `Added promotional banner: ${bannerData.title}`, "Banners");
      },
      updateBanner: (id, updates, user, role) => {
        set((s) => ({ banners: s.banners.map((b) => b.id === id ? { ...b, ...updates } : b) }));
        get().logAction(user, role, `Updated banner ID: ${id}`, "Banners");
      },
      deleteBanner: (id, user, role) => {
        set((s) => ({ banners: s.banners.filter((b) => b.id !== id) }));
        get().logAction(user, role, `Deleted banner ID: ${id}`, "Banners");
      },

      updateCMSSection: (id, updates, user, role) => {
        set((s) => ({ cmsSections: s.cmsSections.map((sec) => sec.id === id ? { ...sec, ...updates } : sec) }));
        get().logAction(user, role, `Updated CMS section ID: ${id}`, "Homepage CMS");
      },

      updateReviewStatus: (reviewId, status, user, role, reply) => {
        set((s) => ({
          reviews: s.reviews.map((r) => r.id === reviewId ? { ...r, status: status as any, reply: reply || r.reply } : r)
        }));
        get().logAction(user, role, `Review #${reviewId} marked as ${status}${reply ? " with reply" : ""}`, "Reviews");
      },

      // Delivery, Notifications & Settings
      addDeliveryZone: (zoneData, user, role) => {
        const id = `ZONE-${Math.floor(10 + Math.random() * 90)}`;
        set((s) => ({ deliveryZones: [...s.deliveryZones, { ...zoneData, id }] }));
        get().logAction(user, role, `Added delivery zone: ${zoneData.name}`, "Delivery");
      },
      updateDeliveryZone: (id, updates, user, role) => {
        set((s) => ({ deliveryZones: s.deliveryZones.map((z) => z.id === id ? { ...z, ...updates } : z) }));
        get().logAction(user, role, `Updated delivery zone ID: ${id}`, "Delivery");
      },
      updateNotificationTemplate: (id, updates, user, role) => {
        set((s) => ({ notificationTemplates: s.notificationTemplates.map((n) => n.id === id ? { ...n, ...updates } : n) }));
        get().logAction(user, role, `Updated notification template ID: ${id}`, "Notifications");
      },
      updateSettings: (newSettings, user, role) => {
        set((s) => ({ settings: { ...s.settings, ...newSettings } }));
        get().logAction(user, role, `Updated global store settings and API keys`, "Settings");
      }
    }),
    {
      name: "flashkart-admin-store-v1",
      version: 2,
      // v0 → v1: normalize per-variant pack counts (shared pool split, total preserved).
      // v1 → v2: WEIGHT-BASED inventory — pack counts were counts of packs, so the
      // physical stock is Σ (pack count × pack weight in grams). One shared gram pool
      // per product; variants become pure pack sizes. No data deleted.
      migrate: (persisted: any, version: number) => {
        if (version < 1 && persisted?.products) {
          persisted.products = persisted.products.map((p: AdminProduct) => ({
            ...p,
            weights: normalizeVariantStocks(p.weights || [], p.currentStock ?? 0),
          }));
        }
        if (version < 2 && persisted?.products) {
          persisted.products = persisted.products.map((p: AdminProduct) => {
            const stockGrams = p.stockGrams ?? packCountsToGrams(p.weights || []);
            const minStockGrams = p.minStockGrams ?? 2000;
            const info = productStockInfo({ weights: p.weights || [], stockGrams, minStockGrams });
            return {
              ...p,
              stockGrams,
              minStockGrams,
              currentStock: stockGrams,
              stock: stockGrams,
              availableStock: stockGrams,
              status: info.allOut && p.status === "Active" ? "Out of Stock" : !info.allOut && p.status === "Out of Stock" ? "Active" : p.status,
            };
          });
        }
        return persisted;
      },
    }
  )
);
