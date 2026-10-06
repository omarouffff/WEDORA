import Link from "next/link";
import { requirePageAdmin } from "@/lib/auth/guards";
import { ShieldCheck, Users, Store, Activity, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePageAdmin();

  return (
    <div className="flex min-h-screen bg-[#f9f8f6]">
      <aside className="w-64 border-r border-[#e9e4de] bg-white p-6 hidden md:flex flex-col">
        <Link href="/admin" className="serif text-2xl tracking-wide flex items-center gap-2">
          WEDORA <ShieldCheck size={20} className="text-[#a6796f]" />
        </Link>
        <div className="text-xs uppercase tracking-wider text-[#817970] mt-1">Admin Panel</div>
        
        <div className="mt-8 flex-1 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#302d29] hover:bg-[#faf8f5]">
            <Activity size={18} />
            Overview
          </Link>
          <Link href="/admin/vendors" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#302d29] hover:bg-[#faf8f5]">
            <Store size={18} />
            Vendors
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#302d29] hover:bg-[#faf8f5]">
            <Users size={18} />
            Couples
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
        <nav className="flex gap-2 overflow-x-auto border-b border-[#e9e4de] bg-white px-4 py-3 md:hidden" aria-label="Admin navigation">
          <Link className="whitespace-nowrap rounded-full border px-3 py-2 text-sm" href="/admin">Overview</Link>
          <Link className="whitespace-nowrap rounded-full border px-3 py-2 text-sm" href="/admin/vendors">Vendors</Link>
          <Link className="whitespace-nowrap rounded-full border px-3 py-2 text-sm" href="/admin/users">Couples</Link>
          <form action={logoutAction}><button className="whitespace-nowrap rounded-full border px-3 py-2 text-sm">Log out</button></form>
        </nav>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
