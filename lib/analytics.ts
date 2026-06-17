import PostHog from "posthog-react-native";

export const posthog = new PostHog("phc_kWTXuVaRKUxXp2z5QMHScArgzkSBjcxrQLdqSWSJdbJX", {
  host: "https://us.i.posthog.com",
});

export type EventSource =
  | "feed"
  | "article"
  | "collection"
  | "brand_page"
  | "saved"
  | "category";

export function trackAppOpen() {
  posthog.capture("app_open");
}

export function trackProductView(product: {
  brand: string;
  title: string;
  category: string;
  price: number;
  isNew: boolean;
  onSale: boolean;
  source: EventSource;
  article_id?: string;
  collection_id?: string;
}) {
  posthog.capture("product_viewed", {
    brand: product.brand,
    title: product.title,
    category: product.category,
    price: product.price,
    is_new: product.isNew,
    on_sale: product.onSale,
    source: product.source,
    ...(product.article_id ? { article_id: product.article_id } : {}),
    ...(product.collection_id ? { collection_id: product.collection_id } : {}),
  });
}

export function trackProductTap(product: {
  brand: string;
  title: string;
  price: number;
  url: string;
  source: EventSource;
  article_id?: string;
  collection_id?: string;
}) {
  posthog.capture("product_tapped", {
    brand: product.brand,
    title: product.title,
    price: product.price,
    url: product.url,
    source: product.source,
    ...(product.article_id ? { article_id: product.article_id } : {}),
    ...(product.collection_id ? { collection_id: product.collection_id } : {}),
  });
}

export function trackBrandView(brand: string) {
  posthog.capture("brand_viewed", { brand });
}

export function trackArticleView(params: { article_id: string; title: string }) {
  posthog.capture("article_viewed", {
    article_id: params.article_id,
    title: params.title,
  });
}

export function trackCollectionView(params: { collection_id: string; title: string }) {
  posthog.capture("collection_viewed", {
    collection_id: params.collection_id,
    title: params.title,
  });
}

export function trackProductSaved(product: {
  brand: string;
  title: string;
  source: "product_detail" | "auto_save";
}) {
  posthog.capture("product_saved", {
    brand: product.brand,
    title: product.title,
    source: product.source,
  });
}

export function trackCategoryView(category: string) {
  posthog.capture("category_viewed", { category });
}

export function trackFilterApplied(filters: Record<string, string | number | boolean | null>) {
  posthog.capture("filter_applied", { filters });
}

export function trackSignUp() {
  posthog.capture("sign_up");
}

export function trackOnboardingCompleted(data: {
  brands_count: number;
  style_lean: string[];
  price_comfort: string;
}) {
  posthog.capture("onboarding_completed", data);
}
