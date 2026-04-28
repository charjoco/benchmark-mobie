export type AppCategory =
  | "shirts"
  | "polos"
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
  /** ISO timestamp when this colorway was first seen */
  firstSeenAt?: string;
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
  sellers: Seller[];
}

export interface ProductsApiResponse {
  products: ProductRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type FeedMode = "drops" | "price-drops";

// Collections
export interface CollectionHeroProduct {
  id: string;
  title: string;
  imageUrl: string;
}

export interface CollectionSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  heroImageUrl: string | null;
  heroProduct: CollectionHeroProduct | null;
  productCount: number;
}

export interface CollectionDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  heroImageUrl: string | null;
  products: ProductRow[];
}

// Articles
export interface ArticleHeroImage {
  imageUrl: string;
  altText: string | null;
}

export interface ArticleSummary {
  id: string;
  title: string;
  subtitle: string | null;
  publishedAt: string | null;
  heroImage: ArticleHeroImage | null;
  productCount: number;
}

export interface ArticleImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  position: number;
}

export interface ArticleDetail {
  id: string;
  title: string;
  subtitle: string | null;
  body: string;
  publishedAt: string | null;
  images: ArticleImage[];
  products: ProductRow[];
}

export interface BrandCategoryCount {
  category: string;
  count: number;
}

export interface BrandCategoriesResponse {
  brand: string;
  total: number;
  categories: BrandCategoryCount[];
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface CategoriesResponse {
  total: number;
  categories: CategoryCount[];
}

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
