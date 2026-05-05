import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, UserPreferences, DEFAULT_PREFERENCES, loadPreferences } from "./supabase";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  preferences: UserPreferences;
  isLoading: boolean;
  isGuest: boolean;
  onboardingComplete: boolean;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  preferences: DEFAULT_PREFERENCES,
  isLoading: true,
  isGuest: false,
  onboardingComplete: false,
  continueAsGuest: () => {},
  signOut: async () => {},
  refreshPreferences: async () => {},
  updatePreferences: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    console.log(`[auth/context] ${new Date().toISOString()} preferences state changed | onboarding_complete=${preferences.onboarding_complete} preferred_brands.length=${preferences.preferred_brands.length} brands.length=${preferences.brands.length}`);
  }, [preferences]);

  function continueAsGuest() {
    setIsGuest(true);
  }

  function updatePreferences(partial: Partial<UserPreferences>) {
    setPreferences(prev => ({ ...prev, ...partial }));
  }

  async function refreshPreferences() {
    console.log(`[auth/refreshPreferences] ${new Date().toISOString()} entry`);
    console.log(`[auth/refreshPreferences] ${new Date().toISOString()} before getSession`);
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    console.log(`[auth/refreshPreferences] ${new Date().toISOString()} after getSession | session=${!!currentSession} userId=${currentSession?.user?.id ?? "none"}`);
    if (!currentSession?.user) {
      console.log(`[auth/refreshPreferences] ${new Date().toISOString()} no user — returning`);
      return;
    }
    console.log(`[auth/refreshPreferences] ${new Date().toISOString()} before loadPreferences | userId=${currentSession.user.id}`);
    const prefs = await loadPreferences(currentSession.user.id);
    console.log(`[auth/refreshPreferences] ${new Date().toISOString()} after loadPreferences | onboarding_complete=${prefs.onboarding_complete}`);
    setPreferences(prefs);
    console.log(`[auth/refreshPreferences] ${new Date().toISOString()} setPreferences called — exit`);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(`[auth/context] ${new Date().toISOString()} initial getSession | session=${!!session} userId=${session?.user?.id ?? "none"}`);
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log(`[auth/context] ${new Date().toISOString()} onAuthStateChange | event=${_event} session=${!!session} userId=${session?.user?.id ?? "none"}`);
        setSession(session);
        if (session?.user) {
          const prefs = await loadPreferences(session.user.id);
          console.log(`[auth/context] ${new Date().toISOString()} onAuthStateChange loadPreferences done | onboarding_complete=${prefs.onboarding_complete}`);
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
        onboardingComplete: preferences.onboarding_complete,
        continueAsGuest,
        signOut,
        refreshPreferences,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
