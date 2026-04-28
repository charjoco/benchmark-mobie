import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{
    url: string;
    brand: string;
    title: string;
    autoSaved: string;
  }>();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.appLabel}>BENCHMARK</Text>
        <Text style={styles.productTitle} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          activeOpacity={0.7}
          style={styles.closeBtn}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Web content */}
      <WebView
        source={{ uri: url ?? "" }}
        style={styles.webview}
        allowsBackForwardNavigationGestures
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272a",
    gap: 8,
  },
  appLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#52525b",
    flexShrink: 0,
  },
  productTitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#a1a1aa",
    flex: 1,
    textAlign: "center",
  },
  closeBtn: {
    flexShrink: 0,
    width: 28,
    alignItems: "flex-end",
  },
  closeText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#71717a",
  },
  webview: {
    flex: 1,
  },
});
