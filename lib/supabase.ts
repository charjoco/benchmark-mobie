import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Secure token storage adapter for React Native
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type UserPreferences = {
  brands: string[];
  sizes: string[];
  colors: string[];
  sort_by: string;
  on_sale: boolean;
  is_new: boolean;
  // Onboarding-captured personalization fields
  preferred_brands: string[];
  top_size: string | null;
  bottom_size: string | null;
  outerwear_size: string | null;
  style_lean: string[];
  price_comfort: string | null;
  onboarding_complete: boolean;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  brands: [],
  sizes: [],
  colors: [],
  sort_by: "lastSeenAt",
  on_sale: false,
  is_new: false,
  preferred_brands: [],
  top_size: null,
  bottom_size: null,
  outerwear_size: null,
  style_lean: [],
  price_comfort: null,
  onboarding_complete: false,
};

const PREFS_SELECT =
  "brands, sizes, colors, sort_by, on_sale, is_new, preferred_brands, top_size, bottom_size, outerwear_size, style_lean, price_comfort, onboarding_complete";

export async function loadPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select(PREFS_SELECT)
    .eq("user_id", userId)
    .single();

  if (error || !data) return DEFAULT_PREFERENCES;
  return data as UserPreferences;
}

export async function savePreferences(
  userId: string,
  prefs: UserPreferences
): Promise<{ error: import("@supabase/supabase-js").PostgrestError | null }> {
  const { error } = await supabase.from("user_preferences").upsert(
    { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  return { error };
}

export interface OnboardingData {
  preferred_brands: string[];
  top_size: string;
  bottom_size: string;
  outerwear_size: string | null;
  style_lean: string[];
  price_comfort: string;
}

export async function saveOnboardingPreferences(
  userId: string,
  data: OnboardingData
): Promise<{ error: import("@supabase/supabase-js").PostgrestError | null }> {
  const upsertPayload = {
    user_id: userId,
    ...data,
    onboarding_complete: true,
    updated_at: new Date().toISOString(),
  };
  console.log("[saveOnboardingPreferences] upserting to user_preferences:", JSON.stringify(upsertPayload));

  const { data: responseData, error } = await supabase.from("user_preferences").upsert(
    upsertPayload,
    { onConflict: "user_id" }
  );

  console.log("[saveOnboardingPreferences] upsert complete — responseData:", JSON.stringify(responseData), "error:", JSON.stringify(error));
  return { error };
}
