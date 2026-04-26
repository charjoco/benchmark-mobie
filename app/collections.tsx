import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { fetchCollections } from "@/lib/api";
import type { CollectionSummary } from "@/lib/types";

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCollections()
      .then(setCollections)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

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
        <Text style={styles.title}>COLLECTIONS</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#71717a" size="large" />
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.75}
              onPress={() => router.push(`/collection?slug=${item.slug}`)}
            >
              {item.heroImageUrl ?? item.heroProduct?.imageUrl ? (
                <Image
                  source={{ uri: (item.heroImageUrl ?? item.heroProduct?.imageUrl)! }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.heroImage, styles.heroPlaceholder]} />
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.name.toUpperCase()}</Text>
                {item.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <Text style={styles.cardCount}>{item.productCount} pieces</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No collections yet</Text>
            </View>
          }
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
    fontSize: 22,
    letterSpacing: 4,
    color: "#f4f4f5",
    textAlign: "center",
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 14,
    gap: 12,
  },
  card: {
    backgroundColor: "#111113",
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#27272a",
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#1c1c1e",
  },
  heroPlaceholder: {
    backgroundColor: "#1c1c1e",
  },
  cardBody: {
    padding: 14,
    gap: 4,
  },
  cardName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 2,
    color: "#f4f4f5",
  },
  cardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#71717a",
    lineHeight: 18,
  },
  cardCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#52525b",
    marginTop: 4,
  },
  empty: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#52525b",
  },
});
