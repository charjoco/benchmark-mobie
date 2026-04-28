import { useState, useMemo, useEffect } from "react";
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
import { ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/lib/AuthContext";
import { usePersonalizedFeed } from "@/hooks/usePersonalizedFeed";
import { getTheme, getBackgroundImage } from "@/lib/theme";
import { fetchCollections, fetchArticles } from "@/lib/api";
import type { CollectionSummary, ArticleSummary } from "@/lib/types";

const theme = getTheme();
const bgImage = getBackgroundImage(theme.backgroundKey);

// Seeded LCG for daily collection rotation — same seed = same result for all users on the same day
function lcg(seed: number): number {
  return (seed * 1664525 + 1013904223) & 0xffffffff;
}

function getDailyCollections(collections: CollectionSummary[]): CollectionSummary[] {
  if (collections.length <= 2) return collections;
  const today = new Date().toISOString().slice(0, 10);
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
  const { preferences, isGuest } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.floor((screenWidth - 32) / 2);

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

  const { products: personalizedProducts, isLoading: personalizedLoading, isFallback, fallbackBrandLabel } =
    usePersonalizedFeed(preferences);

  const showPersonalized = !isGuest && preferences.onboarding_complete;

  return (
    <ImageBackground source={bgImage} style={styles.bg} resizeMode="cover">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlayColor }]} />

      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* Benchmark header */}
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top navigation row — Collections 60% + Editorial/Brands stacked */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.collectionsCard}
              activeOpacity={0.75}
              onPress={() => router.push("/collections")}
            >
              {dailyCollections[0]?.heroImageUrl ?? dailyCollections[0]?.heroProduct?.imageUrl ? (
                <Image
                  source={{ uri: (dailyCollections[0].heroImageUrl ?? dailyCollections[0].heroProduct?.imageUrl)! }}
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

            <View style={styles.rightColumn}>
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

              <TouchableOpacity
                style={styles.navCard}
                activeOpacity={0.75}
                onPress={() => router.push("/brands")}
              >
                <Text style={styles.navCardLabel}>SHOP BY BRAND</Text>
                <Text style={styles.navCardArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Shop by Category tile */}
          <TouchableOpacity
            style={styles.navCard}
            activeOpacity={0.75}
            onPress={() => router.push("/categories")}
          >
            <Text style={styles.navCardLabel}>SHOP BY CATEGORY</Text>
            <Text style={styles.navCardArrow}>→</Text>
          </TouchableOpacity>

          {/* New from your brands section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NEW FROM YOUR BRANDS</Text>

            {!showPersonalized ? (
              /* Onboarding incomplete — show banner */
              <TouchableOpacity
                style={styles.onboardingBanner}
                activeOpacity={0.75}
                onPress={() => router.push("/onboarding")}
              >
                <Text style={styles.onboardingBannerText}>
                  Set up your profile for personalized recommendations
                </Text>
                <Text style={styles.onboardingBannerCta}>Get started →</Text>
              </TouchableOpacity>
            ) : personalizedLoading ? (
              <View style={styles.sectionLoading}>
                <ActivityIndicator color="#71717a" size="large" />
              </View>
            ) : (
              <>
                {isFallback && (
                  <Text style={styles.fallbackNote}>
                    Nothing new this week — here's the latest from {fallbackBrandLabel}.
                  </Text>
                )}

                {/* 2-column product grid */}
                <View style={styles.productGrid}>
                  {personalizedProducts.map((product, index) => (
                    <View
                      key={product.id}
                      style={[
                        styles.productGridItem,
                        index % 2 === 0 ? { paddingRight: 4 } : { paddingLeft: 4 },
                      ]}
                    >
                      <ProductCard
                        product={product}
                        cardWidth={cardWidth}
                        showBrand={true}
                      />
                    </View>
                  ))}
                </View>

                {/* See all link */}
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => router.push("/feed")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllText}>See all new arrivals →</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
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
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 10,
  },
  // Top navigation row
  topRow: {
    flexDirection: "row",
    gap: 8,
  },
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
  rightColumn: {
    flex: 4,
    gap: 8,
  },
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
  // Shared nav card (Shop by Brand, Shop by Category)
  navCard: {
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
  navCardLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#71717a",
  },
  navCardArrow: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#52525b",
  },
  // New from your brands section
  section: {
    gap: 12,
    marginTop: 6,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.8,
    color: "#52525b",
  },
  sectionLoading: {
    paddingVertical: 40,
    alignItems: "center",
  },
  fallbackNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#52525b",
    lineHeight: 18,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  productGridItem: {
    width: "50%",
    paddingBottom: 8,
  },
  seeAllBtn: {
    paddingVertical: 4,
    alignItems: "center",
  },
  seeAllText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#71717a",
  },
  // Onboarding banner (section empty state)
  onboardingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3f3f46",
    backgroundColor: "rgba(17,17,19,0.6)",
    gap: 8,
  },
  onboardingBannerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#71717a",
    flex: 1,
    lineHeight: 17,
  },
  onboardingBannerCta: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
    color: "#a1a1aa",
    flexShrink: 0,
  },
});
