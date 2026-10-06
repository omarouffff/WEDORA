"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireActionCouple } from "@/lib/auth/guards";
import { parse, guarded, ok } from "@/lib/action";
import { z } from "zod/v4";

const favoriteSchema = z.object({
  vendorId: z.string().uuid(),
});

export const toggleFavorite = async (data: unknown) =>
  guarded(async () => {
    const { couple } = await requireActionCouple();
    const p = parse(favoriteSchema, data);
    if (!p.ok) return p.result;
    
    const existing = await prisma.favoriteVendor.findUnique({
      where: { coupleId_vendorId: { coupleId: couple.id, vendorId: p.data.vendorId } }
    });
    
    if (existing) {
      await prisma.favoriteVendor.delete({
        where: { id: existing.id }
      });
    } else {
      await prisma.favoriteVendor.create({
        data: { coupleId: couple.id, vendorId: p.data.vendorId }
      });
    }

    revalidatePath("/dashboard/favorites");
    revalidatePath("/vendors");
    return ok({ isFavorited: !existing });
  });
