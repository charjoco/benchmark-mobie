import { useCallback, useEffect, useState } from "react";
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
import { fetchCollection } from "@/lib/api";
import type { CollectionDetail, ProductRow } from "@/lib/types";

export default function CollectionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.floor((screenWidth - 32) / 2);

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchCollection(slug)
      .then(setCollection)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [slug]);

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
        <Text style={styles.title} numberOfLines={1}>
          {collection ? collection.name.toUpperCase() : "COLLECTION"}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#71717a" size="large" />
        </View>
      ) : !collection ? (
        <View style={styles.loading}>
          <Text style={styles.errorText}>Collection not found</Text>
        </View>
      ) : (
        <FlashList
          data={collection.products}
          renderItem={renderItem}
          numColumns={2}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            collection.description ? (
              <View style={styles.descRow}>
                <Text style={styles.desc}>{collection.description}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.loading}>
              <Text style={styles.errorText}>No products in this collection</Text>
            </View>
          }
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1f1f21",
  },
  backBtn: { width: 60 },
  backText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    color: "#71717a",
  },
  title: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 20,
    letterSpacing: 3,
    color: "#f4f4f5",
    textAlign: "center",
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#52525b",
  },
  descRow: {
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 4,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#71717a",
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  itemWrapper: {
    flex: 1,
    paddingBottom: 8,
  },
});
