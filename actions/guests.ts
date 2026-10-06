"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireActionCouple } from "@/lib/auth/guards";
import { parse, guarded, ok } from "@/lib/action";
import { z } from "zod/v4";
import { RSVPStatus } from "@prisma/client";

const guestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().optional(),
  groupName: z.string().min(1),
});

export const addGuest = async (data: unknown) =>
  guarded(async () => {
    const { wedding } = await requireActionCouple();
    const p = parse(guestSchema, data);
    if (!p.ok) return p.result;

    let group = await prisma.guestGroup.findUnique({
      where: { weddingId_name: { weddingId: wedding.id, name: p.data.groupName } }
    });
    
    if (!group) {
      group = await prisma.guestGroup.create({
        data: { weddingId: wedding.id, name: p.data.groupName }
      });
    }

    let email = null;
    let phone = null;
    if (p.data.contact) {
      if (p.data.contact.includes("@")) email = p.data.contact;
      else phone = p.data.contact;
    }

    await prisma.guest.create({
      data: {
        weddingId: wedding.id,
        groupId: group.id,
        name: p.data.name,
        email,
        phone,
        status: "PENDING",
        partySize: 1
      }
    });

    revalidatePath("/dashboard/guests");
    return ok();
  });

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(RSVPStatus)
});

export const updateGuestStatus = async (data: unknown) =>
  guarded(async () => {
    const { wedding } = await requireActionCouple();
    const p = parse(updateStatusSchema, data);
    if (!p.ok) return p.result;
    
    const guest = await prisma.guest.findFirst({
      where: { id: p.data.id, weddingId: wedding.id }
    });
    
    if (!guest) throw new Error("Guest not found");

    await prisma.guest.update({
      where: { id: p.data.id },
      data: { status: p.data.status }
    });

    revalidatePath("/dashboard/guests");
    return ok();
  });

const idSchema = z.object({ id: z.string().uuid() });

export const deleteGuest = async (data: unknown) =>
  guarded(async () => {
    const { wedding } = await requireActionCouple();
    const p = parse(idSchema, data);
    if (!p.ok) return p.result;
    
    const guest = await prisma.guest.findFirst({
      where: { id: p.data.id, weddingId: wedding.id }
    });
    
    if (!guest) throw new Error("Guest not found");

    await prisma.guest.delete({
      where: { id: p.data.id }
    });

    revalidatePath("/dashboard/guests");
    return ok();
  });
