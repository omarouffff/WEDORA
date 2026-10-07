import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/data";
import { listVendors } from "@/services/vendors";
import { VendorCard } from "@/components/vendor-card";
import { Search, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = { title: "Wedding Vendors in Egypt", description: "Discover talented wedding venues and vendors across Cairo, Giza and Alexandria." };

export default async function VendorsPage({ searchParams }: { searchParams: Promise<{ category?: string; city?: string; search?: string }> }) {
  const filters = await searchParams;
  const vendors = await listVendors(filters);

  return <main className="mx-auto min-h-[70vh] max-w-[1320px] px-5 py-10 sm:px-6 md:py-16">
    <p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">Find your people</p>
    <h1 className="serif mt-3 text-4xl sm:text-5xl md:text-6xl">Wedding vendors</h1>
    <p className="mt-4 max-w-xl text-sm leading-6 text-[#817970]">A thoughtful collection of local talent for the day you have in mind.</p>

    <form className="mt-8 grid gap-3 rounded-2xl border border-[#e9e4de] bg-white p-3 md:grid-cols-[1fr_220px_180px_auto]">
      <label className="flex min-h-11 items-center gap-3 px-3"><Search size={17} className="shrink-0 text-[#817970]" /><span className="sr-only">Search vendors</span><input name="search" defaultValue={filters.search} placeholder="Try ‘garden venue’ or a vendor name" className="h-11 w-full bg-transparent text-sm outline-none" /></label>
      <label className="sr-only" htmlFor="vendor-category">Category</label><select id="vendor-category" name="category" defaultValue={filters.category || ""} className="min-h-11 rounded-lg border border-[#e9e4de] bg-white px-3 text-sm"><option value="">All categories</option>{categories.map(category => <option key={category}>{category}</option>)}</select>
      <label className="sr-only" htmlFor="vendor-city">City</label><select id="vendor-city" name="city" defaultValue={filters.city || ""} className="min-h-11 rounded-lg border border-[#e9e4de] bg-white px-3 text-sm"><option value="">All cities</option>{["Cairo", "Giza", "Alexandria"].map(city => <option key={city}>{city}</option>)}</select>
      <button className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#302d29] px-6 text-sm text-white transition hover:bg-[#51463f]"><SlidersHorizontal size={15} />Find vendors</button>
    </form>

    <nav aria-label="Browse vendor categories" className="mt-5 flex flex-wrap gap-2"><Link href="/vendors" aria-current={!filters.category ? "page" : undefined} className={`rounded-full border px-4 py-2 text-xs transition ${!filters.category ? "border-[#302d29] bg-[#302d29] text-white" : "border-[#e9e4de] bg-white hover:border-[#b77d71]"}`}>All services</Link>{categories.map(category => <Link key={category} href={`/vendors?category=${encodeURIComponent(category)}`} aria-current={filters.category === category ? "page" : undefined} className={`rounded-full border px-4 py-2 text-xs transition ${filters.category === category ? "border-[#302d29] bg-[#302d29] text-white" : "border-[#e9e4de] bg-white hover:border-[#b77d71]"}`}>{category}</Link>)}</nav>

    <div className="mt-7 flex flex-wrap items-center justify-between gap-2 text-xs text-[#817970]"><span>{vendors.length} {vendors.length === 1 ? "vendor" : "vendors"} to explore</span><span>For celebrations in Egypt</span></div>
    {vendors.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{vendors.map(vendor => <VendorCard key={vendor.id} vendor={vendor} />)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-[#d8d0c8] bg-white px-6 py-16 text-center"><p className="serif text-2xl">No matches just yet.</p><p className="mt-2 text-sm text-[#817970]">Try another city or service and we’ll help you find the right fit.</p><Link href="/vendors" className="mt-5 inline-flex min-h-10 items-center rounded-full bg-[#302d29] px-5 text-sm text-white">Clear filters</Link></div>}
  </main>;
}
