import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { ALL_CATEGORIES } from "@/lib/constants";
import type { AppCategory, FeedMode } from "@/lib/types";

const SPECIAL_TABS: { key: FeedMode; label: string }[] = [
  { key: "popular", label: "Most Popular" },
  { key: "drops", label: "New Drops" },
  { key: "price-drops", label: "Price Drops" },
  { key: "restocks", label: "Restocked" },
];

interface CategoryTabsProps {
  active: AppCategory | null;
  feedMode: FeedMode | null;
  onSelect: (cat: AppCategory | null) => void;
  onSelectFeedMode: (mode: FeedMode | null) => void;
}

export function CategoryTabs({ active, feedMode, onSelect, onSelectFeedMode }: CategoryTabsProps) {
  const regularTabs = [
    { key: null, label: "All" },
    ...ALL_CATEGORIES.map((c) => ({ key: c.key as AppCategory | null, label: c.label })),
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Special feed mode tabs */}
        {SPECIAL_TABS.map((tab) => {
          const isActive = feedMode === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectFeedMode(isActive ? null : tab.key)}
              style={[styles.pill, styles.pillSpecial, isActive && styles.pillSpecialActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, styles.labelSpecial, isActive && styles.labelSpecialActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Regular category tabs */}
        {regularTabs.map((tab) => {
          const isActive = feedMode === null && tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key ?? "all"}
              onPress={() => { onSelectFeedMode(null); onSelect(tab.key); }}
              style={[styles.pill, isActive && styles.pillActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272a",
    backgroundColor: "#09090b",
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "#3f3f46",
    marginHorizontal: 2,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "transparent",
  },
  pillActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  pillSpecial: {
    borderColor: "#78501a",
  },
  pillSpecialActive: {
    backgroundColor: "#c27c28",
    borderColor: "#c27c28",
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#a1a1aa",
    letterSpacing: 0.2,
  },
  labelActive: {
    color: "#09090b",
  },
  labelSpecial: {
    color: "#c27c28",
  },
  labelSpecialActive: {
    color: "#09090b",
  },
});
