import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BRANDS } from "@/lib/constants";
import { getTheme } from "@/lib/theme";

const theme = getTheme();

export default function ShopScreen() {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: theme.headerBorder }]}>
        <Text style={[styles.headerTitle, {
          fontFamily: theme.headerTitleFont,
          color: theme.headerTitleColor,
          fontSize: theme.headerTitleSize,
          letterSpacing: theme.headerTitleLetterSpacing,
        }]}>
          Benchmark
        </Text>
        <Text style={[styles.headerTagline, { color: theme.taglineColor }]}>
          FOR MEN WHO SET THE BAR
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {BRANDS.map((brand) => (
          <TouchableOpacity
            key={brand.key}
            style={[styles.brandTile, {
              backgroundColor: theme.tileBg,
              borderColor: theme.tileBorder,
            }]}
            onPress={() => router.push(`/brand?brand=${brand.key}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.brandLabel}>{brand.label.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 3,
  },
  headerTitle: {
    // font/color/size/letterSpacing applied inline from theme
  },
  headerTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 10,
  },
  brandTile: {
    width: "47%",
    paddingVertical: 22,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  brandLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 2,
    color: "#e4e4e7",
    textAlign: "center",
  },
});
