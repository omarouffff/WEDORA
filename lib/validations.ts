import { z } from "zod/v4";
import {
  BLOG_CATEGORIES,
  BUDGET_CATEGORIES,
  CITIES,
  MEAL_PREFERENCES,
  STYLES,
  TASK_CATEGORIES,
} from "@/lib/constants";
import { isSafeImageUrl, sanitizeText } from "@/lib/utils";

// ───────── helpers ─────────

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const text = (min = 1, max = 200) =>
  z
    .string({ error: "This field is required" })
    .transform(sanitizeText)
    .pipe(z.string().min(min, min > 0 ? "This field is required" : undefined).max(max, `Keep this under ${max} characters`));

const optionalText = (max = 500) =>
  z.preprocess(emptyToUndefined, z.string().transform(sanitizeText).pipe(z.string().max(max, `Keep this under ${max} characters`)).optional());

const money = (max = 1_000_000_000) =>
  z.coerce
    .number({ error: "Enter a valid amount" })
    .finite("Enter a valid amount")
    .min(0, "Amount can't be negative")
    .max(max, "That amount is too large");

const positiveMoney = (max = 1_000_000_000) =>
  z.coerce
    .number({ error: "Enter a valid amount" })
    .finite("Enter a valid amount")
    .gt(0, "Amount must be greater than zero")
    .max(max, "That amount is too large");

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date")
  .refine((s) => !Number.isNaN(new Date(s).getTime()), "Choose a valid date")
  .transform((s) => new Date(`${s}T00:00:00.000Z`));

const optionalDate = z.preprocess(emptyToUndefined, isoDate.optional());
const id = z.string().uuid("Invalid identifier");
const imageUrl = z
  .string()
  .max(500)
  .refine(isSafeImageUrl, "Use an https image link or upload a file");
const optionalImage = z.preprocess(emptyToUndefined, imageUrl.optional());

const email = z
  .string({ error: "Enter your email" })
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(254);

const password = z
  .string({ error: "Enter a password" })
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .refine((p) => /[a-zA-Z]/.test(p) && /\d/.test(p), "Include at least one letter and one number");

const egPhone = z
  .string()
  .trim()
  .regex(/^[+\d][\d\s\-()]{6,19}$/, "Enter a valid phone number");

// ───────── auth ─────────

export const registerSchema = z
  .object({
    name: text(2, 80),
    email,
    password,
    role: z.enum(["COUPLE", "VENDOR"], { error: "Choose what you're planning" }),
    businessName: optionalText(100),
    category: optionalText(40),
    city: optionalText(40),
  })
  .superRefine((v, ctx) => {
    if (v.role === "VENDOR") {
      if (!v.businessName) ctx.addIssue({ code: "custom", path: ["businessName"], message: "Enter your business name" });
      if (!v.category) ctx.addIssue({ code: "custom", path: ["category"], message: "Choose a category" });
      if (!v.city || !(CITIES as readonly string[]).includes(v.city))
        ctx.addIssue({ code: "custom", path: ["city"], message: "Choose a city" });
    }
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(200),
});

export const forgotSchema = z.object({ email });

export const resetSchema = z.object({
  token: z.string().min(20).max(200),
  password,
});

// ───────── planner ─────────

export const taskSchema = z.object({
  title: text(1, 120),
  notes: optionalText(500),
  category: z.enum(TASK_CATEGORIES, { error: "Choose a category" }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  dueDate: optionalDate,
});

// ───────── wedding details ─────────

export const weddingSchema = z.object({
  title: text(1, 80),
  partnerName: optionalText(80),
  date: optionalDate,
  city: z.preprocess(emptyToUndefined, z.enum(CITIES).optional()),
  guestCount: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(5000).optional()),
  style: z.preprocess(emptyToUndefined, z.enum(STYLES).optional()),
  venuePreference: optionalText(80),
});

// ───────── budget ─────────

export const budgetTotalSchema = z.object({ total: money() });

export const categoryPlanSchema = z.object({
  name: z.enum(BUDGET_CATEGORIES),
  planned: money(),
});

export const expenseSchema = z.object({
  title: text(1, 120),
  categoryName: z.enum(BUDGET_CATEGORIES, { error: "Choose a category" }),
  amount: positiveMoney(),
  note: optionalText(300),
  spentAt: z.preprocess(emptyToUndefined, isoDate.optional()),
});

// ───────── guests ─────────

export const guestSchema = z.object({
  name: text(1, 100),
  phone: z.preprocess(emptyToUndefined, egPhone.optional()),
  email: z.preprocess(emptyToUndefined, email.optional()),
  group: optionalText(40),
  partySize: z.coerce.number().int().min(1, "At least 1").max(20, "Up to 20 per invitation").default(1),
  status: z.enum(["PENDING", "CONFIRMED", "DECLINED"]).default("PENDING"),
  mealPreference: z.preprocess(emptyToUndefined, z.enum(MEAL_PREFERENCES).optional()),
  notes: optionalText(300),
});

export const guestImportSchema = z.object({
  csv: z.string().min(1, "Paste at least one row").max(200_000),
});

// ───────── RSVP ─────────

