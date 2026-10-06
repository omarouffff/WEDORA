import { jwtVerify, SignJWT } from "jose";

/** Edge-safe JWT helpers (used by middleware too). Never import server-only modules here. */

export const SESSION_COOKIE = "wedora_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionClaims = { sub: string; tv: number; role: "COUPLE" | "VENDOR" | "ADMIN" };

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters in production.");
    }
    return new TextEncoder().encode("dev-only-insecure-secret-do-not-use-in-production!!");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(claims: SessionClaims) {
  return new SignJWT({ tv: claims.tv, role: claims.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined | null): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.tv !== "number") return null;
    const role = payload.role;
    if (role !== "COUPLE" && role !== "VENDOR" && role !== "ADMIN") return null;
    return { sub: payload.sub, tv: payload.tv, role };
  } catch {
    return null;
  }
}
