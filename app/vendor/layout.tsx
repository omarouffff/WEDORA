import Link from "next/link";
import { requirePageVendor } from "@/lib/auth/guards";
import { logoutAction } from "@/actions/auth";
import { Store, CalendarDays, MessageCircle, Settings, LogOut } from "lucide-react";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  await requirePageVendor();

  return (
    <div className="flex min-h-screen bg-[#f9f8f6]">
      <aside className="w-64 border-r border-[#e9e4de] bg-white p-6 hidden md:flex flex-col">
        <Link href="/vendor" className="serif text-2xl tracking-wide">
          WEDORA <span className="text-sm font-sans text-[#a6796f] ml-1">For Vendors</span>
        </Link>
        <div className="mt-8 flex-1 space-y-2">
          <Link href="/vendor" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#302d29] hover:bg-[#faf8f5]">
            <Store size={18} />
            Dashboard
          </Link>
          <Link href="/vendor/bookings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#302d29] hover:bg-[#faf8f5]">
            <CalendarDays size={18} />
            Bookings
          </Link>
          <Link href="/vendor/messages" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#302d29] hover:bg-[#faf8f5]">
            <MessageCircle size={18} />
            Messages
          </Link>
          <Link href="/vendor/profile" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#302d29] hover:bg-[#faf8f5]">
            <Settings size={18} />
            Profile
          </Link>
        </div>
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#817970] hover:bg-[#faf8f5]">
            <LogOut size={18} />
            Log out
          </button>
        </form>
      </aside>
      <div className="flex-1 flex flex-col">
        <nav className="flex gap-2 overflow-x-auto border-b border-[#e9e4de] bg-white px-4 py-3 md:hidden" aria-label="Vendor navigation">
          <Link className="whitespace-nowrap rounded-full border px-3 py-2 text-sm" href="/vendor">Overview</Link>
          <Link className="whitespace-nowrap rounded-full border px-3 py-2 text-sm" href="/vendor/bookings">Bookings</Link>
          <Link className="whitespace-nowrap rounded-full border px-3 py-2 text-sm" href="/vendor/messages">Messages</Link>
          <form action={logoutAction}><button className="whitespace-nowrap rounded-full border px-3 py-2 text-sm">Log out</button></form>
        </nav>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
