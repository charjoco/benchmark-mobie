import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { PostHogProvider } from "posthog-react-native";
import { posthog, trackAppOpen } from "@/lib/analytics";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { SavedProvider } from "@/lib/SavedContext";
import { SelectedProductProvider } from "@/lib/SelectedProductContext";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isLoading, isGuest, onboardingComplete } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup   = segments[0] === "(auth)";
    const inOnboarding  = segments[0] === "onboarding";

    if (!session && !isGuest && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && !onboardingComplete && !inOnboarding) {
      router.replace("/onboarding");
    } else if (session && onboardingComplete && inOnboarding) {
      router.replace("/(tabs)");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (isGuest && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, isLoading, isGuest, onboardingComplete, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      trackAppOpen();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <PostHogProvider client={posthog}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <SavedProvider>
              <SelectedProductProvider>
                <RootNavigator />
              </SelectedProductProvider>
            </SavedProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PostHogProvider>
  );
}
