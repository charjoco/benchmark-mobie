import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { useSelectedProduct } from "@/lib/SelectedProductContext";
import { useSaved } from "@/lib/SavedContext";
import type { Colorway, Seller } from "@/lib/types";

function formatPrice(p: number) {
  return `$${p % 1 === 0 ? p.toFixed(0) : p.toFixed(2)}`;
}

function openUrl(url: string) {
  WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
  });
}

export default function ProductDetailScreen() {
  const { product } = useSelectedProduct();
  const { isSaved, toggleSaved } = useSaved();
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  if (!product) {
    router.back();
    return null;
  }

  const saved = isSaved(product.brand, product.externalId);
  const colorways: Colorway[] = Array.isArray(product.colorways) ? product.colorways : [];

  const active = colorways[activeIndex] ?? {
    colorName: product.colorName,
    colorBucket: product.colorBucket,
    imageUrl: product.imageUrl,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    onSale: product.onSale,
    sizes: product.sizes,
    productUrl: product.productUrl,
  };

  const displayUrl = active.productUrl ?? product.productUrl;
  const displayPrice = active.price ?? product.price;
  const displayCompare = active.compareAtPrice ?? product.compareAtPrice;
  const displayOnSale = active.onSale ?? product.onSale;

  const brandLabel = product.brand
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Sellers: brand's own store first, then sorted by price ascending
  const brandSeller: Seller = {
    seller: product.brand,
    displayName: brandLabel,
    url: displayUrl,
    price: displayPrice,
    compareAtPrice: displayCompare,
    onSale: displayOnSale,
  };
  const allSellers: Seller[] = [brandSeller, ...(product.sellers ?? [])].sort(
    (a, b) => a.price - b.price
  );

  const imageHeight = screenWidth * 1.1;
  const thumbSize = Math.floor((screenWidth - 32 - 8 * 4) / 5); // 5 thumbs visible

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image */}
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image
            source={{ uri: active.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />

          {/* Back + save overlay */}
          <SafeAreaView
            style={StyleSheet.absoluteFill}
            edges={["top"]}
            pointerEvents="box-none"
          >
            <View style={styles.imageHeaderRow} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => toggleSaved(product.brand, product.externalId)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={saved ? "heart" : "heart-outline"}
                  size={20}
                  color={saved ? "#f87171" : "#ffffff"}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

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
        </View>

        {/* Colorway thumbnail strip */}
        {colorways.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbStrip}
          >
            {colorways.map((cw, i) => (
              <TouchableOpacity
                key={`${cw.colorName}-${i}`}
                onPress={() => setActiveIndex(i)}
                activeOpacity={0.8}
                style={[
                  styles.thumbContainer,
                  { width: thumbSize, height: thumbSize * 1.25 },
                  i === activeIndex && styles.thumbContainerActive,
                ]}
              >
                <Image
                  source={{ uri: cw.imageUrl }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.brand}>{brandLabel.toUpperCase()}</Text>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, displayOnSale && styles.priceSale]}>
              {formatPrice(displayPrice)}
            </Text>
            {displayOnSale && displayCompare && (
              <Text style={styles.comparePrice}>
                {formatPrice(displayCompare)}
              </Text>
            )}
          </View>

          {/* Active color label */}
          {colorways.length > 0 && (
            <Text style={styles.colorLabel}>
              COLOR:{" "}
              <Text style={styles.colorValue}>{active.colorName}</Text>
            </Text>
          )}

          {/* Sizes */}
          {active.sizes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SIZE</Text>
              <View style={styles.sizeGrid}>
                {[...active.sizes]
                  .sort((a, b) => (a.available === b.available ? 0 : a.available ? -1 : 1))
                  .map((s, i) => (
                    <View
                      key={`${s.size}-${i}`}
                      style={[
                        styles.sizePill,
                        !s.available && styles.sizePillUnavailable,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          !s.available && styles.sizeTextUnavailable,
                        ]}
                      >
                        {s.size}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* Where to Buy */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHERE TO BUY</Text>
            {allSellers.map((seller, i) => (
              <TouchableOpacity
                key={seller.seller}
                style={[
                  styles.sellerRow,
                  i > 0 && styles.sellerRowBorder,
                ]}
                onPress={() => openUrl(seller.url)}
                activeOpacity={0.7}
              >
                <View style={styles.sellerLeft}>
                  {i === 0 && (
                    <Text style={styles.bestBadge}>BEST PRICE</Text>
                  )}
                  <Text style={styles.sellerName}>{seller.displayName}</Text>
                </View>
                <View style={styles.sellerPriceRow}>
                  <Text
                    style={[
                      styles.sellerPrice,
                      seller.onSale && styles.priceSale,
                    ]}
                  >
                    {formatPrice(seller.price)}
                  </Text>
                  {seller.onSale && seller.compareAtPrice && (
                    <Text style={styles.comparePrice}>
                      {formatPrice(seller.compareAtPrice)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <SafeAreaView edges={["bottom"]} style={styles.ctaSafe}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => openUrl(displayUrl)}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>SHOP AT {brandLabel.toUpperCase()}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  // Hero image
  imageContainer: {
    width: "100%",
    backgroundColor: "#1c1c1e",
  },
  imageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  badges: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    gap: 6,
  },
  badgeNew: {
    backgroundColor: "#18181b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  badgeSale: {
    backgroundColor: "#7f1d1d",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 0.8,
    color: "#ffffff",
  },
  // Thumbnail strip
  thumbStrip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbContainer: {
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#1c1c1e",
  },
  thumbContainerActive: {
    borderColor: "#ffffff",
  },
  // Info section
  info: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  brand: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#71717a",
  },
  title: {
    fontFamily: "Inter_400Regular",
    fontSize: 22,
    color: "#f4f4f5",
    lineHeight: 29,
    marginTop: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 10,
  },
  price: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 22,
    color: "#f4f4f5",
  },
  priceSale: {
    color: "#f87171",
  },
  comparePrice: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#52525b",
    textDecorationLine: "line-through",
  },
  colorLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#52525b",
    marginTop: 14,
  },
  colorValue: {
    fontFamily: "Inter_400Regular",
    color: "#a1a1aa",
    letterSpacing: 0,
  },
  // Sections
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#52525b",
    marginBottom: 12,
  },
  // Sizes
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizePill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#111113",
  },
  sizePillUnavailable: {
    borderColor: "#27272a",
    backgroundColor: "transparent",
  },
  sizeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#e4e4e7",
  },
  sizeTextUnavailable: {
    color: "#3f3f46",
  },
  // Sellers
  sellerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  sellerRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#27272a",
  },
  sellerLeft: {
    gap: 2,
  },
  bestBadge: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 1,
    color: "#c27c28",
  },
  sellerName: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#f4f4f5",
  },
  sellerPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  sellerPrice: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#f4f4f5",
  },
  // Bottom CTA
  ctaSafe: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#09090b",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#27272a",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  ctaBtn: {
    backgroundColor: "#f4f4f5",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 1.5,
    color: "#09090b",
  },
});
