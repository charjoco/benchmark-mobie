import type { ImageSourcePropType } from "react-native";

// ─── Background image registry ───────────────────────────────────────────────
// To add a new seasonal background:
//  1. Drop the image into /assets/
//  2. Add a key + require() here
//  3. Reference the key in a new theme entry below

const BACKGROUND_IMAGES = {
  leather: require("@/assets/navywaffle.webp") as ImageSourcePropType,
  // masters: require("@/assets/masters-green.webp") as ImageSourcePropType,
  // holiday: require("@/assets/holiday-dark.webp") as ImageSourcePropType,
} as const;

export type BackgroundKey = keyof typeof BACKGROUND_IMAGES;

export function getBackgroundImage(key: BackgroundKey): ImageSourcePropType {
  return BACKGROUND_IMAGES[key];
}

// ─── Theme definition ─────────────────────────────────────────────────────────

export interface AppTheme {
  /** Key into BACKGROUND_IMAGES */
  backgroundKey: BackgroundKey;
  /** rgba overlay on top of the background image */
  overlayColor: string;
  /** Color of the hairline rules in the header */
  headerRuleColor: string;
  /** Tagline text color */
  taglineColor: string;
  /** Tagline decoration dash color */
  taglineDashColor: string;
  /** Brand tile background */
  tileBg: string;
  /** Brand tile border */
  tileBorder: string;
  /** Brand tile label color */
  tileText: string;
  /** Tab bar + screen background */
  screenBg: string;
  /** Subtle border/divider color used on inner screens */
  dividerColor: string;
}

// ─── Themes ───────────────────────────────────────────────────────────────────

const DEFAULT: AppTheme = {
  backgroundKey: "leather",
  overlayColor: "rgba(0,0,0,0.62)",
  headerRuleColor: "rgba(255,255,255,0.14)",
  taglineColor: "rgba(255,255,255,0.38)",
  taglineDashColor: "rgba(255,255,255,0.20)",
  tileBg: "rgba(0,0,0,0.48)",
  tileBorder: "rgba(255,255,255,0.11)",
  tileText: "#e4e4e7",
  screenBg: "#09090b",
  dividerColor: "#27272a",
};

const MASTERS: AppTheme = {
  backgroundKey: "leather",          // swap to "masters" once asset exists
  overlayColor: "rgba(10,44,18,0.72)",
  headerRuleColor: "rgba(245,200,66,0.30)",
  taglineColor: "rgba(245,200,66,0.70)",
  taglineDashColor: "rgba(245,200,66,0.35)",
  tileBg: "rgba(0,26,10,0.55)",
  tileBorder: "rgba(245,200,66,0.22)",
  tileText: "#f5f5f5",
  screenBg: "#051a0b",
  dividerColor: "#1a3a20",
};

// ─── Active theme logic ────────────────────────────────────────────────────────

function isMastersWeek(): boolean {
  const now = new Date();
  // Masters Tournament: first full week of April (approx Apr 7–13)
  return now.getMonth() === 3 && now.getDate() >= 7 && now.getDate() <= 13;
}

export function getTheme(): AppTheme {
  if (isMastersWeek()) return MASTERS;
  return DEFAULT;
}
