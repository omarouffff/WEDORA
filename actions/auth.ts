"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fail, guarded, ok, parse } from "@/lib/action";
import { forgotSchema, loginSchema, registerSchema, resetSchema } from "@/lib/validations";
import { consumeToken, hashPassword, issueToken, verifyPassword } from "@/lib/auth/credentials";
import { clearSessionCookie, getCurrentUser, homeFor, setSessionCookie } from "@/lib/auth/session";
import { limitByIp } from "@/lib/rate-limit";
import { sendEmail } from "@/services/email";
import { resetPasswordTemplate, verifyEmailTemplate } from "@/emails/templates";
import { slugify } from "@/lib/utils";
import { VENDOR_CATEGORIES } from "@/lib/constants";

/** Only same-site relative paths are allowed as post-login targets (prevents open redirects). */
function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : null;
}

async function uniqueVendorSlug(name: string) {
  const base = slugify(name) || "vendor";
  let slug = base;
  for (let i = 2; await prisma.vendor.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${base}-${i}`;
  return slug;
}

export async function registerAction(input: unknown) {
  return guarded(async () => {
    const limited = await limitByIp("register", 8, 60 * 60 * 1000);
    if (limited) return fail(limited);

    const parsed = parse(registerSchema, input);
    if (!parsed.ok) return parsed.result;
    const data = parsed.data;

    // `role` is restricted to COUPLE | VENDOR by the schema: ADMIN can never be self-assigned.
    const existing = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
    if (existing) return fail("An account with this email already exists.", { email: "This email is already registered" });

    const passwordHash = await hashPassword(data.password);
    let categoryId: string | undefined;
    if (data.role === "VENDOR") {
      const meta = VENDOR_CATEGORIES.find((c) => c.name === data.category);
      const category = meta && (await prisma.vendorCategory.findUnique({ where: { slug: meta.slug } }));
      if (!category) return fail("Choose a valid category.", { category: "Choose a valid category" });
      categoryId = category.id;
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        profile: { create: { name: data.name } },
        ...(data.role === "COUPLE"
          ? { couple: { create: { wedding: { create: { title: `${data.name.split(" ")[0]}'s Wedding` } } } } }
          : {
              vendor: {
                create: {
                  name: data.businessName!,
                  slug: await uniqueVendorSlug(data.businessName!),
                  city: data.city!,
                  categoryId: categoryId!,
                  description: "",
                  startingPrice: 0,
                  email: data.email,
                },
              },
            }),
      },
    });

    const token = await issueToken(user.id, "EMAIL_VERIFY");
    void sendEmail(verifyEmailTemplate(user.email, data.name, token));
    await setSessionCookie(user);
    redirect(homeFor(user.role));
  });
}

export async function loginAction(input: unknown, next?: string) {
  return guarded(async () => {
    const parsed = parse(loginSchema, input);
    if (!parsed.ok) return parsed.result;
    const { email, password } = parsed.data;

    const limited = await limitByIp("login", 10, 15 * 60 * 1000, email);
    if (limited) return fail(limited);

    const user = await prisma.user.findUnique({ where: { email } });
    const valid = await verifyPassword(password, user?.passwordHash);
    // One generic message for unknown email / wrong password / suspended: no account enumeration.
    if (!user || !valid || user.suspended) return fail("Incorrect email or password.");

    await setSessionCookie(user);
    redirect(safeNext(next) ?? homeFor(user.role));
  });
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export async function forgotPasswordAction(input: unknown) {
  return guarded(async () => {
    const limited = await limitByIp("forgot", 5, 60 * 60 * 1000);
    if (limited) return fail(limited);
    const parsed = parse(forgotSchema, input);
    if (!parsed.ok) return parsed.result;

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user && !user.suspended) {
      const token = await issueToken(user.id, "PASSWORD_RESET");
      void sendEmail(resetPasswordTemplate(user.email, token));
    }
    // Same response whether or not the account exists.
    return ok(undefined, "If an account exists for that email, a reset link is on its way.");
  });
}

export async function resetPasswordAction(input: unknown) {
  return guarded(async () => {
    const limited = await limitByIp("reset", 10, 60 * 60 * 1000);
    if (limited) return fail(limited);
    const parsed = parse(resetSchema, input);
    if (!parsed.ok) return parsed.result;

    const userId = await consumeToken(parsed.data.token, "PASSWORD_RESET");
    if (!userId) return fail("This reset link is invalid or has expired. Please request a new one.");

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await hashPassword(parsed.data.password),
        // Invalidates every existing session for this account.
        tokenVersion: { increment: 1 },
      },
    });
    redirect("/login?reset=1");
  });
}

export async function verifyEmailAction(token: string) {
  return guarded(async () => {
    if (typeof token !== "string" || token.length < 20) return fail("This confirmation link is invalid.");
    const userId = await consumeToken(token, "EMAIL_VERIFY");
    if (!userId) return fail("This confirmation link is invalid or has expired.");
    await prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
    return ok(undefined, "Your email is confirmed. Thank you!");
  });
}

export async function resendVerificationAction() {
  return guarded(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("Please sign in first.");
    if (user.emailVerifiedAt) return ok(undefined, "Your email is already confirmed.");
    const limited = await limitByIp("resend-verify", 3, 60 * 60 * 1000, user.id);
    if (limited) return fail(limited);
    const token = await issueToken(user.id, "EMAIL_VERIFY");
    void sendEmail(verifyEmailTemplate(user.email, user.profile?.name ?? "there", token));
    return ok(undefined, "We've sent you a new confirmation email.");
  });
}
