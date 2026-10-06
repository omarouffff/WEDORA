import "server-only";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AuthError, ForbiddenError } from "@/lib/errors";
import { getCurrentUser, homeFor, type CurrentUser } from "@/lib/auth/session";

/* ───────────── For pages & layouts (redirect on failure) ───────────── */

export async function requirePageUser(roles: UserRole[], nextPath?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`);
  if (!roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}

export async function requirePageCouple(nextPath?: string) {
  const user = await requirePageUser(["COUPLE"], nextPath);
  return coupleContext(user);
}

export async function requirePageVendor(nextPath?: string) {
  const user = await requirePageUser(["VENDOR"], nextPath);
  if (!user.vendor) redirect("/login");
  return { user, vendor: user.vendor };
}

export async function requirePageAdmin(nextPath?: string) {
  return requirePageUser(["ADMIN"], nextPath);
}

/* ───────────── For server actions / route handlers (throw on failure) ───────────── */

export async function requireActionUser(roles: UserRole[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError();
  if (!roles.includes(user.role)) throw new ForbiddenError();
  return user;
}

export async function requireActionCouple() {
  return coupleContext(await requireActionUser(["COUPLE"]));
}

export async function requireActionVendor() {
  const user = await requireActionUser(["VENDOR"]);
  if (!user.vendor) throw new ForbiddenError("No vendor profile is linked to this account.");
  return { user, vendor: user.vendor };
}

export async function requireActionAdmin() {
  return requireActionUser(["ADMIN"]);
}

/**
 * Resolves the couple + wedding for a COUPLE user, creating missing rows so a
 * partially-provisioned account can never crash a dashboard page.
 * Every couple-scoped query MUST filter by `wedding.id` from here — never by an
 * id supplied by the client — which is what prevents IDOR.
 */
async function coupleContext(user: CurrentUser) {
  const couple =
    user.couple ??
    (await prisma.couple.create({ data: { userId: user.id }, include: { wedding: true } }));
  const wedding =
    couple.wedding ??
    (await prisma.wedding.create({
      data: { coupleId: couple.id, title: `${user.profile?.name ?? "Our"} Wedding` },
    }));
  return { user, couple, wedding };
}

export type CoupleContext = Awaited<ReturnType<typeof coupleContext>>;
