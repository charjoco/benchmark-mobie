import { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { BRANDS, ALL_CATEGORIES } from "@/lib/constants";
import { getTheme } from "@/lib/theme";
import type { AppCategory, FeedMode, FilterState, ProductRow } from "@/lib/types";

const theme = getTheme();

const FEED_MODES: { key: FeedMode | null; label: string }[] = [
  { key: null, label: "All" },
  { key: "drops", label: "New Drops" },
  { key: "price-drops", label: "Price Change" },
];

export default function BrandScreen() {
  const { brand: brandKey } = useLocalSearchParams<{ brand: string }>();
  const { width: screenWidth } = useWindowDimensions();
  // 2 columns: 12px padding each side + 8px gap between
  const cardWidth = Math.floor((screenWidth - 32) / 2);

  const brandLabel = BRANDS.find((b) => b.key === brandKey)?.label ?? (brandKey ?? "");

  const [feedMode, setFeedMode] = useState<FeedMode | null>("drops");
  const [category, setCategory] = useState<AppCategory | null>(null);
  const [size, setSize] = useState<string | null>(null);

  const filters = useMemo<FilterState>(
    () => ({
      category,
      feedMode,
      brands: brandKey ? [brandKey] : [],
      colors: [],
      sizes: size ? [size] : [],
      onSale: false,
      isNew: false,
      sortBy: feedMode === "drops" ? "newest" : "lastSeenAt",
    }),
    [category, feedMode, brandKey, size]
  );

  const { products, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    useProducts(filters);

  const renderItem = useCallback(
    ({ item, index }: { item: ProductRow; index: number }) => (
      <View
        style={[
          styles.itemWrapper,
          index % 2 === 0 ? { paddingRight: 4 } : { paddingLeft: 4 },
        ]}
      >
        <ProductCard product={item} cardWidth={cardWidth} />
      </View>
    ),
    [cardWidth]
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color="#71717a" size="small" />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No products found</Text>
        <Text style={styles.emptySubtext}>
          Try a different category or check back after the next scrape.
        </Text>
      </View>
    );
  }, [isLoading]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>← BRANDS</Text>
        </TouchableOpacity>
        <Text style={styles.brandName}>{brandLabel.toUpperCase()}</Text>
        {/* spacer to keep brand name centered */}
        <View style={styles.backBtn} />
      </View>

      {/* Feed mode buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modeRow}
        style={styles.scrollRow}
      >
        {FEED_MODES.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeBtn, feedMode === m.key && styles.modeBtnActive]}
            onPress={() => setFeedMode(m.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.modeBtnText,
                feedMode === m.key && styles.modeBtnTextActive,
              ]}
            >
              {m.label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
        style={styles.scrollRow}
      >
        <TouchableOpacity
          style={[styles.catBtn, category === null && styles.catBtnActive]}
          onPress={() => setCategory(null)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.catBtnText,
              category === null && styles.catBtnTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {ALL_CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[styles.catBtn, category === c.key && styles.catBtnActive]}
            onPress={() => setCategory(c.key === category ? null : c.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.catBtnText,
                category === c.key && styles.catBtnTextActive,
              ]}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Size buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
        style={styles.scrollRow}
      >
        {["S", "M", "L", "XL", "XXL"].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.catBtn, size === s && styles.catBtnActive]}
            onPress={() => setSize(size === s ? null : s)}
            activeOpacity={0.7}
          >
            <Text style={[styles.catBtnText, size === s && styles.catBtnTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product grid */}
      {/* @ts-ignore estimatedItemSize is valid at runtime */}
      <FlashList
        data={isLoading ? [] : products}
        renderItem={renderItem}
        numColumns={2}
        estimatedItemSize={320}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#71717a" size="large" />
          </View>
        ) : null}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        onRefresh={refresh}
        refreshing={false}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.screenBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.dividerColor,
  },
  backBtn: {
    width: 70,
  },
  backText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    color: "#71717a",
  },
  brandName: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 20,
    letterSpacing: 2,
    color: "#f4f4f5",
    textAlign: "center",
    flex: 1,
  },
  modeRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  modeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#111113",
    alignSelf: "flex-start",
  },
  modeBtnActive: {
    backgroundColor: "#f4f4f5",
    borderColor: "#f4f4f5",
  },
  modeBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.2,
    color: "#71717a",
  },
  modeBtnTextActive: {
    color: "#09090b",
  },
  catRow: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#27272a",
    alignSelf: "flex-start",
  },
  catBtnActive: {
    borderColor: "#71717a",
  },
  catBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.5,
    color: "#52525b",
  },
  catBtnTextActive: {
    color: "#e4e4e7",
  },
  loadingRow: {
    paddingVertical: 20,
    alignItems: "center",
  },
  scrollRow: {
    flexGrow: 0,
    flexShrink: 0,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  itemWrapper: {
    flex: 1,
    paddingBottom: 8,
  },
  footer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#71717a",
  },
  emptySubtext: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#3f3f46",
    textAlign: "center",
    lineHeight: 18,
  },
});
