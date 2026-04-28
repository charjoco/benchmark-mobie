import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { BRANDS, ALL_CATEGORIES } from "@/lib/constants";
import { fetchBrandCategories } from "@/lib/api";
import { getTheme } from "@/lib/theme";
import type { BrandCategoryCount } from "@/lib/types";

const theme = getTheme();

export default function BrandCategoriesScreen() {
  const { brand: brandKey } = useLocalSearchParams<{ brand: string }>();
  const brandLabel = BRANDS.find((b) => b.key === brandKey)?.label ?? (brandKey ?? "");

  const [total, setTotal] = useState<number>(0);
  const [categoryCounts, setCategoryCounts] = useState<BrandCategoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandKey) return;
    setIsLoading(true);
    fetchBrandCategories(brandKey)
      .then((data) => {
        setTotal(data.total);
        setCategoryCounts(data.categories);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [brandKey]);

  const countMap = new Map(categoryCounts.map((c) => [c.category, c.count]));

  // Filter to categories that exist for this brand, in ALL_CATEGORIES order
  const visibleCategories = ALL_CATEGORIES.filter((c) => (countMap.get(c.key) ?? 0) > 0);

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
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#71717a" size="large" />
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to load categories</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {/* All Products tile — full width */}
          <TouchableOpacity
            style={[styles.tile, styles.tileFullWidth]}
            onPress={() => router.push(`/brand?brand=${brandKey}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.tileName}>ALL PRODUCTS</Text>
            <Text style={styles.tileCount}>{total}</Text>
          </TouchableOpacity>

          {/* Category tiles — 2 columns */}
          {visibleCategories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={styles.tile}
              onPress={() =>
                router.push(`/brand-category?brand=${brandKey}&category=${cat.key}`)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.tileName}>{cat.label.toUpperCase()}</Text>
              <Text style={styles.tileCount}>{countMap.get(cat.key)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#71717a",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 10,
  },
  tile: {
    width: "47.5%",
    paddingVertical: 28,
    paddingHorizontal: 10,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.tileBorder,
    backgroundColor: theme.tileBg,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tileFullWidth: {
    width: "100%",
    paddingVertical: 22,
  },
  tileName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 2.2,
    color: theme.tileText,
    textAlign: "center",
  },
  tileCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#52525b",
  },
});
