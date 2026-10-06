import "server-only";
import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/services/email";
import { notificationTemplate } from "@/emails/templates";

type Db = Prisma.TransactionClient | typeof prisma;

export type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string;
};

/** In-app notification only (safe to call inside a transaction). */
export function notify(input: NotifyInput, db: Db = prisma) {
  return db.notification.create({ data: input });
}

/**
 * In-app notification + best-effort email for important events.
 * Email failure never affects the caller.
 */
export async function notifyWithEmail(input: NotifyInput) {
  await notify(input);
  const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { email: true } });
  if (user) void sendEmail(notificationTemplate(user.email, input.title, input.message, input.href));
}
