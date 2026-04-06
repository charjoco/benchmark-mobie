import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BRANDS } from "@/lib/constants";

export default function ShopScreen() {
  return (
    <ImageBackground
      source={require("@/assets/navywaffle.webp")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Dark overlay to keep text readable */}
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BENCHMARK</Text>
          <Text style={styles.headerTagline}>FOR MEN WHO SET THE BAR</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {BRANDS.map((brand) => (
            <TouchableOpacity
              key={brand.key}
              style={styles.brandTile}
              onPress={() => router.push(`/brand?brand=${brand.key}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.brandLabel}>{brand.label.toUpperCase()}</Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.12)",
    gap: 3,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 26,
    letterSpacing: 3,
    color: "#f4f4f5",
  },
  headerTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.45)",
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
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
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
