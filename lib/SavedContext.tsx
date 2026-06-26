import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
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
  const { notify } = useToast();
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

  // Optimistic update with confirmed-write reconciliation: the heart flips
  // immediately for responsiveness, but if the persisted write fails we revert
  // the optimistic change and surface a brief, non-blocking error. This keeps the
  // in-memory map consistent with what actually persisted, so a kill/reopen (which
  // reloads from Supabase, above) never shows a phantom save.
  const toggleSaved = useCallback(
    (brand: string, externalId: string) => {
      const key = makeKey(brand, externalId);
      const prevEntry = savedMap.get(key);
      const wasSaved = !!prevEntry;

      setSavedMap((prev) => {
        const next = new Map(prev);
        if (wasSaved) next.delete(key);
        else next.set(key, { brand, externalId, isWatching: false });
        return next;
      });

      // Guests have no persistence layer — local-only, nothing to confirm.
      if (!session?.user) return;
      const userId = session.user.id;
      const write = wasSaved
        ? removeSavedEntry(userId, brand, externalId)
        : addSavedEntry(userId, brand, externalId);

      write
        .then(({ error }) => {
          if (!error) return;
          // Revert to the pre-toggle state.
          setSavedMap((prev) => {
            const next = new Map(prev);
            if (wasSaved && prevEntry) next.set(key, prevEntry);
            else next.delete(key);
            return next;
          });
          notify("Couldn't save — try again");
        })
        .catch(() => {
          setSavedMap((prev) => {
            const next = new Map(prev);
            if (wasSaved && prevEntry) next.set(key, prevEntry);
            else next.delete(key);
            return next;
          });
          notify("Couldn't save — try again");
        });
    },
    [savedMap, session?.user?.id, notify]
  );

  const toggleWatch = useCallback(
    (brand: string, externalId: string) => {
      const key = makeKey(brand, externalId);
      const existing = savedMap.get(key);
      if (!existing) return;
      const newWatching = !existing.isWatching;

      setSavedMap((prev) => {
        const cur = prev.get(key);
        if (!cur) return prev;
        const next = new Map(prev);
        next.set(key, { ...cur, isWatching: newWatching });
        return next;
      });

      if (!session?.user) return;
      const revert = () => {
        setSavedMap((prev) => {
          const cur = prev.get(key);
          if (!cur) return prev;
          const next = new Map(prev);
          next.set(key, { ...cur, isWatching: existing.isWatching });
          return next;
        });
        notify("Couldn't update — try again");
      };
      setWatchingEntry(session.user.id, brand, externalId, newWatching)
        .then(({ error }) => {
          if (error) revert();
        })
        .catch(revert);
    },
    [savedMap, session?.user?.id, notify]
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
