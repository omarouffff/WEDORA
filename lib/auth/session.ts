import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "@/lib/auth/jwt";

export const homeFor = (role: UserRole) =>
  role === "ADMIN" ? "/admin" : role === "VENDOR" ? "/vendor" : "/dashboard";

export async function setSessionCookie(user: { id: string; role: UserRole; tokenVersion: number }) {
  const token = await signSession({ sub: user.id, tv: user.tokenVersion, role: user.role });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * The authoritative identity for a request. The role comes from the DATABASE,
 * never from the cookie, so a stale/forged claim can't elevate privileges.
 * Memoised per request via React cache().
 */
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const claims = await verifySession(token);
  if (!claims) return null;
  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    include: {
      profile: true,
      couple: { include: { wedding: true } },
      vendor: true,
    },
  });
  if (!user || user.suspended || user.tokenVersion !== claims.tv) return null;
  return user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
