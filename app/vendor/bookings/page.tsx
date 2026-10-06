import { prisma } from "@/lib/prisma";
import { requirePageVendor } from "@/lib/auth/guards";
import { VendorBookingActions } from "@/components/vendor-booking-actions";

export default async function VendorBookingsPage() {
  const { vendor } = await requirePageVendor();
  const bookings = await prisma.vendorBooking.findMany({
    where: { vendorId: vendor.id },
    include: { wedding: { include: { couple: { include: { user: { include: { profile: true } } } } } } },
    orderBy: [{ status: "asc" }, { eventDate: "asc" }],
  });
  return <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">
    <p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">Your business</p>
    <h1 className="serif mt-2 text-4xl">Booking requests</h1>
    <p className="mt-2 text-[#817970]">Review incoming requests and keep each couple updated.</p>
    <div className="mt-8 space-y-4">{bookings.length ? bookings.map((booking) => <article key={booking.id} className="rounded-2xl border border-[#e9e4de] bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="font-medium">{booking.wedding.couple.user.profile?.name ?? "Couple"}</h2><p className="mt-1 text-sm text-[#817970]">{booking.eventDate.toLocaleDateString("en-EG")} · {booking.serviceName ?? booking.packageName ?? "Wedding service"}</p></div>
        <span className="rounded-full bg-[#f4f0eb] px-3 py-1 text-sm">{booking.status.toLowerCase()}</span>
      </div>
      {booking.notes && <p className="mt-4 text-sm">{booking.notes}</p>}
      <VendorBookingActions bookingId={booking.id} status={booking.status} />
    </article>) : <div className="rounded-2xl border border-dashed p-12 text-center text-[#817970]">No booking requests yet.</div>}</div>
  </main>;
}
