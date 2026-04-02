import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchSavedEntries,
  addSavedEntry,
  removeSavedEntry,
  setWatchingEntry,
  type SavedEntry,
} from "./savedProducts";

type SavedMap = Map<string, SavedEntry>; // key = "brand:externalId"

type SavedContextType = {
  savedMap: SavedMap;
  isSaved: (brand: string, externalId: string) => boolean;
  isWatching: (brand: string, externalId: string) => boolean;
  toggleSaved: (brand: string, externalId: string) => void;
  toggleWatch: (brand: string, externalId: string) => void;
  savedCount: number;
};

const SavedContext = createContext<SavedContextType>({
  savedMap: new Map(),
  isSaved: () => false,
  isWatching: () => false,
  toggleSaved: () => {},
  toggleWatch: () => {},
  savedCount: 0,
});

function makeKey(brand: string, externalId: string) {
  return `${brand}:${externalId}`;
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const { session, isGuest } = useAuth();
  const [savedMap, setSavedMap] = useState<SavedMap>(new Map());

  // Load from Supabase on auth
  useEffect(() => {
    if (!session?.user) {
      if (!isGuest) setSavedMap(new Map());
      return;
    }
    fetchSavedEntries(session.user.id).then((entries) => {
      const map = new Map<string, SavedEntry>();
      entries.forEach((e) => map.set(makeKey(e.brand, e.externalId), e));
      setSavedMap(map);
    });
  }, [session?.user?.id, isGuest]);

  const isSaved = useCallback(
    (brand: string, externalId: string) => savedMap.has(makeKey(brand, externalId)),
    [savedMap]
  );

  const isWatching = useCallback(
    (brand: string, externalId: string) => savedMap.get(makeKey(brand, externalId))?.isWatching ?? false,
    [savedMap]
  );

  const toggleSaved = useCallback(
    (brand: string, externalId: string) => {
      const key = makeKey(brand, externalId);
      setSavedMap((prev) => {
        const next = new Map(prev);
        if (next.has(key)) {
          next.delete(key);
          if (session?.user) removeSavedEntry(session.user.id, brand, externalId);
        } else {
          next.set(key, { brand, externalId, isWatching: false });
          if (session?.user) addSavedEntry(session.user.id, brand, externalId);
        }
        return next;
      });
    },
    [session?.user?.id]
  );

  const toggleWatch = useCallback(
    (brand: string, externalId: string) => {
      const key = makeKey(brand, externalId);
      setSavedMap((prev) => {
        const existing = prev.get(key);
        if (!existing) return prev;
        const next = new Map(prev);
        const newWatching = !existing.isWatching;
        next.set(key, { ...existing, isWatching: newWatching });
        if (session?.user) setWatchingEntry(session.user.id, brand, externalId, newWatching);
        return next;
      });
    },
    [session?.user?.id]
  );

  return (
    <SavedContext.Provider
      value={{
        savedMap,
        isSaved,
        isWatching,
        toggleSaved,
        toggleWatch,
        savedCount: savedMap.size,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
