import { useState, useEffect, useRef } from "react";
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
import {
  BRANDS,
  TOP_SIZES,
  BOTTOM_SIZES,
  STYLE_LEAN_OPTIONS,
  PRICE_COMFORT_OPTIONS,
} from "@/lib/constants";
import { saveOnboardingPreferences } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { getTheme } from "@/lib/theme";
import { withTimeout } from "@/lib/withTimeout";

const theme = getTheme();
const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const { user, preferences, onboardingComplete, refreshPreferences } = useAuth();

  const [step, setStep] = useState(0);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [topSize, setTopSize] = useState<string | null>(null);
  const [bottomSize, setBottomSize] = useState<string | null>(null);
  const [outerwearSize, setOuterwearSize] = useState<string | null>(null);
  const [styleLean, setStyleLean] = useState<string[]>([]);
  const [priceComfort, setPriceComfort] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  // Pre-populate from existing preferences when editing
  useEffect(() => {
    if (preferences.preferred_brands.length > 0) setSelectedBrands(preferences.preferred_brands);
    if (preferences.top_size) setTopSize(preferences.top_size);
    if (preferences.bottom_size) setBottomSize(preferences.bottom_size);
    if (preferences.outerwear_size) setOuterwearSize(preferences.outerwear_size);
    if (preferences.style_lean.length > 0) setStyleLean(preferences.style_lean);
    if (preferences.price_comfort) setPriceComfort(preferences.price_comfort);
  }, []);

  function handleSkip() {
    console.log(`[onboarding/handleSkip] ${new Date().toISOString()} entry | onboardingComplete=${onboardingComplete}`);
    if (onboardingComplete) {
      console.log(`[onboarding/handleSkip] ${new Date().toISOString()} → router.back()`);
      router.back();
    } else {
      console.log(`[onboarding/handleSkip] ${new Date().toISOString()} → router.replace("/(tabs)")`);
      router.replace("/(tabs)");
    }
    console.log(`[onboarding/handleSkip] ${new Date().toISOString()} exit`);
  }

  async function handleFinish() {
    console.log(`[onboarding/handleFinish] ${new Date().toISOString()} entry | user=${!!user} topSize=${topSize} bottomSize=${bottomSize} priceComfort=${priceComfort} onboardingComplete=${onboardingComplete}`);
    if (!user || !topSize || !bottomSize || !priceComfort) {
      console.log(`[onboarding/handleFinish] ${new Date().toISOString()} early return — missing required fields`);
      return;
    }
    // Synchronous ref guard prevents double-fire during React's async setState window
    if (savingRef.current) {
      console.log(`[onboarding/handleFinish] ${new Date().toISOString()} early return — savingRef guard`);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      console.log(`[onboarding/handleFinish] ${new Date().toISOString()} before saveOnboardingPreferences`);
      const { upsertError, updateError } = await saveOnboardingPreferences(user.id, {
        preferred_brands: selectedBrands,
        top_size: topSize,
        bottom_size: bottomSize,
        outerwear_size: outerwearSize,
        style_lean: styleLean,
        price_comfort: priceComfort,
      });
      console.log(`[onboarding/handleFinish] ${new Date().toISOString()} after saveOnboardingPreferences | upsertError=${JSON.stringify(upsertError)} updateError=${JSON.stringify(updateError)}`);

      if (upsertError) {
        console.log(`[onboarding/handleFinish] ${new Date().toISOString()} throw — upsertError`);
        throw upsertError;
      }
      if (updateError) {
        console.log(`[onboarding/handleFinish] ${new Date().toISOString()} throw — updateError`);
        throw updateError;
      }

      console.log(`[onboarding/handleFinish] ${new Date().toISOString()} before refreshPreferences | onboardingComplete=${onboardingComplete} (closure value)`);
      await withTimeout(refreshPreferences(), 8000);
      console.log(`[onboarding/handleFinish] ${new Date().toISOString()} after refreshPreferences | onboardingComplete=${onboardingComplete} (closure — may be stale)`);

      console.log(`[onboarding/handleFinish] ${new Date().toISOString()} → router.replace("/(tabs)")`);
      router.replace("/(tabs)");
      console.log(`[onboarding/handleFinish] ${new Date().toISOString()} exit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.log(`[onboarding/handleFinish] ${new Date().toISOString()} catch — ${message}`);
      Alert.alert("Something went wrong", message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  // ── Step 0 — Brands ──────────────────────────────────────────────────────
  function toggleBrand(key: string) {
    setSelectedBrands((prev) => {
      if (prev.includes(key)) return prev.filter((b) => b !== key);
      if (prev.length >= 5) return prev;
      return [...prev, key];
    });
  }

  // ── Step 2 — Style lean ──────────────────────────────────────────────────
  function toggleStyleLean(key: string) {
    setStyleLean((prev) => {
      if (prev.includes(key)) return prev.filter((s) => s !== key);
      if (prev.length >= 3) return prev;
      return [...prev, key];
    });
  }

  // ── Can continue? ────────────────────────────────────────────────────────
  const canContinue = [
    selectedBrands.length >= 1,                        // step 0
    topSize !== null && bottomSize !== null,            // step 1
    styleLean.length >= 1,                             // step 2
    priceComfort !== null,                             // step 3
    !saving,                                           // step 4
  ][step];

  // ── Confirmation summary text ────────────────────────────────────────────
  function buildSummary() {
    const brandLabels = selectedBrands
      .slice(0, 3)
      .map((k) => BRANDS.find((b) => b.key === k)?.label ?? k);
    const brandStr =
      brandLabels.length <= 2
        ? brandLabels.join(" and ")
        : `${brandLabels[0]}, ${brandLabels[1]}, and ${brandLabels[2]}`;
    const styleLabels = styleLean
      .map((k) => STYLE_LEAN_OPTIONS.find((s) => s.key === k)?.label ?? k)
      .join(", ");
    const priceLabel = PRICE_COMFORT_OPTIONS.find((p) => p.key === priceComfort)?.label ?? "";
    return `We'll show you drops from ${brandStr} in your size, focused on ${styleLabels} at ${priceLabel}.`;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      {/* Step content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <>
            <Text style={styles.question}>Which brands do you already wear or follow?</Text>
            <Text style={styles.hint}>Choose up to 5.</Text>
            <View style={styles.brandGrid}>
              {BRANDS.map((brand) => {
                const selected = selectedBrands.includes(brand.key);
                const atMax = selectedBrands.length >= 5 && !selected;
                return (
                  <TouchableOpacity
                    key={brand.key}
                    style={[
                      styles.brandTile,
                      selected && styles.brandTileSelected,
                      atMax && styles.brandTileDim,
                    ]}
                    onPress={() => toggleBrand(brand.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.brandTileText,
                        selected && styles.brandTileTextSelected,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {brand.label.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.question}>What's your size?</Text>

            <Text style={styles.sizeLabel}>TOP</Text>
            <View style={styles.pillRow}>
              {TOP_SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, topSize === s && styles.pillActive]}
                  onPress={() => setTopSize(topSize === s ? null : s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, topSize === s && styles.pillTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sizeLabel, { marginTop: 24 }]}>BOTTOM</Text>
            <View style={styles.pillRow}>
              {BOTTOM_SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, bottomSize === s && styles.pillActive]}
                  onPress={() => setBottomSize(bottomSize === s ? null : s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, bottomSize === s && styles.pillTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sizeLabel, { marginTop: 24 }]}>
              OUTERWEAR{" "}
              <Text style={styles.optional}>(optional)</Text>
            </Text>
            <View style={styles.pillRow}>
              {TOP_SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, outerwearSize === s && styles.pillActive]}
                  onPress={() => setOuterwearSize(outerwearSize === s ? null : s)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.pillText, outerwearSize === s && styles.pillTextActive]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.question}>What's your style?</Text>
            <Text style={styles.hint}>Pick up to 3.</Text>
            <View style={styles.cardList}>
              {STYLE_LEAN_OPTIONS.map((opt) => {
                const selected = styleLean.includes(opt.key);
                const atMax = styleLean.length >= 3 && !selected;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionCard,
                      selected && styles.optionCardSelected,
                      atMax && styles.optionCardDim,
                    ]}
                    onPress={() => toggleStyleLean(opt.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionCardLabel,
                        selected && styles.optionCardLabelSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={styles.optionCardDesc}>{opt.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.question}>What do you usually spend on a single item?</Text>
            <View style={styles.cardList}>
              {PRICE_COMFORT_OPTIONS.map((opt) => {
                const selected = priceComfort === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.optionCard, selected && styles.optionCardSelected]}
                    onPress={() => setPriceComfort(opt.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionCardLabel,
                        selected && styles.optionCardLabelSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={styles.optionCardDesc}>{opt.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {step === 4 && (
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationTitle}>You're all set.</Text>
            <Text style={styles.confirmationBody}>{buildSummary()}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.actions}>
        {step < 4 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}

        {step < 4 ? (
          <TouchableOpacity
            style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
            onPress={() => setStep((s) => s + 1)}
            disabled={!canContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueBtnText}>CONTINUE</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.continueBtn, saving && styles.continueBtnDisabled]}
            onPress={handleFinish}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#09090b" />
            ) : (
              <Text style={styles.continueBtnText}>START BROWSING</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.screenBg,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3f3f46",
  },
  dotActive: {
    backgroundColor: "#f4f4f5",
    width: 18,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  question: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 26,
    color: "#f4f4f5",
    lineHeight: 32,
    marginBottom: 8,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#52525b",
    marginBottom: 20,
  },
  // Brand grid
  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  brandTile: {
    paddingHorizontal: 12,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#27272a",
    backgroundColor: "#111113",
    minWidth: "46%",
    flex: 1,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTileSelected: {
    borderColor: "#f4f4f5",
    backgroundColor: "#f4f4f5",
  },
  brandTileDim: {
    opacity: 0.4,
  },
  brandTileText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#71717a",
    textAlign: "center",
  },
  brandTileTextSelected: {
    color: "#09090b",
  },
  // Sizes
  sizeLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#52525b",
    marginBottom: 10,
  },
  optional: {
    fontFamily: "Inter_400Regular",
    color: "#3f3f46",
    letterSpacing: 0,
    textTransform: "none",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#111113",
  },
  pillActive: {
    backgroundColor: "#f4f4f5",
    borderColor: "#f4f4f5",
  },
  pillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#71717a",
  },
  pillTextActive: {
    color: "#09090b",
  },
  // Style lean + price cards
  cardList: {
    gap: 10,
    marginTop: 8,
  },
  optionCard: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#27272a",
    backgroundColor: "#111113",
    gap: 4,
  },
  optionCardSelected: {
    borderColor: "#f4f4f5",
    backgroundColor: "#1c1c1e",
  },
  optionCardDim: {
    opacity: 0.4,
  },
  optionCardLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#a1a1aa",
  },
  optionCardLabelSelected: {
    color: "#f4f4f5",
  },
  optionCardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#52525b",
    lineHeight: 17,
  },
  // Confirmation
  confirmationContainer: {
    paddingTop: 40,
    gap: 20,
  },
  confirmationTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 36,
    color: "#f4f4f5",
    letterSpacing: 1,
  },
  confirmationBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#a1a1aa",
    lineHeight: 24,
  },
  // Bottom actions
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.dividerColor,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  skipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#52525b",
  },
  continueBtn: {
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
    paddingVertical: 15,
    alignItems: "center",
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 1.5,
    color: "#09090b",
  },
});
