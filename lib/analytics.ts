import PostHog from "posthog-react-native";

export const posthog = new PostHog("phc_benchmark_placeholder", {
  host: "https://us.i.posthog.com",
});

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
}) {
  posthog.capture("product_viewed", {
    brand: product.brand,
    title: product.title,
    category: product.category,
    price: product.price,
    is_new: product.isNew,
    on_sale: product.onSale,
  });
}

export function trackProductTap(product: {
  brand: string;
  title: string;
  price: number;
  url: string;
}) {
  posthog.capture("product_tapped", {
    brand: product.brand,
    title: product.title,
    price: product.price,
    url: product.url,
  });
}

export function trackBrandView(brand: string) {
  posthog.capture("brand_viewed", { brand });
}
