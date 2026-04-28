import { useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { ALL_CATEGORIES } from "@/lib/constants";
import { getTheme } from "@/lib/theme";
import type { AppCategory, FilterState, ProductRow } from "@/lib/types";

const theme = getTheme();

export default function CategoryScreen() {
  const { category: categoryKey } = useLocalSearchParams<{ category: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.floor((screenWidth - 32) / 2);

  const categoryLabel =
    ALL_CATEGORIES.find((c) => c.key === categoryKey)?.label ?? (categoryKey ?? "");

  const filters = useMemo<FilterState>(
    () => ({
      category: (categoryKey as AppCategory) ?? null,
      feedMode: null,
      brands: [],
      colors: [],
      sizes: [],
      onSale: false,
      isNew: false,
      sortBy: "newest",
    }),
    [categoryKey]
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
        <Text style={styles.emptyText}>No products found</Text>
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
        <Text style={styles.title}>{categoryLabel.toUpperCase()}</Text>
        <View style={styles.backBtn} />
      </View>

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
    fontSize: 20,
    letterSpacing: 2,
    color: "#f4f4f5",
    textAlign: "center",
    flex: 1,
  },
  loadingRow: {
    paddingVertical: 20,
    alignItems: "center",
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
  },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#71717a",
  },
});
