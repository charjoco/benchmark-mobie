import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/lib/AuthContext";
import { savePreferences, UserPreferences } from "@/lib/supabase";
import { BRANDS, SIZES, COLOR_BUCKETS } from "@/lib/constants";
import { COLOR_BUCKET_HEX } from "@/lib/constants";
import { getTheme } from "@/lib/theme";
import type { ColorBucket } from "@/lib/types";

const theme = getTheme();

export default function ProfileScreen() {
  const { user, preferences, signOut, updatePreferences } = useAuth();
  const [draft, setDraft] = useState<UserPreferences>(preferences);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  function toggleBrand(key: string) {
    setDraft((d) => ({
      ...d,
      brands: d.brands.includes(key)
        ? d.brands.filter((b) => b !== key)
        : [...d.brands, key],
    }));
  }

  function toggleSize(size: string) {
    setDraft((d) => ({
      ...d,
      sizes: d.sizes.includes(size)
        ? d.sizes.filter((s) => s !== size)
        : [...d.sizes, size],
    }));
  }

  function toggleColor(color: string) {
    setDraft((d) => ({
      ...d,
      colors: d.colors.includes(color)
        ? d.colors.filter((c) => c !== color)
        : [...d.colors, color],
    }));
  }

  async function handleSave() {
    console.log(`[profile/handleSave] ${new Date().toISOString()} entry | user=${!!user} draft.onboarding_complete=${draft.onboarding_complete}`);
    if (!user) {
      console.log(`[profile/handleSave] ${new Date().toISOString()} early return — no user`);
      return;
    }
    setSaving(true);
    try {
      console.log(`[profile/handleSave] ${new Date().toISOString()} before savePreferences`);
      const { error } = await savePreferences(user.id, draft);
      console.log(`[profile/handleSave] ${new Date().toISOString()} after savePreferences | error=${JSON.stringify(error)}`);
      if (error) {
        console.log(`[profile/handleSave] ${new Date().toISOString()} throw — savePreferences error`);
        throw error;
      }
      console.log(`[profile/handleSave] ${new Date().toISOString()} calling updatePreferences directly`);
      updatePreferences(draft);
      console.log(`[profile/handleSave] ${new Date().toISOString()} updatePreferences called`);
      Alert.alert("Saved", "Your preferences have been saved.");
      console.log(`[profile/handleSave] ${new Date().toISOString()} exit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`[profile/handleSave] ${new Date().toISOString()} catch — ${message}`);
      Alert.alert("Error", "Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BENCHMARK</Text>
          <Text style={styles.headerTagline}>FOR MEN WHO SET THE BAR</Text>
        </View>

        {/* Account info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Style preferences */}
        <TouchableOpacity
          style={styles.prefRow}
          onPress={() => router.push("/onboarding")}
          activeOpacity={0.7}
        >
          <View>
            <Text style={styles.prefRowLabel}>STYLE PREFERENCES</Text>
            <Text style={styles.prefRowHint}>Brands, sizes, style lean, price range</Text>
          </View>
          <Text style={styles.prefRowArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Default sizes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DEFAULT SIZE</Text>
          <Text style={styles.sectionHint}>
            Products will be pre-filtered to these sizes when you open the app.
          </Text>
          <View style={styles.pills}>
            {SIZES.map((size) => {
              const active = draft.sizes.includes(size);
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => toggleSize(size)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Default brands */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FAVORITE BRANDS</Text>
          <Text style={styles.sectionHint}>Pre-filter your feed to these brands.</Text>
          <View style={styles.brandList}>
            {BRANDS.map(({ key, label }) => {
              const active = draft.brands.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.brandRow}
                  onPress={() => toggleBrand(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.brandLabel, active && styles.brandLabelActive]}>
                    {label}
                  </Text>
                  <View style={[styles.checkbox, active && styles.checkboxActive]}>
                    {active && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Default colors */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERRED COLORS</Text>
          <Text style={styles.sectionHint}>Pre-filter your feed to these colors.</Text>
          <View style={styles.colorGrid}>
            {COLOR_BUCKETS.map((color) => {
              const hex = COLOR_BUCKET_HEX[color as ColorBucket] ?? "#6b7280";
              const active = draft.colors.includes(color);
              return (
                <TouchableOpacity
                  key={color}
                  style={styles.colorItem}
                  onPress={() => toggleColor(color)}
                >
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: hex.startsWith("linear") ? "#6b7280" : hex },
                      active && styles.colorSwatchActive,
                    ]}
                  />
                  <Text style={[styles.colorLabel, active && styles.colorLabelActive]}>
                    {color}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#09090b" />
          ) : (
            <Text style={styles.saveBtnText}>SAVE PREFERENCES</Text>
          )}
        </TouchableOpacity>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.signOutBtn, signingOut && styles.btnDisabled]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#f87171" />
          ) : (
            <Text style={styles.signOutText}>Sign out</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.screenBg,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.dividerColor,
    gap: 2,
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
    color: "#52525b",
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 10,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#71717a",
  },
  sectionHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#52525b",
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.dividerColor,
    marginHorizontal: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoKey: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#a1a1aa",
  },
  infoValue: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#f4f4f5",
    flex: 1,
    textAlign: "right",
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  pillActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  pillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#a1a1aa",
  },
  pillTextActive: {
    color: "#09090b",
  },
  brandList: {
    gap: 0,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1c1c1e",
  },
  brandLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#71717a",
  },
  brandLabelActive: {
    color: "#f4f4f5",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  checkmark: {
    fontSize: 12,
    color: "#09090b",
    fontFamily: "Inter_600SemiBold",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorItem: {
    alignItems: "center",
    gap: 4,
    width: 44,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  colorSwatchActive: {
    borderWidth: 2,
    borderColor: "#ffffff",
    transform: [{ scale: 1.15 }],
  },
  colorLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    color: "#52525b",
    textAlign: "center",
  },
  colorLabelActive: {
    color: "#f4f4f5",
  },
  saveBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: "#f4f4f5",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 1.5,
    color: "#09090b",
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  prefRowLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#71717a",
    marginBottom: 3,
  },
  prefRowHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#3f3f46",
  },
  prefRowArrow: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#52525b",
  },
  signOutBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  signOutText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#71717a",
  },
});
