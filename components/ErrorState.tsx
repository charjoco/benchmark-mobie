import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LOAD_ERROR_MESSAGE } from "@/lib/errors";

interface ErrorStateProps {
  /** Defaults to the friendly load-failure copy. */
  message?: string;
  /** When provided, renders a Retry button that re-runs the failed action. */
  onRetry?: () => void;
}

/** Friendly load-failure state with a retry affordance. */
export function ErrorState({ message = LOAD_ERROR_MESSAGE, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={40} color="#3f3f46" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retry} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.retryText}>RETRY</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 64,
    paddingBottom: 32,
  },
  icon: {
    marginBottom: 14,
  },
  message: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 20,
  },
  retry: {
    marginTop: 18,
    paddingVertical: 11,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: "#f4f4f5",
  },
  retryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 1.5,
    color: "#09090b",
  },
});
