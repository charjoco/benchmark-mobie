import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ALL_CATEGORIES } from "@/lib/constants";
import { fetchCategories } from "@/lib/api";
import { getTheme } from "@/lib/theme";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import type { CategoryCount } from "@/lib/types";

const theme = getTheme();

export default function CategoriesScreen() {
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    fetchCategories()
      .then((data) => setCategoryCounts(data.categories))
      .catch((e) => {
        console.error("[categories] fetch error:", e);
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const countMap = new Map(categoryCounts.map((c) => [c.category, c.count]));
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
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SHOP BY CATEGORY</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#71717a" size="large" />
        </View>
      ) : isError ? (
        <ErrorState onRetry={load} />
      ) : visibleCategories.length === 0 ? (
        <EmptyState title="No categories yet." subtitle="Check back soon." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {visibleCategories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={styles.tile}
              onPress={() => router.push(`/category?category=${cat.key}`)}
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
  title: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 17,
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
