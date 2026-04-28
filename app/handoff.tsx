import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useSelectedProduct } from "@/lib/SelectedProductContext";
import { useSaved } from "@/lib/SavedContext";

export default function HandoffScreen() {
  const { url, brand, title } = useLocalSearchParams<{
    url: string;
    brand: string;
    title: string;
  }>();

  const { product } = useSelectedProduct();
  const { isSaved, toggleSaved } = useSaved();

  const autoSavedRef = useRef(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-save the product if not already saved
    if (product && !isSaved(product.brand, product.externalId)) {
      toggleSaved(product.brand, product.externalId);
      autoSavedRef.current = true;
    }

    // Animate progress bar over 1400ms
    Animated.timing(progress, {
      toValue: 1,
      duration: 1400,
      useNativeDriver: false,
    }).start();

    // Navigate to webview after 1500ms
    const timer = setTimeout(() => {
      router.replace(
        `/webview?url=${encodeURIComponent(url ?? "")}&brand=${encodeURIComponent(brand ?? "")}&title=${encodeURIComponent(title ?? "")}&autoSaved=${autoSavedRef.current ? "true" : "false"}`
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* App label */}
      <View style={styles.topArea}>
        <Text style={styles.appLabel}>BENCHMARK</Text>
      </View>

      {/* Center content */}
      <View style={styles.center}>
        <Text style={styles.heading}>Heading to {brand}</Text>
        <Text style={styles.subheading}>We'll keep your spot</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  topArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  appLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2,
    color: "#52525b",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  heading: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 34,
    color: "#f4f4f5",
    lineHeight: 40,
  },
  subheading: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#71717a",
  },
  progressTrack: {
    height: 2,
    backgroundColor: "#27272a",
    marginHorizontal: 0,
  },
  progressFill: {
    height: 2,
    backgroundColor: "#f4f4f5",
  },
});
