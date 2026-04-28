import { useState, useMemo, useCallback } from "react";
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
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/lib/AuthContext";
import { getTheme } from "@/lib/theme";
import type { FeedMode, FilterState, ProductRow } from "@/lib/types";

const theme = getTheme();

const FEED_MODES: { key: FeedMode; label: string }[] = [
  { key: "drops", label: "New Drops" },
  { key: "price-drops", label: "Price Change" },
];

export default function FeedScreen() {
  const { preferences } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.floor((screenWidth - 32) / 2);
  const [feedMode, setFeedMode] = useState<FeedMode>("drops");

  const filters = useMemo<FilterState>(
    () => ({
      category: null,
      feedMode,
      brands: preferences.preferred_brands,
      colors: [],
      sizes: [],
      onSale: false,
      isNew: false,
      sortBy: feedMode === "drops" ? "newest" : "lastSeenAt",
    }),
    [feedMode, preferences.preferred_brands]
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
        <ProductCard product={item} cardWidth={cardWidth} showBrand={true} />
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
        <Text style={styles.emptyText}>No new arrivals</Text>
        <Text style={styles.emptySubtext}>Check back after the next scrape.</Text>
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
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>NEW FROM YOUR BRANDS</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Feed mode tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modeRow}
        style={styles.modeScroll}
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

      {/* Product grid */}
      <FlashList
        data={isLoading ? [] : products}
        renderItem={renderItem}
        numColumns={2}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#71717a" size="large" />
            </View>
          ) : null
        }
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
    width: 60,
  },
  backText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    color: "#71717a",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.8,
    color: "#a1a1aa",
    textAlign: "center",
    flex: 1,
  },
  modeScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  modeRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  modeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#111113",
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
  list: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  itemWrapper: {
    flex: 1,
    paddingBottom: 8,
  },
  loadingRow: {
    paddingVertical: 40,
    alignItems: "center",
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
