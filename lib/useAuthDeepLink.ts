import { useEffect } from "react";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

async function handleAuthURL(url: string): Promise<void> {
  console.log(`[auth/deeplink] ${new Date().toISOString()} URL received | url=${url}`);

  // PKCE flow: benchmark://?code=<uuid>
  const parsed = Linking.parse(url);
  const code = parsed.queryParams?.code;
  if (typeof code === "string" && code.length > 0) {
    console.log(`[auth/deeplink] ${new Date().toISOString()} PKCE flow detected — calling exchangeCodeForSession`);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.log(`[auth/deeplink] ${new Date().toISOString()} exchangeCodeForSession error | ${error.message}`);
    } else {
      console.log(`[auth/deeplink] ${new Date().toISOString()} exchangeCodeForSession success`);
    }
    return;
  }

  // Implicit flow: benchmark://#access_token=...&refresh_token=...
  // Linking.parse does not expose the hash fragment, so parse it from the raw URL.
  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    const params = new URLSearchParams(url.slice(hashIndex + 1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (access_token && refresh_token) {
      console.log(`[auth/deeplink] ${new Date().toISOString()} implicit flow detected — calling setSession`);
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) {
        console.log(`[auth/deeplink] ${new Date().toISOString()} setSession error | ${error.message}`);
      } else {
        console.log(`[auth/deeplink] ${new Date().toISOString()} setSession success`);
      }
      return;
    }
  }

  console.log(`[auth/deeplink] ${new Date().toISOString()} no auth params found — ignoring`);
}

export function useAuthDeepLink(): void {
  useEffect(() => {
    // Cold start: app was launched by tapping the link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log(`[auth/deeplink] ${new Date().toISOString()} cold start | url=${url}`);
        handleAuthURL(url);
      } else {
        console.log(`[auth/deeplink] ${new Date().toISOString()} cold start — no initial URL`);
      }
    });

    // Warm start: app was already open in the background
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log(`[auth/deeplink] ${new Date().toISOString()} warm start | url=${url}`);
      handleAuthURL(url);
    });

    return () => subscription.remove();
  }, []);
}
