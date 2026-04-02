import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import type { ProductRow, Seller } from "@/lib/types";

interface Props {
  product: ProductRow;
  onClose: () => void;
}

const SELLER_LABELS: Record<string, string> = {
  nordstrom: "Nordstrom",
  rei: "REI",
};

function formatPrice(p: number) {
  return `$${p % 1 === 0 ? p.toFixed(0) : p.toFixed(2)}`;
}

function openUrl(url: string) {
  WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
  });
}

export function WhereToBuySheet({ product, onClose }: Props) {
  const brandLabel = product.brand.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Brand's own store is always first
  const brandOption = {
    seller: product.brand,
    displayName: brandLabel,
    url: product.productUrl,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    onSale: product.onSale,
  };

  const allOptions: Seller[] = [brandOption, ...(product.sellers ?? [])];

  // Sort by price ascending
  allOptions.sort((a, b) => a.price - b.price);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WHERE TO BUY</Text>
        <TouchableOpacity onPress={onClose} hitSlop={8}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.productName} numberOfLines={1}>{product.title}</Text>

      {allOptions.map((option, i) => (
        <TouchableOpacity
          key={option.seller}
          style={[styles.row, i === 0 && styles.rowBest]}
          onPress={() => { openUrl(option.url); onClose(); }}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            {i === 0 && <Text style={styles.bestBadge}>BEST PRICE</Text>}
            <Text style={styles.sellerName}>{option.displayName}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={[styles.price, option.onSale && styles.priceSale]}>
              {formatPrice(option.price)}
            </Text>
            {option.onSale && option.compareAtPrice && (
              <Text style={styles.comparePrice}>{formatPrice(option.compareAtPrice)}</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111113",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#52525b",
  },
  close: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#52525b",
  },
  productName: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#71717a",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#27272a",
  },
  rowBest: {
    borderTopWidth: 0,
  },
  rowLeft: {
    gap: 2,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  bestBadge: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 1,
    color: "#c27c28",
  },
  sellerName: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#f4f4f5",
  },
  price: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#f4f4f5",
  },
  priceSale: {
    color: "#f87171",
  },
  comparePrice: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#52525b",
    textDecorationLine: "line-through",
  },
});
