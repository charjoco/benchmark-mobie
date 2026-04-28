import { useState, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { COLOR_BUCKET_HEX } from "@/lib/constants";
import type { ProductRow, Colorway, ColorBucket } from "@/lib/types";
import { useSelectedProduct } from "@/lib/SelectedProductContext";
import { useAuth } from "@/lib/AuthContext";
import { computeBadge } from "@/lib/fitBadge";

interface ProductCardProps {
  product: ProductRow;
  cardWidth?: number;
  showBrand?: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  cardWidth: propCardWidth,
  showBrand = true,
}: ProductCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = propCardWidth ?? (screenWidth - 16 - 8) / 2;
  const imageHeight = cardWidth * 1.5; // 2:3 ratio

  const [activeIndex, setActiveIndex] = useState(0);
  const { setProduct } = useSelectedProduct();
  const { preferences } = useAuth();
  const badgeText = computeBadge(product, preferences);

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

  function handleOpenProduct() {
    setProduct(product);
    router.push("/product");
  }

  function formatPrice(p: number) {
    return `$${p % 1 === 0 ? p.toFixed(0) : p.toFixed(2)}`;
  }

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      {/* Product image */}
      <TouchableOpacity onPress={handleOpenProduct} activeOpacity={0.9}>
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image
            source={{ uri: active.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          {/* Fallback placeholder shown while image loads or on error */}
          <View style={styles.imagePlaceholder} pointerEvents="none">
            <Text style={styles.imagePlaceholderText}>
              {product.brand.toUpperCase().replace(/-/g, " ")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Card body */}
      <View style={styles.body}>
        {showBrand && (
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand.toUpperCase().replace(/-/g, " ")}
          </Text>
        )}

        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <Text style={styles.colorName} numberOfLines={1}>
          {active.colorName}
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

        {/* Wardrobe Fit badge */}
        {badgeText && (
          <Text style={styles.badge}>{badgeText}</Text>
        )}

        {/* Color swatches */}
        {colorways.length > 1 && (
          <View style={styles.swatches}>
            {colorways.slice(0, 5).map((cw, i) => {
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
      </View>
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
  imagePlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#3f3f46",
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
  colorName: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#52525b",
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
  badge: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "#52525b",
    marginTop: 2,
  },
});
