import { prisma } from "@/lib/prisma";
import { requirePageAdmin } from "@/lib/auth/guards";
import { Store, Users, Activity } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  await requirePageAdmin();
  
  const [vendorCount, coupleCount, bookingCount] = await Promise.all([
    prisma.vendor.count(),
    prisma.couple.count(),
    prisma.vendorBooking.count()
  ]);

  const recentVendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { category: true }
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="serif text-4xl">Platform Overview</h1>
      <p className="mt-2 text-[#817970]">High-level metrics across Wedora.</p>
      
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[#e9e4de] bg-white p-5">
          <div className="flex items-center gap-3 text-[#817970]">
            <Store size={18} className="text-[#a6796f]" />
            <span className="text-sm">Total Vendors</span>
          </div>
          <div className="mt-3 text-3xl font-semibold">{vendorCount}</div>
        </div>
        <div className="rounded-xl border border-[#e9e4de] bg-white p-5">
          <div className="flex items-center gap-3 text-[#817970]">
            <Users size={18} className="text-[#a6796f]" />
            <span className="text-sm">Total Couples</span>
          </div>
          <div className="mt-3 text-3xl font-semibold">{coupleCount}</div>
        </div>
        <div className="rounded-xl border border-[#e9e4de] bg-white p-5">
          <div className="flex items-center gap-3 text-[#817970]">
            <Activity size={18} className="text-[#a6796f]" />
            <span className="text-sm">Total Bookings</span>
          </div>
          <div className="mt-3 text-3xl font-semibold">{bookingCount}</div>
        </div>
      </div>

      <h2 className="serif mt-12 text-2xl">Recent Vendor Signups</h2>
      <div className="mt-6 rounded-2xl border border-[#e9e4de] bg-white">
        {recentVendors.length > 0 ? (
          <div className="divide-y divide-[#e9e4de]">
            {recentVendors.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-5">
                <div>
                  <div className="font-medium">{v.name}</div>
                  <div className="text-sm text-[#817970]">
                    {v.category.name} · {v.city}
                  </div>
                </div>
                <Link href="/admin/vendors" className="text-sm text-[#a6796f] hover:underline">
                  Manage vendors
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-[#817970]">
            <p>No recent vendors to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
