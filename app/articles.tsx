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
import { fetchArticles } from "@/lib/api";
import type { ArticleSummary } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArticlesScreen() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
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
        <Text style={styles.title}>EDITORIAL</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#71717a" size="large" />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.75}
              onPress={() => router.push(`/article?id=${item.id}`)}
            >
              {item.heroImage ? (
                <Image
                  source={{ uri: item.heroImage.imageUrl }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
              )}
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                ) : null}
                <View style={styles.rowMeta}>
                  {item.publishedAt ? (
                    <Text style={styles.rowDate}>{formatDate(item.publishedAt)}</Text>
                  ) : null}
                  {item.productCount > 0 ? (
                    <Text style={styles.rowCount}>{item.productCount} products</Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No articles yet</Text>
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
    gap: 1,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#111113",
    borderRadius: 6,
    overflow: "hidden",
    gap: 12,
  },
  thumbnail: {
    width: 90,
    height: 90,
    backgroundColor: "#1c1c1e",
    flexShrink: 0,
  },
  thumbnailPlaceholder: {
    backgroundColor: "#1c1c1e",
  },
  rowBody: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    justifyContent: "center",
    gap: 3,
  },
  rowTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#f4f4f5",
    lineHeight: 17,
  },
  rowSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#71717a",
  },
  rowMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  rowDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#52525b",
  },
  rowCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#52525b",
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
