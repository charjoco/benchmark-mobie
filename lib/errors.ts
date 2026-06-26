// Human-friendly error mapping. Keeps raw developer strings (Supabase messages,
// "Network request failed", fetch errors, HTTP status text) out of the UI.

type ErrorKind =
  | "network"
  | "auth_invalid"
  | "auth_exists"
  | "rate_limit"
  | "server"
  | "unknown";

export function classifyError(err: unknown): ErrorKind {
  const e = err as { message?: string; name?: string; status?: number; statusCode?: number } | null;
  const msg = (e?.message ?? "").toLowerCase();
  const name = e?.name ?? "";
  const status = e?.status ?? e?.statusCode;

  // Network / connectivity — Supabase surfaces these as AuthRetryableFetchError,
  // RN fetch as "Network request failed", our withTimeout as "Timed out".
  if (
    name === "AuthRetryableFetchError" ||
    msg.includes("network request failed") ||
    msg.includes("failed to fetch") ||
    msg.includes("fetch failed") ||
    msg.includes("network") ||
    msg.includes("timed out") ||
    msg.includes("timeout") ||
    status === 0
  ) {
    return "network";
  }

  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "auth_invalid";
  }
  if (
    msg.includes("already registered") ||
    msg.includes("already exists") ||
    msg.includes("user already")
  ) {
    return "auth_exists";
  }
  if (status === 429 || msg.includes("rate limit") || msg.includes("too many")) {
    return "rate_limit";
  }
  if (typeof status === "number" && status >= 500) return "server";
  return "unknown";
}

/** Generic load/fetch failure copy + retry affordance lives at the call site. */
export const LOAD_ERROR_MESSAGE =
  "Couldn't load — check your connection and try again.";

export function loginErrorMessage(err: unknown): string {
  switch (classifyError(err)) {
    case "network":
      return "Couldn't reach the server — check your connection and try again.";
    case "auth_invalid":
      return "Wrong email or password.";
    case "rate_limit":
      return "Too many attempts — please wait a moment and try again.";
    default:
      return "Couldn't sign in — please try again.";
  }
}

export function signupErrorMessage(err: unknown): string {
  switch (classifyError(err)) {
    case "network":
      return "Couldn't reach the server — check your connection and try again.";
    case "auth_exists":
      return "An account with this email already exists. Try signing in.";
    case "rate_limit":
      return "Too many attempts — please wait a moment and try again.";
    default:
      return "Couldn't create your account — please try again.";
  }
}

export function deleteAccountErrorMessage(err: unknown): string {
  return classifyError(err) === "network"
    ? "Couldn't reach the server — check your connection and try again. Your account has not been deleted."
    : "Couldn't delete your account — please try again. Your account has not been deleted.";
}
