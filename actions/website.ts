"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireActionCouple } from "@/lib/auth/guards";
import { parse, guarded, ok } from "@/lib/action";
import { z } from "zod/v4";

const websiteSchema = z.object({
  slug: z.string().trim().toLowerCase().min(3).max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  story: z.string().optional(),
  template: z.enum(["CLASSIC_LUXURY", "MODERN_MINIMAL", "ROMANTIC_GARDEN"]),
  names: z.string().optional(),
  date: z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  published: z.boolean().default(false),
});

export const saveWebsite = async (data: unknown) =>
  guarded(async () => {
    const { wedding, couple } = await requireActionCouple();
    const p = parse(websiteSchema, data);
    if (!p.ok) return p.result;

    const existingSlug = await prisma.weddingWebsite.findFirst({
      where: { slug: p.data.slug, weddingId: { not: wedding.id } }
    });
    
    if (existingSlug) throw new Error("That website address is already taken.");

    let website = await prisma.weddingWebsite.findUnique({
      where: { weddingId: wedding.id }
    });
    
    if (!website) {
      website = await prisma.weddingWebsite.create({
        data: {
          weddingId: wedding.id,
          slug: p.data.slug,
          template: p.data.template,
          story: p.data.story,
          published: p.data.published,
        }
      });
    } else {
      website = await prisma.weddingWebsite.update({
        where: { id: website.id },
        data: {
          slug: p.data.slug,
          template: p.data.template,
          story: p.data.story,
          published: p.data.published,
        }
      });
    }

    // Update couple names and wedding date if provided
    if (p.data.names) {
      await prisma.couple.update({
        where: { id: couple.id },
        data: { partnerName: p.data.names } // Or parse names and split
      });
    }
    
    if (p.data.date) {
      await prisma.wedding.update({
        where: { id: wedding.id },
        data: { date: new Date(p.data.date) }
      });
    }

    revalidatePath("/dashboard/website");
    return ok();
  });
