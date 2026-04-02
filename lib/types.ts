export type AppCategory =
  | "shirts"
  | "longsleeve"
  | "hoodies"
  | "sweaters"
  | "zips"
  | "shorts"
  | "pants"
  | "jackets";

export type ColorBucket =
  | "Black"
  | "White"
  | "Grey"
  | "Navy"
  | "Blue"
  | "Green"
  | "Brown"
  | "Red"
  | "Orange"
  | "Yellow"
  | "Purple"
  | "Pink"
  | "Multi"
  | "Other";

export interface SizeVariant {
  size: string;
  available: boolean;
}

export interface Colorway {
  colorName: string;
  colorBucket: string;
  imageUrl: string;
  price: number;
  compareAtPrice: number | null;
  onSale: boolean;
  sizes: SizeVariant[];
  productUrl?: string;
}

export interface Seller {
  seller: string;
  displayName: string;
  url: string;
  price: number;
  compareAtPrice: number | null;
  onSale: boolean;
}

export interface ProductRow {
  id: string;
  externalId: string;
  brand: string;
  title: string;
  handle: string;
  productUrl: string;
  category: string;
  colorName: string;
  colorBucket: string;
  imageUrl: string;
  price: number;
  compareAtPrice: number | null;
  onSale: boolean;
  colorways: Colorway[];
  colorBuckets: string;
  sizes: SizeVariant[];
  inStock: boolean;
  isNew: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  updatedAt: string;
  priceDroppedAt: string | null;
  restockedAt: string | null;
  sellers: Seller[];
}

export interface ProductsApiResponse {
  products: ProductRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type FeedMode = "drops" | "price-drops" | "restocks" | "popular";

export interface FilterState {
  category: AppCategory | null;
  feedMode: FeedMode | null;
  brands: string[];
  colors: ColorBucket[];
  sizes: string[];
  onSale: boolean;
  isNew: boolean;
  sortBy: "lastSeenAt" | "newest" | "price_asc" | "price_desc";
}
