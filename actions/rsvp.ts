"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { contactKey } from "@/lib/calculations";
import { parse, guarded, ok, fail } from "@/lib/action";
import { rsvpSchema } from "@/lib/validations";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Public endpoint is implemented as a server action: guests never get database access. */
export async function submitRsvp(input: unknown) {
  return guarded(async () => {
    const parsed = parse(rsvpSchema, input);
    if (!parsed.ok) return parsed.result;
    const data = parsed.data;
    const limit = rateLimit(`rsvp:${await clientIp()}:${data.slug}`, 8, 10 * 60 * 1000);
    if (!limit.ok) return fail("Too many replies from this connection. Please try again later.");

    const website = await prisma.weddingWebsite.findUnique({
      where: { slug: data.slug },
      include: { wedding: { include: { couple: { select: { userId: true } } } } },
    });
    if (!website?.published || !website.rsvpEnabled) return fail("RSVPs are not available for this wedding website.");

    const key = contactKey(data.contact);
    const result = await prisma.$transaction(async (tx) => {
      const guest = await tx.guest.findFirst({ where: { weddingId: website.weddingId, contactKey: key } });
      const rsvp = await tx.rSVP.upsert({
        where: { websiteId_contactKey: { websiteId: website.id, contactKey: key } },
        create: {
          websiteId: website.id, guestId: guest?.id, name: data.name, contact: data.contact,
          contactKey: key, attendance: data.attendance, partySize: data.partySize,
          mealPreference: data.mealPreference, message: data.message,
        },
        update: {
          guestId: guest?.id, name: data.name, contact: data.contact,
          attendance: data.attendance, partySize: data.partySize,
          mealPreference: data.mealPreference, message: data.message,
        },
      });
      if (guest) {
        await tx.guest.update({
          where: { id: guest.id },
          data: { name: data.name, status: data.attendance, partySize: data.partySize, mealPreference: data.mealPreference },
        });
      }
      await tx.notification.create({
        data: {
          userId: website.wedding.couple.userId,
          type: "RSVP_RECEIVED",
          title: "A guest replied",
          message: `${data.name} ${data.attendance === "CONFIRMED" ? "will be there" : "can't make it"}.`,
          href: "/dashboard/guests",
        },
      });
      return rsvp;
    });

    revalidatePath(`/w/${website.slug}`);
    revalidatePath("/dashboard/guests");
    return ok({ received: Boolean(result.id) }, "Thank you — your reply has been recorded.");
  });
}
