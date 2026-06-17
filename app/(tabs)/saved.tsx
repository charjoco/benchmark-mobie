import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSaved } from "@/lib/SavedContext";
import { useSelectedProduct } from "@/lib/SelectedProductContext";
import { API_BASE_URL } from "@/lib/constants";
import { getTheme } from "@/lib/theme";
import type { ProductRow } from "@/lib/types";
import type { SavedEntry } from "@/lib/savedProducts";

const theme = getTheme();

type ListItem =
  | { type: "product"; data: ProductRow }
  | { type: "removed"; entry: SavedEntry };

export default function SavedScreen() {
  const { savedMap, toggleSaved, toggleWatch, isWatching } = useSaved();
  const { setProduct } = useSelectedProduct();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const savedEntries = Array.from(savedMap.values());

  const loadProducts = useCallback(async () => {
    if (savedEntries.length === 0) {
      setProducts([]);
      return;
    }
    setIsLoading(true);
    try {
      const ids = savedEntries.map((e) => `${e.brand}:${e.externalId}`).join(",");
      const res = await fetch(`${API_BASE_URL}/api/products/saved?ids=${encodeURIComponent(ids)}`);
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (err) {
      console.error("[Saved] fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [savedMap]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reconcile savedEntries with fetched products. Any entry whose product wasn't
  // returned by the API (deleted, unpublished, or category-nulled in a backfill)
  // gets a "removed" row instead of crashing or silently disappearing.
  const listItems: ListItem[] = useCallback(() => {
    const foundIds = new Set(products.map((p) => `${p.brand}:${p.externalId}`));
    const items: ListItem[] = [];
    for (const p of products) items.push({ type: "product", data: p });
    for (const e of savedEntries) {
      if (!foundIds.has(`${e.brand}:${e.externalId}`)) {
        items.push({ type: "removed", entry: e });
      }
    }
    return items;
  }, [products, savedEntries])();

  function formatPrice(p: number) {
    return `$${p % 1 === 0 ? p.toFixed(0) : p.toFixed(2)}`;
  }

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === "removed") {
      const { entry } = item;
      const brandLabel = entry.brand.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return (
        <View style={[styles.item, styles.itemRemoved]}>
          <View style={styles.imageWrapRemoved}>
            <Ionicons name="image-outline" size={24} color="#3f3f46" />
          </View>
          <View style={styles.info}>
            <Text style={styles.brand}>{brandLabel.toUpperCase()}</Text>
            <Text style={styles.removedText}>No longer available</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => toggleSaved(entry.brand, entry.externalId)}
              style={styles.removeBtn}
              hitSlop={8}
            >
              <Ionicons name="close" size={18} color="#52525b" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const { data: product } = item;
    const watching = isWatching(product.brand, product.externalId);
    const recentPriceDrop = product.priceDroppedAt && (now - new Date(product.priceDroppedAt).getTime()) < DAY;
    const hasAlert = watching && recentPriceDrop;

    function handleOpenProduct() {
      setProduct(product, "saved");
      router.push("/product");
    }

    return (
      <View style={styles.item}>
        <TouchableOpacity
          style={styles.imageWrap}
          onPress={handleOpenProduct}
          activeOpacity={0.85}
        >
          <Image
            source={{ uri: product.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          {hasAlert && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>PRICE DROP</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand.toUpperCase().replace(/-/g, " ")}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, product.onSale && styles.priceSale]}>
              {formatPrice(product.price)}
            </Text>
            {product.onSale && product.compareAtPrice && (
              <Text style={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => toggleWatch(product.brand, product.externalId)}
            style={[styles.watchBtn, watching && styles.watchBtnActive]}
            hitSlop={8}
          >
            <Ionicons
              name={watching ? "eye" : "eye-outline"}
              size={18}
              color={watching ? "#c27c28" : "#52525b"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleSaved(product.brand, product.externalId)}
            style={styles.removeBtn}
            hitSlop={8}
          >
            <Ionicons name="heart" size={18} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [isWatching, toggleWatch, toggleSaved, setProduct, now]);

  const isEmpty = listItems.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SAVED</Text>
        {savedEntries.length > 0 && (
          <Text style={styles.headerCount}>{savedEntries.length} items</Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#71717a" size="large" />
        </View>
      ) : isEmpty ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={48} color="#27272a" />
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart on any product to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item) =>
            item.type === "product"
              ? item.data.id
              : `removed:${item.entry.brand}:${item.entry.externalId}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onRefresh={loadProducts}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

const IMG_SIZE = 80;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.screenBg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.dividerColor,
  },
  headerTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 26,
    letterSpacing: 3,
    color: "#f4f4f5",
  },
  headerCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#52525b",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#52525b",
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#3f3f46",
    textAlign: "center",
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#1c1c1e",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  itemRemoved: {
    opacity: 0.45,
  },
  imageWrap: {
    width: IMG_SIZE,
    height: IMG_SIZE,
    borderRadius: 6,
    backgroundColor: "#1c1c1e",
    overflow: "hidden",
  },
  imageWrapRemoved: {
    width: IMG_SIZE,
    height: IMG_SIZE,
    borderRadius: 6,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },
  removedText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#52525b",
    marginTop: 2,
  },
  alertBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: "#c27c28",
    borderRadius: 3,
    paddingVertical: 2,
    alignItems: "center",
  },
  alertText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 0.8,
    color: "#09090b",
  },
  info: {
    flex: 1,
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
  priceSale: { color: "#f87171" },
  comparePrice: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#52525b",
    textDecorationLine: "line-through",
  },
  actions: {
    gap: 12,
    alignItems: "center",
  },
  watchBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  watchBtnActive: {
    borderColor: "#78501a",
    backgroundColor: "rgba(194,124,40,0.08)",
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
});
