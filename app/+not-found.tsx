import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.text}>Screen not found.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  text: {
    color: "#71717a",
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
  link: {},
  linkText: {
    color: "#a1a1aa",
    textDecorationLine: "underline",
  },
});
