import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { withTimeout } from "./withTimeout";

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
    flowType: "pkce",
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
  console.log(`[supabase/loadPreferences] ${new Date().toISOString()} entry | userId=${userId}`);
  console.log(`[supabase/loadPreferences] ${new Date().toISOString()} before query`);
  const { data, error } = await supabase
    .from("user_preferences")
    .select(PREFS_SELECT)
    .eq("user_id", userId)
    .single();
  console.log(`[supabase/loadPreferences] ${new Date().toISOString()} result | error=${JSON.stringify(error)} onboarding_complete=${data?.onboarding_complete ?? "null"}`);
  if (error || !data) return DEFAULT_PREFERENCES;
  return data as UserPreferences;
}

export async function savePreferences(
  userId: string,
  prefs: UserPreferences
): Promise<{ error: import("@supabase/supabase-js").PostgrestError | null }> {
  console.log(`[supabase/savePreferences] ${new Date().toISOString()} entry | userId=${userId} onboarding_complete=${prefs.onboarding_complete}`);
  const { error } = await withTimeout(
    Promise.resolve(supabase.from("user_preferences").upsert(
      { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )),
    8000
  );
  console.log(`[supabase/savePreferences] ${new Date().toISOString()} result | error=${JSON.stringify(error)}`);
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
): Promise<{
  upsertError: import("@supabase/supabase-js").PostgrestError | null;
  updateError: import("@supabase/supabase-js").PostgrestError | null;
}> {
  console.log(`[supabase/saveOnboardingPreferences] ${new Date().toISOString()} entry | userId=${userId}`);

  // Step 1: ensure a row exists for new users. ignoreDuplicates means if the
  // row already exists this is a no-op — existing brands/sizes/colors are preserved.
  const { error: upsertError } = await withTimeout(
    Promise.resolve(supabase.from("user_preferences").upsert(
      {
        user_id: userId,
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
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    )),
    8000
  );
  console.log(`[supabase/saveOnboardingPreferences] ${new Date().toISOString()} after upsert (step 1) | upsertError=${JSON.stringify(upsertError)}`);

  if (upsertError) return { upsertError, updateError: null };

  // Step 2: write the onboarding fields on the now-guaranteed-existing row.
  const { error: updateError } = await withTimeout(
    Promise.resolve(supabase
      .from("user_preferences")
      .update({
        preferred_brands: data.preferred_brands,
        top_size: data.top_size,
        bottom_size: data.bottom_size,
        outerwear_size: data.outerwear_size,
        style_lean: data.style_lean,
        price_comfort: data.price_comfort,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)),
    8000
  );
  console.log(`[supabase/saveOnboardingPreferences] ${new Date().toISOString()} after update (step 2) | updateError=${JSON.stringify(updateError)}`);

  return { upsertError: null, updateError };
}
