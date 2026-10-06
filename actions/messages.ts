"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireActionCouple } from "@/lib/auth/guards";
import { parse, guarded, ok, fail } from "@/lib/action";
import { z } from "zod/v4";
import { requireActionVendor } from "@/lib/auth/guards";
import { notify } from "@/services/notifications";

const messageSchema = z.object({
  vendorId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000)
});

export const sendMessage = async (data: unknown) =>
  guarded(async () => {
    const { couple, user } = await requireActionCouple();
    const p = parse(messageSchema, data);
    if (!p.ok) return p.result;

    const vendor = await prisma.vendor.findUnique({ where: { id: p.data.vendorId }, select: { id: true, name: true, userId: true } });
    if (!vendor) return fail("Vendor not found.");
    let conversation = await prisma.conversation.findUnique({
      where: { coupleId_vendorId: { coupleId: couple.id, vendorId: p.data.vendorId } }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { coupleId: couple.id, vendorId: p.data.vendorId }
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.message.create({ data: { conversationId: conversation!.id, senderId: user.id, body: p.data.body } });
      await tx.conversation.update({ where: { id: conversation!.id }, data: { lastMessageAt: new Date() } });
      if (vendor.userId) await notify({ userId: vendor.userId, type: "NEW_MESSAGE", title: "New couple message", message: `${user.profile?.name ?? "A couple"} sent a message about their wedding.`, href: "/vendor/messages" }, tx);
    });

    revalidatePath("/dashboard/messages");
    revalidatePath("/vendor/messages");
    return ok();
  });

export const sendVendorMessage = async (input: unknown) =>
  guarded(async () => {
    const { vendor, user } = await requireActionVendor();
    const parsed = z.object({ conversationId: z.string().uuid(), body: z.string().trim().min(1).max(2000) }).safeParse(input);
    if (!parsed.success) return fail("Write a message of up to 2,000 characters.");
    const conversation = await prisma.conversation.findFirst({ where: { id: parsed.data.conversationId, vendorId: vendor.id }, select: { id: true, couple: { select: { userId: true } } } });
    if (!conversation) return fail("Conversation not found.");
    await prisma.$transaction(async (tx) => {
      await tx.message.create({ data: { conversationId: conversation.id, senderId: user.id, body: parsed.data.body } });
      await tx.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } });
      await notify({ userId: conversation.couple.userId, type: "NEW_MESSAGE", title: "New vendor message", message: `${vendor.name} sent you a message.`, href: "/dashboard/messages" }, tx);
    });
    revalidatePath("/vendor/messages");
    revalidatePath("/dashboard/messages");
    return ok();
  });
