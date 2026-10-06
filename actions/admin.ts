"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { requireActionAdmin } from "@/lib/auth/guards";
import { guarded, ok, fail } from "@/lib/action";
import { notify } from "@/services/notifications";

export async function reviewVendor(input: unknown) {
  return guarded(async () => {
    await requireActionAdmin();
    const parsed = z.object({ vendorId: z.string().uuid(), decision: z.enum(["APPROVE", "REJECT"]) }).safeParse(input);
    if (!parsed.success) return fail("Choose a valid vendor decision.");
    const vendor = await prisma.vendor.findUnique({ where: { id: parsed.data.vendorId }, select: { userId: true, name: true } });
    if (!vendor) return fail("Vendor not found.");
    await prisma.$transaction(async (tx) => {
      await tx.vendor.update({ where: { id: parsed.data.vendorId }, data: { approved: parsed.data.decision === "APPROVE", verification: parsed.data.decision === "APPROVE" ? "VERIFIED" : "REJECTED" } });
      if (parsed.data.decision === "APPROVE" && vendor.userId) await notify({ userId: vendor.userId, type: "VENDOR_VERIFIED", title: "Your profile is verified", message: `${vendor.name} is now approved to appear in the marketplace.`, href: "/vendor" }, tx);
    });
    revalidatePath("/admin/vendors");
    revalidatePath("/vendors");
    return ok();
  });
}
