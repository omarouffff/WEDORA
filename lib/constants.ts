export const CITIES = ["Cairo", "Giza", "Alexandria"] as const;
export type City = (typeof CITIES)[number];

export const AREAS: Record<City, string[]> = {
  Cairo: ["Zamalek", "Maadi", "New Cairo", "Heliopolis", "Garden City", "Nasr City", "Downtown"],
  Giza: ["Sheikh Zayed", "6th of October", "Dokki", "Mohandessin", "Haram"],
  Alexandria: ["Stanley", "Montaza", "Smouha", "Sidi Gaber", "Miami"],
};

/** Vendor categories with their public routes (e.g. /photographers). */
export const VENDOR_CATEGORIES = [
  { name: "Venues", slug: "venues", route: "venues", tagline: "Gardens, ballrooms and Nile-side terraces." },
  { name: "Photography", slug: "photography", route: "photographers", tagline: "Storytellers who keep every moment." },
  { name: "Decoration", slug: "decoration", route: "decorators", tagline: "Spaces styled around your story." },
  { name: "Makeup", slug: "makeup", route: "makeup", tagline: "Bridal beauty that feels like you." },
  { name: "Catering", slug: "catering", route: "catering", tagline: "Menus your guests will talk about." },
  { name: "Flowers", slug: "flowers", route: "flowers", tagline: "Seasonal florals, thoughtfully arranged." },
  { name: "Dresses", slug: "dresses", route: "dresses", tagline: "Gowns and attire made to measure." },
  { name: "Music", slug: "music", route: "music", tagline: "Bands and DJs who read the room." },
  { name: "Transportation", slug: "transportation", route: "transportation", tagline: "Arrive in effortless style." },
] as const;

export const STYLES = [
  "Luxury",
  "Classic",
  "Modern",
  "Garden",
  "Rustic",
  "Romantic",
  "Minimal",
  "Traditional",
] as const;

export const TASK_CATEGORIES = [
  "Venue",
  "Catering",
  "Decoration",
  "Photography",
  "Music",
  "Dress",
  "Makeup",
  "Flowers",
  "Invitations",
  "Transportation",
  "Guests",
  "Honeymoon",
] as const;

export const BUDGET_CATEGORIES = [
  "Venue",
  "Catering",
  "Decoration",
  "Photography",
  "Music",
  "Dress",
  "Makeup",
  "Flowers",
  "Invitations",
  "Transportation",
  "Other",
] as const;

/** Default share of the total budget suggested per category (sums to 1). */
export const DEFAULT_BUDGET_SPLIT: Record<(typeof BUDGET_CATEGORIES)[number], number> = {
  Venue: 0.28,
  Catering: 0.25,
  Decoration: 0.08,
  Photography: 0.1,
  Music: 0.05,
  Dress: 0.08,
  Makeup: 0.03,
  Flowers: 0.04,
  Invitations: 0.02,
  Transportation: 0.02,
  Other: 0.05,
};

export const MEAL_PREFERENCES = ["No preference", "Vegetarian", "Vegan", "Halal", "Gluten-free", "Kids meal"] as const;

export const BLOG_CATEGORIES = [
  "Wedding Planning",
  "Venues",
  "Budget",
  "Photography",
  "Decoration",
  "Beauty",
  "Fashion",
  "Tips",
] as const;

export const WEBSITE_TEMPLATES = [
  { value: "CLASSIC_LUXURY", label: "Classic Luxury", blurb: "Timeless serif elegance with gold accents." },
  { value: "MODERN_MINIMAL", label: "Modern Minimal", blurb: "Clean lines, bold type, lots of air." },
  { value: "ROMANTIC_GARDEN", label: "Romantic Garden", blurb: "Soft botanical tones and gentle curves." },
] as const;

export const PAGE_SIZE = 9;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
