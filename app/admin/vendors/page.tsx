import { prisma } from "@/lib/prisma";
import { requirePageAdmin } from "@/lib/auth/guards";
import { AdminVendorReview } from "@/components/admin-vendor-review";

export default async function AdminVendorsPage() {
  await requirePageAdmin();
  const vendors = await prisma.vendor.findMany({ include: { category: true }, orderBy: [{ approved: "asc" }, { createdAt: "desc" }] });
  return <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
    <p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">Platform management</p>
    <h1 className="serif mt-2 text-4xl">Vendors</h1>
    <p className="mt-2 text-[#817970]">Review vendor profiles before they appear in public search.</p>
    <div className="mt-8 space-y-3">{vendors.map((vendor) => <article key={vendor.id} className="flex flex-col gap-4 rounded-2xl border border-[#e9e4de] bg-white p-5 md:flex-row md:items-center md:justify-between">
      <div><h2 className="font-medium">{vendor.name}</h2><p className="mt-1 text-sm text-[#817970]">{vendor.category.name} · {vendor.city} · {vendor.verification.toLowerCase()}</p></div>
      <AdminVendorReview vendorId={vendor.id} approved={vendor.approved} />
    </article>)}{vendors.length === 0 && <p className="rounded-xl border border-dashed p-10 text-center text-[#817970]">No vendor profiles yet.</p>}</div>
  </main>;
}
