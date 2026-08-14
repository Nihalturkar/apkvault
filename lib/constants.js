/** App categories — used in admin forms and public filter chips */
export const APP_CATEGORIES = [
  "Communication",
  "Education",
  "Entertainment",
  "Finance",
  "Games",
  "Health & Fitness",
  "Music & Audio",
  "Photography",
  "Productivity",
  "Social",
  "Tools",
  "Travel",
];

/** Admin UID — hardcoded allowlist for Firestore/Storage rules */
export const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || "";
