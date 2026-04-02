import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, UserPreferences, DEFAULT_PREFERENCES, loadPreferences } from "./supabase";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  preferences: UserPreferences;
  isLoading: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  preferences: DEFAULT_PREFERENCES,
  isLoading: true,
  isGuest: false,
  continueAsGuest: () => {},
  signOut: async () => {},
  refreshPreferences: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  function continueAsGuest() {
    setIsGuest(true);
  }

  async function refreshPreferences() {
    if (!session?.user) return;
    const prefs = await loadPreferences(session.user.id);
    setPreferences(prefs);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const prefs = await loadPreferences(session.user.id);
          setPreferences(prefs);
        } else {
          setPreferences(DEFAULT_PREFERENCES);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    setIsGuest(false);
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        preferences,
        isLoading,
        isGuest,
        continueAsGuest,
        signOut,
        refreshPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
