"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireActionCouple } from "@/lib/auth/guards";
import { parse, guarded, ok, fail } from "@/lib/action";
import { bookingRequestSchema } from "@/lib/validations";
import { notify } from "@/services/notifications";
import { authorizeBookingTransition, type BookingState } from "@/lib/calculations";
import { requireActionVendor } from "@/lib/auth/guards";
import { z } from "zod/v4";

export const requestBooking = async (input: unknown) =>
  guarded(async () => {
    const { wedding, user } = await requireActionCouple();
    const parsed = parse(bookingRequestSchema, input);
    if (!parsed.ok) return parsed.result;
    const data = parsed.data;
    if (data.eventDate < new Date(new Date().toISOString().slice(0, 10))) return fail("Choose a date from today onward.");

    const vendor = await prisma.vendor.findFirst({
      where: { id: data.vendorId, approved: true },
      include: { user: { select: { id: true } }, services: true, packages: true },
    });
    if (!vendor) return fail("This vendor is not currently accepting requests.");
    const service = data.serviceId ? vendor.services.find((item) => item.id === data.serviceId) : undefined;
    const pkg = data.packageId ? vendor.packages.find((item) => item.id === data.packageId) : undefined;
    if ((data.serviceId && !service) || (data.packageId && !pkg)) return fail("Choose a service or package from this vendor.");

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.vendorBooking.create({ data: {
        weddingId: wedding.id, vendorId: vendor.id, serviceId: service?.id, packageId: pkg?.id,
        serviceName: service?.name, packageName: pkg?.name, eventDate: data.eventDate,
        notes: data.notes, totalPrice: pkg?.price ?? service?.price, status: "PENDING",
      } });
      if (vendor.user) await notify({ userId: vendor.user.id, type: "BOOKING_REQUESTED", title: "New booking request", message: `${user.profile?.name ?? "A couple"} asked about ${data.eventDate.toLocaleDateString("en-EG")}.`, href: "/vendor" }, tx);
      return created;
    });
    revalidatePath("/dashboard/bookings");
    revalidatePath("/vendor");
    return ok({ id: booking.id });
  });

export const decideBooking = async (input: unknown) =>
  guarded(async () => {
    const { vendor } = await requireActionVendor();
    const decision = z.object({ bookingId: z.string().uuid(), status: z.enum(["CONFIRMED", "REJECTED", "COMPLETED", "CANCELLED"]), note: z.string().max(500).optional() }).safeParse(input);
    if (!decision.success) return fail("Choose a valid booking update.");
    const booking = await prisma.vendorBooking.findFirst({ where: { id: decision.data.bookingId, vendorId: vendor.id }, include: { wedding: { include: { couple: { select: { userId: true } } } } } });
    if (!booking) return fail("Booking not found.");
    const status = authorizeBookingTransition({ from: booking.status as BookingState, to: decision.data.status, actor: "VENDOR", eventDate: booking.eventDate });
    await prisma.$transaction(async (tx) => {
      await tx.vendorBooking.update({ where: { id: booking.id }, data: { status, vendorNote: decision.data.note } });
      const type = status === "CONFIRMED" ? "BOOKING_CONFIRMED" : status === "REJECTED" ? "BOOKING_REJECTED" : status === "COMPLETED" ? "BOOKING_COMPLETED" : "BOOKING_CANCELLED";
      await notify({ userId: booking.wedding.couple.userId, type, title: `Booking ${status.toLowerCase()}`, message: `${vendor.name} updated your booking request.`, href: "/dashboard/bookings" }, tx);
    });
    revalidatePath("/vendor");
    revalidatePath("/vendor/bookings");
    revalidatePath("/dashboard/bookings");
    return ok();
  });
