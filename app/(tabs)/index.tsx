import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { getTheme, getBackgroundImage } from "@/lib/theme";
import type { FeedMode, FilterState, ProductRow } from "@/lib/types";

const theme = getTheme();
const bgImage = getBackgroundImage(theme.backgroundKey);

const FEED_MODES: { key: FeedMode; label: string }[] = [
  { key: "drops", label: "New Drops" },
  { key: "price-drops", label: "Price Change" },
  { key: "restocks", label: "Restocks" },
];

export default function ShopScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.floor((screenWidth - 32) / 2);
  const [feedMode, setFeedMode] = useState<FeedMode>("drops");

  const filters = useMemo<FilterState>(
    () => ({
      category: null,
      feedMode,
      brands: [],
      colors: [],
      sizes: [],
      onSale: false,
      isNew: false,
      sortBy: feedMode === "drops" ? "newest" : "lastSeenAt",
    }),
    [feedMode]
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
        <Text style={styles.emptyText}>Nothing here yet</Text>
        <Text style={styles.emptySubtext}>Check back after the next scrape.</Text>
      </View>
    );
  }, [isLoading]);

  const renderHeader = useCallback(
    () => (
      <TouchableOpacity
        style={styles.brandsBanner}
        onPress={() => router.push("/brands")}
        activeOpacity={0.7}
      >
        <Text style={styles.brandsBannerText}>BROWSE BY BRAND</Text>
        <Text style={styles.brandsBannerArrow}>→</Text>
      </TouchableOpacity>
    ),
    []
  );

  return (
    <ImageBackground source={bgImage} style={styles.bg} resizeMode="cover">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlayColor }]} />

      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerRule, { backgroundColor: theme.headerRuleColor }]} />
          <Text style={styles.headerTitle}>BENCHMARK</Text>
          <View style={[styles.headerRule, { backgroundColor: theme.headerRuleColor }]} />
          <View style={styles.taglineRow}>
            <View style={[styles.taglineDash, { backgroundColor: theme.taglineDashColor }]} />
            <Text style={[styles.tagline, { color: theme.taglineColor }]}>
              FOR MEN WHO SET THE BAR
            </Text>
            <View style={[styles.taglineDash, { backgroundColor: theme.taglineDashColor }]} />
          </View>
          <View style={[styles.headerRule, { backgroundColor: theme.headerRuleColor }]} />
        </View>

        {/* Feed mode selector */}
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
        {/* @ts-ignore estimatedItemSize is valid at runtime */}
        <FlashList
          data={isLoading ? [] : products}
          renderItem={renderItem}
          numColumns={2}
          estimatedItemSize={340}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {isLoading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#71717a" size="large" />
                </View>
              )}
            </>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    alignItems: "center",
    gap: 10,
  },
  headerRule: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 38,
    letterSpacing: 8,
    color: "#f4f4f5",
    textAlign: "center",
    paddingLeft: 8,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  taglineDash: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 2.5,
    textAlign: "center",
  },
  // Feed mode
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
    backgroundColor: "rgba(17,17,19,0.7)",
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
  // List
  brandsBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 0,
    marginBottom: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#27272a",
    backgroundColor: "rgba(17,17,19,0.6)",
  },
  brandsBannerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#71717a",
  },
  brandsBannerArrow: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#52525b",
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
