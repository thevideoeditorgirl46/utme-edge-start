/** Shared brand media paths. */
export const BRAND_ASSETS = {
  logo: "/assets/newton-edge-logo.jpg",
  flyer: "/__l5e/assets-v1/3609abaa-918b-4a6d-8681-8319ec4d866c/foundational-flyer-v3.png",
} as const;

export const BRAND = {
  name: "Newton Edge Tutorial",
  shortName: "NET",
  tagline: "Foundational Class for UTME Candidates",
} as const;

export const SUBJECT_OPTIONS = [
  "Use of English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
] as const;

export const CHALLENGE_OPTIONS = [
  "Understanding concepts",
  "Speed and time management",
  "Calculations",
  "Consistency / staying motivated",
  "Exam anxiety",
  "Not knowing what to read",
  "Past questions practice",
] as const;

export const REFERRAL_OPTIONS = [
  "WhatsApp status or group",
  "A friend or classmate",
  "Telegram",
  "Facebook",
  "Instagram / TikTok",
  "X (Twitter)",
  "A past NET student",
  "School / teacher",
  "Other",
] as const;

export const UTME_YEAR_OPTIONS = ["2027", "2028", "Undecided"] as const;
