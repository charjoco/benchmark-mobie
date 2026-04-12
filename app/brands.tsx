import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BRANDS } from "@/lib/constants";
import { getTheme, getBackgroundImage } from "@/lib/theme";

const theme = getTheme();
const bgImage = getBackgroundImage(theme.backgroundKey);

export default function BrandsScreen() {
  return (
    <ImageBackground source={bgImage} style={styles.bg} resizeMode="cover">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlayColor }]} />

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
          <Text style={styles.title}>BRANDS</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Brand grid */}
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {BRANDS.map((brand) => (
            <TouchableOpacity
              key={brand.key}
              style={[
                styles.brandTile,
                {
                  backgroundColor: theme.tileBg,
                  borderColor: theme.tileBorder,
                },
              ]}
              onPress={() => router.push(`/brand?brand=${brand.key}`)}
              activeOpacity={0.65}
            >
              <Text style={[styles.brandLabel, { color: theme.tileText }]}>
                {brand.label.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
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
  backBtn: {
    width: 60,
  },
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 10,
  },
  brandTile: {
    width: "47.5%",
    paddingVertical: 26,
    paddingHorizontal: 10,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  brandLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 2.2,
    textAlign: "center",
  },
});
