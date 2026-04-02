import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { useSaved } from "@/lib/SavedContext";

export default function TabsLayout() {
  const { savedCount } = useSaved();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#71717a",
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
    backgroundColor: "#09090b",
    borderTopColor: "#27272a",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: "#f87171",
    fontSize: 10,
  },
});
