import { prisma } from "@/lib/prisma";
import { requirePageVendor } from "@/lib/auth/guards";
import { CalendarDays, MessageCircle, Heart, Star } from "lucide-react";
import Link from "next/link";

export default async function VendorDashboard() {
  const { vendor } = await requirePageVendor();
  
  const [bookingsCount, unreadMessages, favoritesCount] = await Promise.all([
    prisma.vendorBooking.count({ where: { vendorId: vendor.id, status: "PENDING" } }),
    prisma.conversation.count({ where: { vendorId: vendor.id } }), // simplified unread for demo
    prisma.favoriteVendor.count({ where: { vendorId: vendor.id } })
  ]);

  const recentBookings = await prisma.vendorBooking.findMany({
    where: { vendorId: vendor.id },
    include: { wedding: { include: { couple: { include: { user: { include: { profile: true } } } } } } },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="serif text-4xl">Welcome, {vendor.name}</h1>
      <p className="mt-2 text-[#817970]">Here&apos;s what&apos;s happening with your business today.</p>
      
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#e9e4de] bg-white p-5">
          <div className="flex items-center gap-3 text-[#817970]">
            <CalendarDays size={18} className="text-[#a6796f]" />
            <span className="text-sm">New Requests</span>
          </div>
          <div className="mt-3 text-3xl font-semibold">{bookingsCount}</div>
        </div>
        <div className="rounded-xl border border-[#e9e4de] bg-white p-5">
          <div className="flex items-center gap-3 text-[#817970]">
            <MessageCircle size={18} className="text-[#a6796f]" />
            <span className="text-sm">Active Chats</span>
          </div>
          <div className="mt-3 text-3xl font-semibold">{unreadMessages}</div>
        </div>
        <div className="rounded-xl border border-[#e9e4de] bg-white p-5">
          <div className="flex items-center gap-3 text-[#817970]">
            <Heart size={18} className="text-[#a6796f]" />
            <span className="text-sm">Saves</span>
          </div>
          <div className="mt-3 text-3xl font-semibold">{favoritesCount}</div>
        </div>
        <div className="rounded-xl border border-[#e9e4de] bg-white p-5">
          <div className="flex items-center gap-3 text-[#817970]">
            <Star size={18} className="text-[#a6796f]" />
            <span className="text-sm">Rating</span>
          </div>
          <div className="mt-3 text-3xl font-semibold">{vendor.rating}</div>
        </div>
      </div>

      <h2 className="serif mt-12 text-2xl">Recent Bookings</h2>
      <div className="mt-6 rounded-2xl border border-[#e9e4de] bg-white">
        {recentBookings.length > 0 ? (
          <div className="divide-y divide-[#e9e4de]">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-5">
                <div>
                  <div className="font-medium">{b.wedding?.couple?.partnerName || "Couple"}</div>
                  <div className="text-sm text-[#817970]">
                    {b.eventDate.toLocaleDateString("en-EG")} · {b.status}
                  </div>
                </div>
                <Link href="/vendor/bookings" className="text-sm text-[#a6796f] hover:underline">
                  View details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-[#817970]">
            <p>No recent bookings to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
