import type { ProductRow } from "./types";
import type { UserPreferences } from "./supabase";

function getRelevantSize(category: string, prefs: UserPreferences): string | null {
  if (category === "shorts" || category === "pants") return prefs.bottom_size;
  if (category === "jackets") return prefs.outerwear_size ?? prefs.top_size;
  return prefs.top_size;
}

function hasSizeAvailable(product: ProductRow, size: string): boolean {
  const colorways = Array.isArray(product.colorways) ? product.colorways : [];
  if (colorways.length > 0) {
    return colorways.some((cw) =>
      cw.sizes?.some((sv) => sv.size === size && sv.available)
    );
  }
  return product.sizes.some((sv) => sv.size === size && sv.available);
}

/**
 * Computes the Wardrobe Fit badge text for a product card.
 * Returns null when no badge should be shown (insufficient match or onboarding incomplete).
 */
export function computeBadge(
  product: ProductRow,
  prefs: UserPreferences
): string | null {
  if (!prefs.onboarding_complete) return null;

  const brandMatch = prefs.preferred_brands.includes(product.brand);

  const relevantSize = getRelevantSize(product.category, prefs);
  const sizeMatch = relevantSize ? hasSizeAvailable(product, relevantSize) : false;

  let priceMatch = false;
  if (prefs.price_comfort) {
    const price = product.price;
    priceMatch =
      (prefs.price_comfort === "under-75"  && price <= 75) ||
      (prefs.price_comfort === "75-150"    && price >= 75 && price <= 150) ||
      (prefs.price_comfort === "150-plus"  && price >= 150);
  }

  const matchCount = [brandMatch, sizeMatch, priceMatch].filter(Boolean).length;

  if (matchCount < 2) return null;

  // Strong fit: all three match
  // Worth a look: exactly two match
  // In both cases, display the two highest-priority matching signals.
  // Priority: size > brand > price

  if (sizeMatch && brandMatch) return "In your size · From a brand you wear";
  if (sizeMatch && priceMatch) return "Your size · In your price range";
  return "From a brand you wear · Worth a look"; // brandMatch + priceMatch
}
