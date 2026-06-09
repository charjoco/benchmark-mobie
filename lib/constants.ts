import type { AppCategory, AppColor } from "./types";

// Use the Mac's LAN IP so iOS Simulator can reach the Next.js backend.
// If you change networks, update this to match: ipconfig getifaddr en0
export const API_BASE_URL = "https://benchmark-backend-production.up.railway.app";

export const APP_COLOR_HEX: Record<AppColor, string> = {
  black:    "#1a1a1a",
  white:    "#f5f5f5",
  grey:     "#9ca3af",
  navy:     "#1e3a5f",
  blue:     "#3b82f6",
  teal:     "#14b8a6",
  green:    "#22c55e",
  olive:    "#6b7c3c",
  brown:    "#92400e",
  tan:      "#b5956b",
  beige:    "#d4b483",
  red:      "#ef4444",
  orange:   "#f97316",
  yellow:   "#eab308",
  purple:   "#a855f7",
  pink:     "#ec4899",
  burgundy: "#881337",
  multi:    "linear-gradient(135deg, #ef4444, #3b82f6, #22c55e)",
};

export type CategoryLabel = { key: AppCategory; label: string };

export const ALL_CATEGORIES: CategoryLabel[] = [
  { key: "jackets", label: "Jackets" },
  { key: "vests", label: "Vests" },
  { key: "polos", label: "Polos" },
  { key: "shirts", label: "Shirts" },
  { key: "longsleeve", label: "Long Sleeve" },
  { key: "hoodies", label: "Hoodies" },
  { key: "sweaters", label: "Sweaters" },
  { key: "zips", label: "Zips" },
  { key: "shorts", label: "Shorts" },
  { key: "pants", label: "Pants" },
  { key: "denim", label: "Denim" },
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
  { key: "ten-thousand", label: "Ten Thousand" },
  { key: "faherty", label: "Faherty" },
  { key: "holderness-bourne", label: "Holderness & Bourne" },
  { key: "linksoul", label: "Linksoul" },
  { key: "paka", label: "Paka" },
  { key: "taylor-stitch", label: "Taylor Stitch" },
  { key: "travis-mathew", label: "TravisMathew" },
  { key: "greyson", label: "Greyson" },
  { key: "johnnie-o", label: "Johnnie-O" },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export const TOP_SIZES    = ["XS", "S", "M", "L", "XL", "XXL"];
export const BOTTOM_SIZES = ["28", "29", "30", "31", "32", "33", "34", "36", "38", "40"];

export const STYLE_LEAN_OPTIONS: { key: string; label: string; description: string }[] = [
  { key: "performance",     label: "Performance",     description: "Training gear, technical fabrics, gym-to-street" },
  { key: "elevated-basics", label: "Elevated Basics", description: "Quality essentials, clean lines, everyday wear" },
  { key: "smart-casual",    label: "Smart Casual",    description: "Office-friendly, polished but comfortable" },
  { key: "golf",            label: "Golf",            description: "Course-ready, clubhouse to dinner" },
];

export const PRICE_COMFORT_OPTIONS: { key: string; label: string; description: string }[] = [
  { key: "under-75",  label: "Under $75", description: "Value-focused, great quality at fair prices" },
  { key: "75-150",    label: "$75–$150",  description: "Premium quality, the sweet spot for most brands" },
  { key: "150-plus",  label: "$150+",     description: "Best of the best, no compromise" },
];

export const APP_COLORS: AppColor[] = [
  "black",
  "white",
  "grey",
  "navy",
  "blue",
  "teal",
  "green",
  "olive",
  "brown",
  "tan",
  "beige",
  "red",
  "orange",
  "yellow",
  "purple",
  "pink",
  "burgundy",
];

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "lastSeenAt", label: "Latest" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];
