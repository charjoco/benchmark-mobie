import { supabase } from "./supabase";

export type SavedEntry = {
  brand: string;
  externalId: string;
  isWatching: boolean;
};

export async function fetchSavedEntries(userId: string): Promise<SavedEntry[]> {
  const { data, error } = await supabase
    .from("saved_products")
    .select("brand, external_id, is_watching")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data.map((r) => ({
    brand: r.brand,
    externalId: r.external_id,
    isWatching: r.is_watching,
  }));
}

export async function addSavedEntry(userId: string, brand: string, externalId: string): Promise<void> {
  await supabase.from("saved_products").upsert(
    { user_id: userId, brand, external_id: externalId, is_watching: false },
    { onConflict: "user_id,brand,external_id" }
  );
}

export async function removeSavedEntry(userId: string, brand: string, externalId: string): Promise<void> {
  await supabase.from("saved_products")
    .delete()
    .eq("user_id", userId)
    .eq("brand", brand)
    .eq("external_id", externalId);
}

export async function setWatchingEntry(
  userId: string,
  brand: string,
  externalId: string,
  isWatching: boolean
): Promise<void> {
  await supabase.from("saved_products")
    .update({ is_watching: isWatching })
    .eq("user_id", userId)
    .eq("brand", brand)
    .eq("external_id", externalId);
}
