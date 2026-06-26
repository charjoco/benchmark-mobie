import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  /** Optional Ionicons name shown above the title. */
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  /** Optional action button (e.g. "Browse products"). */
  actionLabel?: string;
  onAction?: () => void;
}

/** Intentional empty state for any list/section that can legitimately be empty. */
export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <Ionicons name={icon} size={40} color="#3f3f46" style={styles.icon} />}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.action} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
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
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#a1a1aa",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#52525b",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 6,
  },
  action: {
    marginTop: 18,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3f3f46",
    backgroundColor: "rgba(17,17,19,0.6)",
  },
  actionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 1,
    color: "#e4e4e7",
  },
});
