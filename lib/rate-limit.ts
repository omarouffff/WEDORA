import "server-only";
import { headers } from "next/headers";

/**
 * In-memory sliding-window rate limiter.
 * Architecture note: this is per-instance. For multi-instance production, swap
 * `store` for Redis/Upstash while keeping the same `rateLimit()` signature.
 */
const store = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    store.set(key, hits);
    return { ok: false as const, retryAfterSec: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  store.set(key, hits);
  if (store.size > 5000) {
    for (const [k, v] of store) if (!v.some((t) => now - t < windowMs)) store.delete(k);
  }
  return { ok: true as const, retryAfterSec: 0 };
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/** Convenience: rate limit by IP + scope. Returns an error message or null. */
export async function limitByIp(scope: string, limit: number, windowMs: number, extra = "") {
  const ip = await clientIp();
  const res = rateLimit(`${scope}:${ip}:${extra}`, limit, windowMs);
  return res.ok ? null : `Too many attempts. Please try again in ${Math.max(1, Math.ceil(res.retryAfterSec / 60))} minute(s).`;
}
