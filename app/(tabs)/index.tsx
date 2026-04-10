import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BRANDS } from "@/lib/constants";
import { getTheme, getBackgroundImage } from "@/lib/theme";

const theme = getTheme();
const bgImage = getBackgroundImage(theme.backgroundKey);

export default function ShopScreen() {
  return (
    <ImageBackground source={bgImage} style={styles.bg} resizeMode="cover">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlayColor }]} />

      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerRule, { backgroundColor: theme.headerRuleColor }]} />

          <Text style={styles.headerTitle}>BENCHMARK</Text>

          <View style={[styles.headerRule, { backgroundColor: theme.headerRuleColor }]} />

          <View style={styles.taglineRow}>
            <View style={[styles.taglineDash, { backgroundColor: theme.taglineDashColor }]} />
            <Text style={[styles.tagline, { color: theme.taglineColor }]}>
              FOR MEN WHO SET THE BAR
            </Text>
            <View style={[styles.taglineDash, { backgroundColor: theme.taglineDashColor }]} />
          </View>

          <View style={[styles.headerRule, { backgroundColor: theme.headerRuleColor }]} />
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
  bg: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    alignItems: "center",
    gap: 10,
  },
  headerRule: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 38,
    letterSpacing: 8,
    color: "#f4f4f5",
    textAlign: "center",
    // Nudge right to optically center the extra letter-spacing
    paddingLeft: 8,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  taglineDash: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 2.5,
    textAlign: "center",
  },
  // Grid
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
