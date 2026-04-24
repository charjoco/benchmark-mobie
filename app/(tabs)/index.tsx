import { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
  ImageBackground,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { getTheme, getBackgroundImage } from "@/lib/theme";
import { fetchCollections, fetchArticles } from "@/lib/api";
import type { FeedMode, FilterState, ProductRow, CollectionSummary, ArticleSummary } from "@/lib/types";

const theme = getTheme();
const bgImage = getBackgroundImage(theme.backgroundKey);

const FEED_MODES: { key: FeedMode; label: string }[] = [
  { key: "drops", label: "New Drops" },
  { key: "price-drops", label: "Price Change" },
];

// Seeded LCG for daily collection rotation — same seed = same result for all users on the same day
function lcg(seed: number): number {
  return (seed * 1664525 + 1013904223) & 0xffffffff;
}

function getDailyCollections(collections: CollectionSummary[]): CollectionSummary[] {
  if (collections.length <= 2) return collections;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = (seed * 31 + today.charCodeAt(i)) & 0xffffffff;
  }
  seed = lcg(seed);
  const first = Math.abs(seed) % collections.length;
  seed = lcg(seed);
  let second = Math.abs(seed) % (collections.length - 1);
  if (second >= first) second++;
  return [collections[first], collections[second]];
}

export default function ShopScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.floor((screenWidth - 32) / 2);
  const [feedMode, setFeedMode] = useState<FeedMode>("drops");

  const [allCollections, setAllCollections] = useState<CollectionSummary[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<ArticleSummary | null>(null);

  useEffect(() => {
    fetchCollections().then(setAllCollections).catch(console.error);
    fetchArticles()
      .then((articles) => setFeaturedArticle(articles[0] ?? null))
      .catch(console.error);
  }, []);

  const dailyCollections = useMemo(
    () => getDailyCollections(allCollections),
    [allCollections]
  );

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
      <>
        {/* Curated + Editorial row — Option B layout */}
        <View style={styles.topRow}>
          {/* Collections card — 60% width */}
          <TouchableOpacity
            style={styles.collectionsCard}
            activeOpacity={0.75}
            onPress={() => router.push("/collections")}
          >
            {dailyCollections[0]?.heroProduct ? (
              <Image
                source={{ uri: dailyCollections[0].heroProduct.imageUrl }}
                style={styles.collectionsHero}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.collectionsHero, { backgroundColor: "#1c1c1e" }]} />
            )}
            <View style={styles.collectionsOverlay}>
              <Text style={styles.collectionsLabel}>CURATED</Text>
              {dailyCollections.length > 0 && (
                <Text style={styles.collectionsName} numberOfLines={1}>
                  {dailyCollections[0].name}
                </Text>
              )}
              {dailyCollections.length > 1 && (
                <Text style={styles.collectionsName2} numberOfLines={1}>
                  + {dailyCollections[1].name}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Right column — Editorial + Brands stacked */}
          <View style={styles.rightColumn}>
            {/* Editorial card */}
            <TouchableOpacity
              style={styles.editorialCard}
              activeOpacity={0.75}
              onPress={() =>
                featuredArticle
                  ? router.push(`/article?id=${featuredArticle.id}`)
                  : router.push("/articles")
              }
            >
              {featuredArticle?.heroImage ? (
                <Image
                  source={{ uri: featuredArticle.heroImage.imageUrl }}
                  style={styles.editorialImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.editorialImage, { backgroundColor: "#1c1c1e" }]} />
              )}
              <View style={styles.editorialOverlay}>
                <Text style={styles.editorialLabel}>EDITORIAL</Text>
                {featuredArticle && (
                  <Text style={styles.editorialTitle} numberOfLines={2}>
                    {featuredArticle.title}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Shop by Brand card */}
            <TouchableOpacity
              style={styles.brandsCard}
              activeOpacity={0.75}
              onPress={() => router.push("/brands")}
            >
              <Text style={styles.brandsLabel}>SHOP BY BRAND</Text>
              <Text style={styles.brandsArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading spinner for products */}
        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#71717a" size="large" />
          </View>
        )}
      </>
    ),
    [dailyCollections, featuredArticle, isLoading]
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
        <FlashList
          data={isLoading ? [] : products}
          renderItem={renderItem}
          numColumns={2}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
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
  // Top row (Option B)
  topRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  // Collections — 60% width
  collectionsCard: {
    flex: 6,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#111113",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#27272a",
  },
  collectionsHero: {
    width: "100%",
    aspectRatio: 3 / 4,
  },
  collectionsOverlay: {
    padding: 10,
    gap: 3,
  },
  collectionsLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 2,
    color: "#52525b",
  },
  collectionsName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.5,
    color: "#f4f4f5",
  },
  collectionsName2: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#71717a",
  },
  // Right column — 40% width
  rightColumn: {
    flex: 4,
    gap: 8,
  },
  // Editorial card
  editorialCard: {
    flex: 1,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#111113",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#27272a",
  },
  editorialImage: {
    width: "100%",
    flex: 1,
    minHeight: 80,
  },
  editorialOverlay: {
    padding: 8,
    gap: 3,
  },
  editorialLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 2,
    color: "#52525b",
  },
  editorialTitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#e4e4e7",
    lineHeight: 14,
  },
  // Brands card
  brandsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#27272a",
    backgroundColor: "rgba(17,17,19,0.6)",
    flexShrink: 0,
  },
  brandsLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#71717a",
  },
  brandsArrow: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#52525b",
  },
  // List
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
