import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, Heart, Sparkles, Users, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageCouple } from "@/lib/auth/guards";
import { planningProgress, guestSummary, daysUntil } from "@/lib/calculations";
import { money } from "@/lib/utils";
import { VendorCard } from "@/components/vendor-card";

const shortcuts = [
  { label: "Your checklist", href: "/dashboard/planner", icon: ClipboardList },
  { label: "Your budget", href: "/dashboard/budget", icon: Wallet },
  { label: "Guest list", href: "/dashboard/guests", icon: Users },
  { label: "Your website", href: "/dashboard/website", icon: Heart },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { label: "Messages", href: "/dashboard/messages", icon: ArrowRight },
];

function vendorImageId(url: string | null) {
  return url?.match(/images\.unsplash\.com\/([^?]+)/)?.[1] ?? "photo-1519741497674-611481863552";
}

export default async function Dashboard() {
  const { user, wedding } = await requirePageCouple();
  const [tasks, budget, guests, bookings, vendors] = await Promise.all([
    prisma.weddingTask.findMany({ where: { weddingId: wedding.id }, orderBy: [{ status: "asc" }, { dueDate: "asc" }], take: 5 }),
    prisma.weddingBudget.findUnique({ where: { weddingId: wedding.id }, include: { transactions: true } }),
    prisma.guest.findMany({ where: { weddingId: wedding.id }, select: { status: true, partySize: true } }),
    prisma.vendorBooking.findMany({ where: { weddingId: wedding.id }, include: { vendor: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.vendor.findMany({ where: { approved: true, ...(wedding.city ? { city: wedding.city } : {}) }, include: { category: true }, orderBy: [{ featured: "desc" }, { rating: "desc" }], take: 4 }),
  ]);
  const progress = planningProgress(tasks.map(t => t.status));
  const rsvps = guestSummary(guests.map(g => g.status));
  const total = budget ? Number(budget.total) : 0;
  const spent = budget?.transactions.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
  const remaining = total - spent;
  const days = daysUntil(wedding.date);
  const firstName = user.profile?.name?.split(" ")[0] ?? "there";
  const recommended = vendors.map(v => ({
    id: v.id, name: v.name, category: v.category.name, city: v.city, area: v.area || v.city,
    price: Number(v.startingPrice), rating: v.rating, reviews: v.reviewCount,
    verified: v.verification === "VERIFIED", style: v.styles.join(", "), image: vendorImageId(v.imageUrl), description: v.description,
  }));

  return <main className="mx-auto min-h-[70vh] max-w-[1320px] px-6 py-12">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">Your planning space</p><h1 className="serif mt-2 text-4xl md:text-5xl">A day worth dreaming about.</h1><p className="mt-3 text-sm text-[#817970]">Welcome back, {firstName}. Let’s make the next little thing happen.</p></div>
      <div className="flex items-center gap-3 rounded-full border border-[#e9e4de] bg-white px-4 py-2.5 text-sm"><CalendarDays size={17} className="text-[#a6796f]"/><span>Your wedding date</span><b>{wedding.date ? wedding.date.toLocaleDateString("en-EG", { month: "short", day: "numeric", year: "numeric" }) : "Not set"}</b></div></div>
    <section className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-[#37312d] p-7 text-white md:col-span-2"><div className="text-xs uppercase tracking-[.18em] text-white/55">{days === null ? "Your wedding countdown" : "The countdown is on"}</div><div className="serif mt-2 text-5xl">{days === null ? "Set your date" : <>{days} <span className="text-2xl">days to go</span></>}</div><div className="mt-6 h-1.5 overflow-hidden rounded bg-white/15"><div className="h-full rounded bg-[#d5bba7] transition-all" style={{ width: `${progress}%` }}/></div><div className="mt-2 flex justify-between text-[11px] text-white/55"><span>{progress}% of checklist complete</span><span>{tasks.length} next steps</span></div></div>
      <div className="rounded-2xl border border-[#e9e4de] bg-white p-7"><div className="text-xs text-[#817970]">Wedding budget</div><div className="serif mt-2 text-3xl">{money(total)}</div><div className="mt-2 text-xs text-[#817970]">{money(spent)} spent · {money(remaining)} remaining</div><Link href="/dashboard/budget" className="mt-5 inline-flex items-center gap-2 text-xs">View budget <ArrowRight size={14}/></Link></div></section>
    <section className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-[#e9e4de] bg-white p-4"><div className="text-xs text-[#817970]">Guests</div><div className="serif mt-1 text-2xl">{rsvps.total} <span className="text-sm">invited</span></div><div className="mt-1 text-xs text-[#817970]">{rsvps.confirmed} confirmed · {rsvps.pending} awaiting reply</div></div><div className="rounded-xl border border-[#e9e4de] bg-white p-4"><div className="text-xs text-[#817970]">Bookings</div><div className="serif mt-1 text-2xl">{bookings.length} <span className="text-sm">recent</span></div><Link href="/dashboard/bookings" className="mt-1 inline-block text-xs text-[#9c6b61]">View requests</Link></div><div className="rounded-xl border border-[#e9e4de] bg-white p-4"><div className="text-xs text-[#817970]">Planning progress</div><div className="serif mt-1 text-2xl">{progress}%</div><Link href="/dashboard/planner" className="mt-1 inline-block text-xs text-[#9c6b61]">Continue your checklist</Link></div></section>
    <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-2xl border border-[#e9e4de] bg-white p-6 md:p-8"><div className="flex items-center justify-between"><div><h2 className="serif text-2xl">Your next little things</h2><p className="mt-1 text-xs text-[#817970]">Your latest checklist steps</p></div><Link className="text-xs" href="/dashboard/planner">See all <ArrowRight className="ml-1 inline" size={13}/></Link></div><div className="mt-5 divide-y divide-[#eeeae5]">{tasks.length ? tasks.map(t=><div className="flex items-center gap-3 py-4" key={t.id}><CheckCircle2 size={19} className={t.status === "DONE" ? "text-[#b77d71]" : "text-[#b6a69a]"}/><span className={`flex-1 text-sm ${t.status === "DONE" ? "line-through text-[#a8a098]" : ""}`}>{t.title}</span><span className="rounded-full bg-[#f5f1ed] px-3 py-1.5 text-[10px] text-[#817970]">{t.category}</span></div>) : <div className="py-8 text-sm text-[#817970]">Your checklist is ready for its first task. <Link href="/dashboard/planner" className="text-[#9c6b61] underline">Add one</Link>.</div>}</div></section>
      <section className="rounded-2xl border border-[#e9e4de] bg-white p-6 md:p-8"><div className="flex items-center justify-between"><div><h2 className="serif text-2xl">Your planning toolkit</h2><p className="mt-1 text-xs text-[#817970]">Everything has its place</p></div><Sparkles size={18} className="text-[#a6796f]"/></div><div className="mt-5 grid grid-cols-2 gap-3">{shortcuts.map(({label,href,icon:Icon})=><Link className="rounded-xl border border-[#eeeae5] p-4 transition hover:border-[#c7aa97] hover:bg-[#fbf9f7]" href={href} key={href}><Icon size={18} className="text-[#a6796f]"/><div className="mt-5 text-sm">{label}</div><ArrowRight size={14} className="mt-2 text-[#817970]"/></Link>)}</div></section></div>
    {recommended.length>0&&<section className="mt-10"><div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[.18em] text-[#a6796f]">{wedding.city ? `Curated in ${wedding.city}` : "A few lovely possibilities"}</p><h2 className="serif mt-2 text-3xl">Vendor ideas for your day.</h2></div><Link href="/vendors" className="text-sm">Explore vendors <ArrowRight className="ml-1 inline" size={14}/></Link></div><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recommended.map(v=><VendorCard key={v.id} vendor={v}/>)}</div></section>}
  </main>;
}
