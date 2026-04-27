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
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  brands: [],
  sizes: [],
  colors: [],
  sort_by: "lastSeenAt",
  on_sale: false,
  is_new: false,
};

export async function loadPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("brands, sizes, colors, sort_by, on_sale, is_new")
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
