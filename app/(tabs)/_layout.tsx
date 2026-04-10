import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { useSaved } from "@/lib/SavedContext";
import { getTheme } from "@/lib/theme";

const theme = getTheme();

export default function TabsLayout() {
  const { savedCount } = useSaved();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { backgroundColor: theme.screenBg }],
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#52525b",
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Shop", tabBarIcon: () => null }} />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: () => null,
          tabBarBadge: savedCount > 0 ? savedCount : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: () => null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopColor: "#1f1f21",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  badge: {
    backgroundColor: "#f87171",
    fontSize: 10,
  },
});
