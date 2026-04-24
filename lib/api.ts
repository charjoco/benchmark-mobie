import { API_BASE_URL } from "./constants";
import type {
  FilterState,
  ProductRow,
  ProductsApiResponse,
  CollectionSummary,
  CollectionDetail,
  ArticleSummary,
  ArticleDetail,
} from "./types";

export function buildProductsUrl(filters: FilterState, page: number): string {
  const params = new URLSearchParams();

  if (filters.feedMode === "drops") params.set("drops", "true");
  else if (filters.feedMode === "price-drops") params.set("priceDrops", "true");


  if (!filters.feedMode && filters.category) params.set("category", filters.category);
  filters.brands.forEach((b) => params.append("brand", b));
  filters.colors.forEach((c) => params.append("color", c));
  filters.sizes.forEach((s) => params.append("size", s));
  if (filters.onSale) params.set("onSale", "true");
  if (filters.isNew) params.set("isNew", "true");
  if (filters.sortBy !== "lastSeenAt") params.set("sortBy", filters.sortBy);
  params.set("page", String(page));

  return `${API_BASE_URL}/api/products?${params.toString()}`;
}

export async function fetchProducts(
  filters: FilterState,
  page: number
): Promise<ProductsApiResponse> {
  const url = buildProductsUrl(filters, page);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<ProductsApiResponse>;
}

export async function fetchDrops(): Promise<ProductRow[]> {
  const params = new URLSearchParams({ drops: "true", sortBy: "newest" });
  const url = `${API_BASE_URL}/api/products?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = (await res.json()) as ProductsApiResponse;
  return data.products;
}

export async function fetchPriceDrops(): Promise<ProductRow[]> {
  const params = new URLSearchParams({ priceDrops: "true", sortBy: "newest" });
  const url = `${API_BASE_URL}/api/products?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = (await res.json()) as ProductsApiResponse;
  return data.products;
}

export async function fetchCollections(): Promise<CollectionSummary[]> {
  const res = await fetch(`${API_BASE_URL}/api/collections`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = (await res.json()) as { collections: CollectionSummary[] };
  return data.collections;
}

export async function fetchCollection(slug: string): Promise<CollectionDetail> {
  const res = await fetch(`${API_BASE_URL}/api/collections/${slug}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<CollectionDetail>;
}

export async function fetchArticles(): Promise<ArticleSummary[]> {
  const res = await fetch(`${API_BASE_URL}/api/articles`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = (await res.json()) as { articles: ArticleSummary[] };
  return data.articles;
}

export async function fetchArticle(id: string): Promise<ArticleDetail> {
  const res = await fetch(`${API_BASE_URL}/api/articles/${id}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<ArticleDetail>;
}

