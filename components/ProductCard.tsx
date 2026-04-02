import { useState, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { COLOR_BUCKET_HEX } from "@/lib/constants";
import type { ProductRow, Colorway, ColorBucket } from "@/lib/types";
import { SaveButton } from "@/components/SaveButton";
import { WhereToBuySheet } from "@/components/WhereToBuySheet";
import { useSelectedProduct } from "@/lib/SelectedProductContext";

interface ProductCardProps {
  product: ProductRow;
  cardWidth?: number;
}

export const ProductCard = memo(function ProductCard({ product, cardWidth: propCardWidth }: ProductCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = propCardWidth ?? (screenWidth - 16 - 8) / 2;
  const imageHeight = cardWidth * 1.25; // 4:5 ratio

  const [activeIndex, setActiveIndex] = useState(0);
  const [showWhereToBuy, setShowWhereToBuy] = useState(false);
  const { setProduct } = useSelectedProduct();

  const hasSellers = (product.sellers ?? []).length > 0;

  // Freshness
  const lastUpdated = product.lastSeenAt ? new Date(product.lastSeenAt) : null;
  const hoursAgo = lastUpdated ? Math.floor((Date.now() - lastUpdated.getTime()) / 3600000) : null;
  const isStale = hoursAgo !== null && hoursAgo > 48;
  const freshnessLabel = hoursAgo !== null
    ? hoursAgo < 1 ? "< 1h ago"
    : hoursAgo < 24 ? `${hoursAgo}h ago`
    : `${Math.floor(hoursAgo / 24)}d ago`
    : null;

  const colorways: Colorway[] = Array.isArray(product.colorways)
    ? product.colorways
    : [];

  const active = colorways[activeIndex] ?? {
    colorName: product.colorName,
    colorBucket: product.colorBucket,
    imageUrl: product.imageUrl,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    onSale: product.onSale,
    sizes: product.sizes,
  };

  const displayPrice = active.price ?? product.price;
  const displayCompare = active.compareAtPrice ?? product.compareAtPrice;
  const displayOnSale = active.onSale ?? product.onSale;

  // Available sizes for the active colorway
  const availableSizes = active.sizes.filter((s) => s.available).map((s) => s.size);

  function handleOpenProduct() {
    setProduct(product);
    router.push("/product");
  }

  function formatPrice(p: number) {
    return `$${p % 1 === 0 ? p.toFixed(0) : p.toFixed(2)}`;
  }

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      {/* Product image — tapping opens browser */}
      <TouchableOpacity onPress={handleOpenProduct} activeOpacity={0.9}>
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image
            source={{ uri: active.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          {/* Badges */}
          <View style={styles.badges}>
            {product.isNew && (
              <View style={styles.badgeNew}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            )}
            {displayOnSale && (
              <View style={styles.badgeSale}>
                <Text style={styles.badgeText}>SALE</Text>
              </View>
            )}
          </View>
          <SaveButton brand={product.brand} externalId={product.externalId} />
        </View>
      </TouchableOpacity>

      {/* Card body */}
      <View style={styles.body}>
        {/* Brand + title */}
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand.toUpperCase().replace(/-/g, " ")}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={[styles.price, displayOnSale && styles.priceSale]}>
            {formatPrice(displayPrice)}
          </Text>
          {displayOnSale && displayCompare && (
            <Text style={styles.comparePrice}>{formatPrice(displayCompare)}</Text>
          )}
        </View>

        {/* Available sizes */}
        {availableSizes.length > 0 && (
          <Text style={styles.sizes} numberOfLines={1}>
            {availableSizes.join(" · ")}
          </Text>
        )}

        {/* Freshness — stale warning or subtle timestamp */}
        {freshnessLabel && (
          <Text style={[styles.freshness, isStale && styles.freshnessStale]}>
            {isStale ? `⚠ price may be outdated · ${freshnessLabel}` : `updated ${freshnessLabel}`}
          </Text>
        )}

        {/* Color swatches — separate from the card Pressable */}
        {colorways.length > 1 && (
          <View style={styles.swatches}>
            {colorways.slice(0, 6).map((cw, i) => {
              const hex = COLOR_BUCKET_HEX[cw.colorBucket as ColorBucket] ?? "#6b7280";
              const isLinear = hex.startsWith("linear");
              return (
                <Pressable
                  key={`${cw.colorName}-${i}`}
                  onPress={() => setActiveIndex(i)}
                  style={[
                    styles.swatch,
                    { backgroundColor: isLinear ? "#6b7280" : hex },
                    i === activeIndex && styles.swatchActive,
                  ]}
                  hitSlop={4}
                />
              );
            })}
          </View>
        )}

        {/* Where to Buy — shown when multiple sellers carry this product */}
        {hasSellers && (
          <TouchableOpacity
            style={styles.whereToBuyBtn}
            onPress={() => setShowWhereToBuy(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.whereToBuyText}>
              {(product.sellers.length + 1)} sellers · compare prices
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Where to Buy modal */}
      <Modal
        visible={showWhereToBuy}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWhereToBuy(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWhereToBuy(false)}
        >
          <WhereToBuySheet product={product} onClose={() => setShowWhereToBuy(false)} />
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111113",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  imageContainer: {
    width: "100%",
    backgroundColor: "#1c1c1e",
    position: "relative",
  },
  badges: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "column",
    gap: 4,
  },
  badgeNew: {
    backgroundColor: "#18181b",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeSale: {
    backgroundColor: "#7f1d1d",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 0.8,
    color: "#ffffff",
  },
  body: {
    padding: 10,
    gap: 3,
  },
  brand: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.2,
    color: "#71717a",
  },
  title: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#e4e4e7",
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#f4f4f5",
  },
  priceSale: {
    color: "#f87171",
  },
  comparePrice: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#52525b",
    textDecorationLine: "line-through",
  },
  sizes: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#52525b",
    marginTop: 1,
  },
  freshness: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    color: "#3f3f46",
    marginTop: 3,
  },
  freshnessStale: {
    color: "#92400e",
  },
  swatches: {
    flexDirection: "row",
    gap: 5,
    marginTop: 6,
    flexWrap: "wrap",
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "transparent",
  },
  swatchActive: {
    borderColor: "#ffffff",
    transform: [{ scale: 1.2 }],
  },
  whereToBuyBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#78501a",
    alignItems: "center",
  },
  whereToBuyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 0.3,
    color: "#c27c28",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
  },
});
