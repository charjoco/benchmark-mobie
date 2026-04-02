import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSaved } from "@/lib/SavedContext";

interface SaveButtonProps {
  brand: string;
  externalId: string;
}

export function SaveButton({ brand, externalId }: SaveButtonProps) {
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(brand, externalId);

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => toggleSaved(brand, externalId)}
      activeOpacity={0.8}
      hitSlop={8}
    >
      <Ionicons
        name={saved ? "heart" : "heart-outline"}
        size={18}
        color={saved ? "#f87171" : "#a1a1aa"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(9,9,11,0.6)",
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
