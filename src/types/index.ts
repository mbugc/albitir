import type { Timestamp } from 'firebase/firestore';

// ─── User ────────────────────────────────────────────────────────────
export interface User {
  id: string;                    // Firebase Auth UID
  email: string;
  name: string;
  phone?: string;
  country: string;               // "TR" default
  role: UserRole;
  location: UserLocation;
  favouriteOfferIds: string[];
  walletBalance: number;         // Kuruş cinsinden (10000 = 100 TL)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserLocation {
  city: string;                  // e.g. "Istanbul"
  latitude: number;
  longitude: number;
  radiusKm: number;              // 1-50, default 10
}

export type UserRole = 'consumer' | 'business';

// ─── Business ────────────────────────────────────────────────────────
export interface Business {
  id: string;                    // Auto-generated doc ID
  ownerId: string;               // Firebase Auth UID
  name: string;
  email: string;
  phone: string;
  country: string;               // "TR"
  category: BusinessCategory;
  surplusCategory: SurplusCategory;
  address: BusinessAddress;
  geo: {
    latitude: number;
    longitude: number;
  };
  iban?: string;                 // TR IBAN for payouts
  documents: BusinessDocument[];
  reviewNotes?: string;          // Admin notes on review
  status: BusinessStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BusinessAddress {
  line1: string;
  city: string;
  postalCode?: string;
  country: string;
}

export interface BusinessDocument {
  type: string;                  // e.g. "vergi_levhasi", "imza_sirkuleri"
  url: string;                   // Storage URL
  status: 'uploaded' | 'approved' | 'rejected';
}

export type BusinessCategory =
  | 'restaurant'
  | 'cafe'
  | 'bakery'
  | 'supermarket'
  | 'hotel'
  | 'other';

export type SurplusCategory =
  | 'meals'
  | 'bread_and_pastries'
  | 'groceries'
  | 'other';

export type BusinessStatus =
  | 'PENDING_REVIEW'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'NEEDS_INFO'
  | 'REJECTED';

// ─── Offer (Surprise Bag) ────────────────────────────────────────────
export interface Offer {
  id: string;
  businessId: string;
  businessName: string;          // Denormalized
  businessLogo?: string;         // Storage URL
  title: string;                 // "Donut Surprise Bag"
  description: string;           // Max 200 chars
  category: SurplusCategory;
  priceOriginal: number;         // e.g. 300 (TRY)
  priceDiscounted: number;       // e.g. 120 (TRY) — auto-calculated from discount %
  discountPercent: number;       // e.g. 60 (means 60% off)
  currency: string;              // "TRY"
  quantityTotal: number;         // Per day
  quantityAvailable: number;     // Decremented on order
  daysOfWeek: number[];          // [1,2,3,4,5] Mon=1, Sun=7
  pickupStart: string;           // "17:00" HH:mm
  pickupEnd: string;             // "19:00"
  images: string[];              // Storage URLs
  tags: string[];                // ["Bread & pastries"]
  isActive: boolean;
  geo: {
    latitude: number;
    longitude: number;
  };
  address: string;               // Denormalized display address
  rating: number;                // Average star rating (0 = no ratings)
  ratingCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Order (replaces Reservation) ───────────────────────────────────
export interface Order {
  id: string;
  orderNumber: string;           // "ORD-1001" format
  userId: string;
  offerId: string;
  businessId: string;
  offerTitle: string;            // Denormalized
  businessName: string;          // Denormalized
  businessAddress: string;       // Denormalized
  quantity: number;
  pricePerUnit: number;          // Discounted price per item
  subtotal: number;              // pricePerUnit × quantity
  commission: number;            // 25% of subtotal (platform fee)
  commissionRate: number;        // 0.25
  tax: number;                   // subtotal × 0.08 KDV
  creditApplied: number;         // Wallet credit used (kuruş)
  total: number;                 // subtotal + tax - creditApplied
  pickupCode: string;            // 4-digit code
  pickupNote?: string;           // Optional consumer note
  pickupDate: string;            // "2026-02-26" ISO date
  pickupStart: string;           // "17:00"
  pickupEnd: string;             // "19:00"
  status: OrderStatus;
  paymentStatus: 'PLACEHOLDER';  // Placeholder for MVP
  rating?: OrderRating;          // Populated after completed
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type OrderStatus = 'CREATED' | 'PAID' | 'READY' | 'COMPLETED' | 'NO_SHOW';

export interface OrderRating {
  stars: number;                 // 1-5
  comment?: string;
  createdAt: Timestamp;
}

// ─── Wallet ─────────────────────────────────────────────────────────
export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'signup_bonus' | 'credit_used' | 'refund';
  amount: number;                // Kuruş cinsinden (positive = credit, negative = debit)
  orderId?: string;
  description: string;
  createdAt: Timestamp;
}

// ─── Sort + Filter ───────────────────────────────────────────────────
export type SortOption = 'relevance' | 'distance' | 'price' | 'rating';

export type InventoryStatus =
  | { type: 'available'; count: number }
  | { type: 'limited'; count: number }
  | { type: 'soldOut' };

// ─── Payment (placeholder) ───────────────────────────────────────────
export interface PaymentResult {
  success: boolean;
  transactionId: string;
}

// ─── Admin ──────────────────────────────────────────────────────────
export interface Admin {
  userId: string;
  email: string;
  role: 'admin';
  createdAt: Timestamp;
}

// ─── Turkish cities for MVP location picker ──────────────────────────
export const TURKISH_CITIES = [
  { name: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Ankara', latitude: 39.9334, longitude: 32.8597 },
  { name: 'Izmir', latitude: 38.4192, longitude: 27.1287 },
  { name: 'Bursa', latitude: 40.1826, longitude: 29.0665 },
  { name: 'Antalya', latitude: 36.8969, longitude: 30.7133 },
  { name: 'Adana', latitude: 37.0, longitude: 35.3213 },
  { name: 'Gaziantep', latitude: 37.0662, longitude: 37.3833 },
  { name: 'Konya', latitude: 37.8746, longitude: 32.4932 },
  { name: 'Mersin', latitude: 36.8121, longitude: 34.6415 },
  { name: 'Kayseri', latitude: 38.7312, longitude: 35.4787 },
] as const;

// ─── Business category labels (Turkish) ─────────────────────────────
export const BUSINESS_CATEGORY_LABELS: Record<BusinessCategory, string> = {
  restaurant: 'Restoran',
  cafe: 'Kafe',
  bakery: 'Fırın / Pastane',
  supermarket: 'Market',
  hotel: 'Otel',
  other: 'Diğer',
};

export const SURPLUS_CATEGORY_LABELS: Record<SurplusCategory, string> = {
  meals: 'Yemek',
  bread_and_pastries: 'Ekmek & Pastane',
  groceries: 'Market Ürünleri',
  other: 'Diğer',
};

// ─── Order status labels (Turkish) ──────────────────────────────────
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: 'Oluşturuldu',
  PAID: 'Ödendi',
  READY: 'Hazır',
  COMPLETED: 'Teslim Edildi',
  NO_SHOW: 'Teslim Alınmadı',
};

// ─── Commission rate ────────────────────────────────────────────────
export const COMMISSION_RATE = 0.25; // 25% on discounted price
export const TAX_RATE = 0.08;        // 8% KDV
export const SIGNUP_BONUS_AMOUNT = 10000; // 100 TL in kuruş

// ─── Days of week ────────────────────────────────────────────────────
export const DAYS_OF_WEEK = [
  { value: 1, label: 'Pzt', full: 'Pazartesi' },
  { value: 2, label: 'Sal', full: 'Salı' },
  { value: 3, label: 'Çar', full: 'Çarşamba' },
  { value: 4, label: 'Per', full: 'Perşembe' },
  { value: 5, label: 'Cum', full: 'Cuma' },
  { value: 6, label: 'Cmt', full: 'Cumartesi' },
  { value: 7, label: 'Paz', full: 'Pazar' },
] as const;
