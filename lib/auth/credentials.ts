import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { TokenType } from "@prisma/client";

const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string | null | undefined) {
  // Always run a comparison so response time doesn't reveal whether the email exists.
  const target = hash ?? "$2a$12$C6UzMDM.H6dfI/f/IKcEeO5xk1KcX7Cq2s0D8mJp2m0yJmKQ0pGa6";
  const ok = await bcrypt.compare(plain, target);
  return !!hash && ok;
}

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

const TTL_MS: Record<TokenType, number> = {
  EMAIL_VERIFY: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
};

/** Creates a single-use token; returns the raw value (only ever emailed, never stored). */
export async function issueToken(userId: string, type: TokenType) {
  const raw = randomBytes(32).toString("base64url");
  await prisma.authToken.updateMany({
    where: { userId, type, usedAt: null },
    data: { usedAt: new Date() },
  });
  await prisma.authToken.create({
    data: { userId, type, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + TTL_MS[type]) },
  });
  return raw;
}

/** Validates and consumes a token atomically. Returns the user id or null. */
export async function consumeToken(raw: string, type: TokenType) {
  const tokenHash = sha256(raw);
  const record = await prisma.authToken.findUnique({ where: { tokenHash } });
  if (!record || record.type !== type || record.usedAt || record.expiresAt.getTime() < Date.now()) return null;
  const claimed = await prisma.authToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  return claimed.count === 1 ? record.userId : null;
}

/** Non-consuming check, so the reset page can tell users early that a link is dead. */
export async function peekToken(raw: string, type: TokenType) {
  const record = await prisma.authToken.findUnique({ where: { tokenHash: sha256(raw) } });
  return !!record && record.type === type && !record.usedAt && record.expiresAt.getTime() > Date.now();
}
