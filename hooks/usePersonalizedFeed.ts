import { useState, useEffect } from "react";
import { fetchProducts } from "@/lib/api";
import { BRANDS } from "@/lib/constants";
import type { UserPreferences } from "@/lib/supabase";
import type { AppCategory, ProductRow } from "@/lib/types";

const STYLE_LEAN_CATEGORIES: Record<string, AppCategory[]> = {
  "performance":     ["shorts", "hoodies", "zips", "pants", "longsleeve"],
  "elevated-basics": ["shirts", "polos", "longsleeve", "sweaters", "pants"],
  "smart-casual":    ["shirts", "polos", "pants", "jackets", "sweaters"],
  "golf":            ["polos", "pants", "jackets", "shorts"],
};

function getRelevantSize(category: string, prefs: UserPreferences): string | null {
  if (category === "shorts" || category === "pants") return prefs.bottom_size;
  if (category === "jackets") return prefs.outerwear_size ?? prefs.top_size;
  return prefs.top_size;
}

function scoreProduct(product: ProductRow, prefs: UserPreferences): number {
  let score = 0;

  // +3 brand match
  if (prefs.preferred_brands.includes(product.brand)) score += 3;

  // +2 size in stock
  const relevantSize = getRelevantSize(product.category, prefs);
  if (relevantSize) {
    const allColorways =
      Array.isArray(product.colorways) && product.colorways.length > 0
        ? product.colorways
        : [{ sizes: product.sizes }];
    const inStock = allColorways.some((cw) =>
      cw.sizes?.some((sv) => sv.size === relevantSize && sv.available)
    );
    if (inStock) score += 2;
  }

  // +1 price in comfort band
  if (prefs.price_comfort) {
    const price = product.price;
    if (
      (prefs.price_comfort === "under-75"  && price <= 75) ||
      (prefs.price_comfort === "75-150"    && price >= 75 && price <= 150) ||
      (prefs.price_comfort === "150-plus"  && price >= 150)
    ) {
      score += 1;
    }
  }

  // +1 category matches style lean
  if (prefs.style_lean.length > 0) {
    const cat = product.category as AppCategory;
    const lean = prefs.style_lean.some((key) =>
      STYLE_LEAN_CATEGORIES[key]?.includes(cat)
    );
    if (lean) score += 1;
  }

  return score;
}

function sortAndTrim(products: ProductRow[], prefs: UserPreferences): ProductRow[] {
  return products
    .map((p) => ({ product: p, score: scoreProduct(p, prefs) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.product.firstSeenAt).getTime() -
        new Date(a.product.firstSeenAt).getTime()
      );
    })
    .slice(0, 6)
    .map(({ product }) => product);
}

interface PersonalizedFeedResult {
  products: ProductRow[];
  isLoading: boolean;
  isFallback: boolean;
  fallbackBrandLabel: string;
}

export function usePersonalizedFeed(prefs: UserPreferences): PersonalizedFeedResult {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackBrandLabel, setFallbackBrandLabel] = useState("");

  useEffect(() => {
    if (!prefs.onboarding_complete || prefs.preferred_brands.length === 0) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setIsFallback(false);

    async function load() {
      try {
        // Primary fetch: new drops from preferred brands
        const primary = await fetchProducts(
          {
            category: null,
            feedMode: "drops",
            brands: prefs.preferred_brands,
            colors: [],
            sizes: [],
            onSale: false,
            isNew: false,
            sortBy: "newest",
          },
          1
        );

        if (cancelled) return;

        if (primary.products.length > 0) {
          setProducts(sortAndTrim(primary.products, prefs));
          setIsFallback(false);
        } else {
          // Fallback: most recent from top preferred brand
          const topBrandKey = prefs.preferred_brands[0];
          const fallback = await fetchProducts(
            {
              category: null,
              feedMode: null,
              brands: [topBrandKey],
              colors: [],
              sizes: [],
              onSale: false,
              isNew: false,
              sortBy: "newest",
            },
            1
          );

          if (cancelled) return;

          const label =
            BRANDS.find((b) => b.key === topBrandKey)?.label ?? topBrandKey;
          setFallbackBrandLabel(label);
          setIsFallback(true);
          setProducts(fallback.products.slice(0, 6));
        }
      } catch (err) {
        if (!cancelled) console.error("[usePersonalizedFeed]", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [
    prefs.onboarding_complete,
    // Use a stable JSON key for the array fields so the effect only re-runs
    // when the actual values change, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(prefs.preferred_brands),
    prefs.top_size,
    prefs.bottom_size,
    prefs.outerwear_size,
    prefs.price_comfort,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(prefs.style_lean),
  ]);

  return { products, isLoading, isFallback, fallbackBrandLabel };
}
