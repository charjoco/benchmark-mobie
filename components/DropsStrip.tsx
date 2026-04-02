import { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import type { ProductRow } from "@/lib/types";

const CARD_WIDTH = 130;
const IMAGE_HEIGHT = CARD_WIDTH * 1.25;

interface DropCardProps {
  product: ProductRow;
}

const DropCard = memo(function DropCard({ product }: DropCardProps) {
  function handleOpen() {
    WebBrowser.openBrowserAsync(product.productUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  }

  function formatPrice(p: number) {
    return `$${p % 1 === 0 ? p.toFixed(0) : p.toFixed(2)}`;
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleOpen}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        {product.onSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.badgeText}>SALE</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand.toUpperCase().replace(/-/g, " ")}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={[styles.price, product.onSale && styles.priceSale]}>
          {formatPrice(product.price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

interface DropsStripProps {
  drops: ProductRow[];
  isLoading: boolean;
  title?: string;
  countLabel?: string;
}

export function DropsStrip({
  drops,
  isLoading,
  title = "TODAY'S DROPS",
  countLabel = "new",
}: DropsStripProps) {
  if (!isLoading && drops.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>{title}</Text>
        {!isLoading && (
          <Text style={styles.count}>{drops.length} {countLabel}</Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#71717a" size="small" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {drops.map((product) => (
            <DropCard key={product.id} product={product} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272a",
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  heading: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2,
    color: "#a1a1aa",
  },
  count: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#52525b",
  },
  loader: {
    height: IMAGE_HEIGHT + 60,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#111113",
    borderRadius: 6,
    overflow: "hidden",
  },
  imageWrap: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: "#1c1c1e",
  },
  saleBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#7f1d1d",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 0.8,
    color: "#ffffff",
  },
  info: {
    padding: 8,
    gap: 2,
  },
  brand: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 1.2,
    color: "#52525b",
  },
  title: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#d4d4d8",
    lineHeight: 15,
  },
  price: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#f4f4f5",
    marginTop: 2,
  },
  priceSale: {
    color: "#f87171",
  },
});