export const rsvpSchema = z
  .object({
    slug: z.string().min(1).max(80),
    name: text(2, 100),
    contact: z.string().trim().min(1, "Enter a phone number or email").max(120),
    attendance: z.enum(["CONFIRMED", "DECLINED"], { error: "Please let us know if you can come" }),
    partySize: z.coerce.number().int().min(0).max(10, "Up to 10 guests").default(1),
    mealPreference: z.preprocess(emptyToUndefined, z.enum(MEAL_PREFERENCES).optional()),
    message: optionalText(500),
    /** Honeypot: real users never fill this. */
    website: z.string().max(0).optional(),
  })
  .superRefine((v, ctx) => {
    const isEmail = v.contact.includes("@");
    const ok = isEmail ? z.string().email().safeParse(v.contact).success : egPhone.safeParse(v.contact).success;
    if (!ok) ctx.addIssue({ code: "custom", path: ["contact"], message: "Enter a valid phone number or email" });
    if (v.attendance === "CONFIRMED" && v.partySize < 1)
      ctx.addIssue({ code: "custom", path: ["partySize"], message: "At least 1 guest if you're coming" });
  });

// ───────── website ─────────

export const websiteSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Use at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  template: z.enum(["CLASSIC_LUXURY", "MODERN_MINIMAL", "ROMANTIC_GARDEN"]),
  headline: optionalText(120),
  story: optionalText(3000),
  heroImage: optionalImage,
  gallery: z.array(imageUrl).max(12).default([]),
  venueName: optionalText(120),
  venueAddress: optionalText(200),
  dressCode: optionalText(120),
  contactEmail: z.preprocess(emptyToUndefined, email.optional()),
  contactPhone: z.preprocess(emptyToUndefined, egPhone.optional()),
  rsvpEnabled: z.boolean().default(true),
  published: z.boolean().default(false),
  schedule: z
    .array(z.object({ time: text(1, 20), title: text(1, 80), description: optionalText(200) }))
    .max(12)
    .default([]),
});

// ───────── bookings / reviews / messages ─────────

export const bookingRequestSchema = z.object({
  vendorId: id,
  serviceId: z.preprocess(emptyToUndefined, id.optional()),
  packageId: z.preprocess(emptyToUndefined, id.optional()),
  eventDate: isoDate,
  notes: optionalText(1000),
});

export const bookingDecisionSchema = z.object({
  bookingId: id,
  note: optionalText(500),
});

export const reviewSchema = z.object({
  bookingId: id,
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  comment: optionalText(1500),
  photos: z.array(imageUrl).max(4).default([]),
});

export const messageSchema = z.object({
  conversationId: id,
  body: text(1, 2000),
});

// ───────── vendor management ─────────

export const vendorProfileSchema = z.object({
  name: text(2, 100),
  description: text(20, 3000),
  city: z.enum(CITIES, { error: "Choose a city" }),
  area: optionalText(60),
  address: optionalText(200),
  startingPrice: money(),
  capacity: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(10000).optional()),
  styles: z.array(z.enum(STYLES)).max(6).default([]),
  phone: z.preprocess(emptyToUndefined, egPhone.optional()),
  email: z.preprocess(emptyToUndefined, email.optional()),
  instagram: optionalText(60),
  imageUrl: optionalImage,
  coverUrl: optionalImage,
});

export const serviceSchema = z.object({
  name: text(2, 100),
  description: optionalText(300),
  price: positiveMoney(),
});

export const packageSchema = z.object({
  name: text(2, 100),
  description: optionalText(300),
  price: positiveMoney(),
  features: z.array(text(1, 100)).max(10).default([]),
});

export const portfolioSchema = z.object({
  imageUrl,
  caption: optionalText(120),
});

export const availabilitySchema = z.object({
  date: isoDate,
  available: z.boolean(),
});

// ───────── AI ─────────

export const aiPlanSchema = z.object({
  date: optionalDate,
  budget: positiveMoney(),
  guestCount: z.coerce.number().int().min(1, "At least 1 guest").max(5000),
  city: z.enum(CITIES, { error: "Choose a city" }),
  style: z.enum(STYLES, { error: "Choose a style" }),
  venuePreference: optionalText(80),
  priorities: z.array(z.enum(TASK_CATEGORIES)).max(5).default([]),
});

// ───────── content & admin ─────────

export const contactSchema = z.object({
  name: text(2, 80),
  email,
  subject: text(3, 120),
  message: text(10, 2000),
  website: z.string().max(0).optional(),
});

export const blogPostSchema = z.object({
  title: text(3, 140),
  slug: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens")
      .max(80)
      .optional(),
  ),
  excerpt: text(10, 300),
  content: text(50, 20000),
  coverImage: optionalImage,
  category: z.enum(BLOG_CATEGORIES),
  authorName: text(2, 60).default("The WEDORA Team"),
  published: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: text(2, 40),
  tagline: optionalText(120),
});

export const settingsSchema = z.object({
  siteName: text(2, 40),
  supportEmail: email,
  maintenanceBanner: optionalText(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type GuestInput = z.infer<typeof guestSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type WebsiteInput = z.infer<typeof websiteSchema>;
export type AiPlanInput = z.infer<typeof aiPlanSchema>;
