export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  createdAt: string; // ISO date string or timestamp string
  updatedAt: string;
  bookmarks: string[]; // array of toolIds
}

export interface ChangelogItem {
  version: string;
  date: string;
  content: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SecretData {
  targetLink: string;
  prompt: string;
  instructions: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  thumbnail: string; // vertical image URL 9:16
  banner: string; // horizontal image URL
  videoDemo?: string; // video embed link or youtube URL
  shortDescription: string;
  longDescription: string; // Rich Text / Markdown
  priceOriginal: number;
  priceSale: number;
  rating: number; // default 5
  reviewCount: number; // default 0
  purchaseCount: number; // default 0
  copyCount: number; // default 0
  categoryId: string;
  tags: string[];
  isHot: boolean;
  isNew: boolean;
  isFree: boolean;
  version: string; // e.g., 'v1.3'
  lastUpdated: string;
  changelog: ChangelogItem[];
  secretData: SecretData;
  faq: FAQItem[];
  seo: SEOData;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide Icon string
  color: string; // Hex color code or Tailwind class name
  order: number;
}

export interface OrderItem {
  toolId: string;
  name: string;
  price: number;
}

export interface Order {
  id: string; // Display order code like KHXXXX
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  couponUsed?: string;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod: 'transfer';
  transferContent: string; // Random string content
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null; // Admin UID or null
}

export interface Coupon {
  id: string;
  code: string; // e.g. AI2026
  type: 'percent' | 'fixed'; // percent or fixed amount in VND
  value: number; // reduction value
  maxUses: number;
  usedCount: number;
  expiryDate: string; // ISO format date
}

export interface GlobalSettings {
  websiteName: string;
  logoUrl: string;
  faviconUrl: string;
  hotline: string;
  socialLinks: {
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  paymentInfo: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
  };
  seoGlobal: {
    metaTitle: string;
    metaDescription: string;
    googleAnalyticsId: string;
  };
}
