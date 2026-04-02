import type { AppCategory, ColorBucket } from "./types";

// Use the Mac's LAN IP so iOS Simulator can reach the Next.js backend.
// If you change networks, update this to match: ipconfig getifaddr en0
export const API_BASE_URL = "https://benchmark-backend-production.up.railway.app";

export const COLOR_BUCKET_HEX: Record<ColorBucket, string> = {
  Black: "#1a1a1a",
  White: "#f5f5f5",
  Grey: "#9ca3af",
  Navy: "#1e3a5f",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Brown: "#92400e",
  Red: "#ef4444",
  Orange: "#f97316",
  Yellow: "#eab308",
  Purple: "#a855f7",
  Pink: "#ec4899",
  Multi: "linear-gradient(135deg, #ef4444, #3b82f6, #22c55e)",
  Other: "#6b7280",
};

export type CategoryLabel = { key: AppCategory; label: string };

export const ALL_CATEGORIES: CategoryLabel[] = [
  { key: "jackets", label: "Jackets" },
  { key: "shirts", label: "Shirts" },
  { key: "longsleeve", label: "Long Sleeve" },
  { key: "hoodies", label: "Hoodies" },
  { key: "sweaters", label: "Sweaters" },
  { key: "zips", label: "Zips" },
  { key: "shorts", label: "Shorts" },
  { key: "pants", label: "Pants" },
];

export const BRANDS: { key: string; label: string }[] = [
  { key: "bylt", label: "BYLT" },
  { key: "asrv", label: "ASRV" },
  { key: "buck-mason", label: "Buck Mason" },
  { key: "reigning-champ", label: "Reigning Champ" },
  { key: "todd-snyder", label: "Todd Snyder" },
  { key: "rhone", label: "Rhone" },
  { key: "mack-weldon", label: "Mack Weldon" },
  { key: "vuori", label: "Vuori" },
  { key: "public-rec", label: "Public Rec" },
  { key: "lululemon", label: "Lululemon" },
  { key: "ten-thousand", label: "Ten Thousand" },
  { key: "holderness-bourne", label: "Holderness & Bourne" },
  { key: "linksoul", label: "Linksoul" },
  { key: "paka", label: "Paka" },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export const COLOR_BUCKETS: ColorBucket[] = [
  "Black",
  "White",
  "Grey",
  "Navy",
  "Blue",
  "Green",
  "Brown",
  "Red",
  "Orange",
  "Yellow",
  "Purple",
  "Pink",
];

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "lastSeenAt", label: "Latest" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];
