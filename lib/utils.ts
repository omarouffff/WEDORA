import { BRAND } from "@/lib/brand";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function money(value: number) {
  return new Intl.NumberFormat(BRAND.locale, {
    style: "currency",
    currency: BRAND.currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(date: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", opts ?? { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

/** yyyy-mm-dd for <input type="date"> (UTC based, since DATE columns are stored at UTC midnight). */
export function toDateInput(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function appUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

/** Strips control chars and angle brackets from free text; React escapes the rest on render. */
export function sanitizeText(input: string) {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/[<>]/g, "").trim();
}

export function cleanQuery(q: string | undefined | null) {
  return (q ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}

/** Allows only http(s) and our own /uploads paths for user-supplied image URLs. */
export function isSafeImageUrl(url: string) {
  if (url.startsWith("/uploads/")) return !url.includes("..");
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function unsplash(id: string, w = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}
