import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import RenderHtml from "react-native-render-html";
import { ProductCard } from "@/components/ProductCard";
import { fetchArticle } from "@/lib/api";
import type { ArticleDetail } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Custom styles passed to react-native-render-html
const htmlTagsStyles = {
  h2: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: "#f4f4f5",
    marginTop: 20,
    marginBottom: 8,
  },
  h3: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#e4e4e7",
    marginTop: 16,
    marginBottom: 6,
  },
  p: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#a1a1aa",
    lineHeight: 22,
    marginBottom: 12,
  },
  li: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#a1a1aa",
    lineHeight: 22,
  },
  blockquote: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#71717a",
    fontStyle: "italic" as const,
  },
  a: {
    color: "#a1a1aa",
    textDecorationLine: "underline" as const,
  },
  strong: {
    fontFamily: "Inter_600SemiBold",
    color: "#f4f4f5",
  },
};

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: screenWidth } = useWindowDimensions();
  // 2-col product grid: 16px padding each side + 8px gap between
  const cardWidth = Math.floor((screenWidth - 40) / 2);
  const htmlWidth = screenWidth - 32;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchArticle(id)
      .then(setArticle)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const heroImage = article?.images[0] ?? null;
  const bodyImages = article?.images.slice(1) ?? [];

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
        <Text style={styles.headerLabel}>EDITORIAL</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#71717a" size="large" />
        </View>
      ) : !article ? (
        <View style={styles.loading}>
          <Text style={styles.errorText}>Article not found</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Hero image */}
          {heroImage ? (
            <Image
              source={{ uri: heroImage.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : null}

          {/* Title block */}
          <View style={styles.titleBlock}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            {article.subtitle ? (
              <Text style={styles.articleSubtitle}>{article.subtitle}</Text>
            ) : null}
            {article.publishedAt ? (
              <Text style={styles.articleDate}>{formatDate(article.publishedAt)}</Text>
            ) : null}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Body HTML */}
          {article.body && article.body !== "<p></p>" ? (
            <View style={styles.bodyContainer}>
              <RenderHtml
                contentWidth={htmlWidth}
                source={{ html: article.body }}
                tagsStyles={htmlTagsStyles}
                baseStyle={{
                  fontFamily: "Inter_400Regular",
                  color: "#a1a1aa",
                }}
              />
            </View>
          ) : null}

          {/* Remaining images */}
          {bodyImages.map((img) => (
            <View key={img.id} style={styles.bodyImageContainer}>
              <Image
                source={{ uri: img.imageUrl }}
                style={styles.bodyImage}
                resizeMode="cover"
              />
              {img.altText ? (
                <Text style={styles.imageCaption}>{img.altText}</Text>
              ) : null}
            </View>
          ))}

          {/* Products */}
          {article.products.length > 0 ? (
            <View style={styles.productsSection}>
              <Text style={styles.productsSectionLabel}>FEATURED PRODUCTS</Text>
              <View style={styles.productsGrid}>
                {article.products.map((product, index) => (
                  <View
                    key={product.id}
                    style={[
                      styles.productWrapper,
                      index % 2 === 0 ? { paddingRight: 4 } : { paddingLeft: 4 },
                    ]}
                  >
                    <ProductCard product={product} cardWidth={cardWidth} />
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
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
  headerLabel: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 20,
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
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#52525b",
  },
  content: {
    paddingBottom: 48,
  },
  heroImage: {
    width: "100%",
    height: 280,
    backgroundColor: "#1c1c1e",
  },
  titleBlock: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 6,
  },
  articleTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 26,
    color: "#f4f4f5",
    lineHeight: 32,
  },
  articleSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#71717a",
    lineHeight: 21,
  },
  articleDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#52525b",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#1c1c1e",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bodyContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  bodyImageContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bodyImage: {
    width: "100%",
    height: 220,
    borderRadius: 6,
    backgroundColor: "#1c1c1e",
  },
  imageCaption: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#52525b",
    textAlign: "center",
    marginTop: 6,
  },
  productsSection: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  productsSectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2,
    color: "#52525b",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  productWrapper: {
    width: "50%",
    paddingBottom: 8,
  },
});
