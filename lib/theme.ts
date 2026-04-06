export interface AppTheme {
  bg: string;
  headerBorder: string;
  tileBg: string;
  tileBorder: string;
  headerTitleFont: string;
  headerTitleColor: string;
  headerTitleSize: number;
  headerTitleLetterSpacing: number;
  taglineColor: string;
}

const DEFAULT: AppTheme = {
  bg: "#09090b",
  headerBorder: "#27272a",
  tileBg: "#111113",
  tileBorder: "#27272a",
  headerTitleFont: "CormorantGaramond_600SemiBold",
  headerTitleColor: "#f4f4f5",
  headerTitleSize: 26,
  headerTitleLetterSpacing: 3,
  taglineColor: "#52525b",
};

const MASTERS: AppTheme = {
  bg: "#1a5c2a",
  headerBorder: "#2d7a40",
  tileBg: "#144d22",
  tileBorder: "#2d7a40",
  headerTitleFont: "DancingScript_700Bold",
  headerTitleColor: "#ffffff",
  headerTitleSize: 36,
  headerTitleLetterSpacing: 1,
  taglineColor: "#f5c842",
};

function isMastersWeek(): boolean {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed, April = 3
  const day = now.getDate();
  // Masters Tournament: first full week of April (approx Apr 7–13)
  return month === 3 && day >= 7 && day <= 13;
}

export function getTheme(): AppTheme {
  return isMastersWeek() ? MASTERS : DEFAULT;
}
