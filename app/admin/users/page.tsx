import { prisma } from "@/lib/prisma";
import { requirePageAdmin } from "@/lib/auth/guards";

export default async function AdminCouplesPage() {
  await requirePageAdmin();
  const couples = await prisma.couple.findMany({ include: { user: { include: { profile: true } }, wedding: true }, orderBy: { createdAt: "desc" } });
  return <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
    <p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">Platform management</p>
    <h1 className="serif mt-2 text-4xl">Couples</h1>
    <div className="mt-8 space-y-3">{couples.map((couple) => <article key={couple.id} className="rounded-2xl border border-[#e9e4de] bg-white p-5">
      <h2 className="font-medium">{couple.user.profile?.name ?? "Couple"}{couple.partnerName ? ` & ${couple.partnerName}` : ""}</h2>
      <p className="mt-1 text-sm text-[#817970]">{couple.user.email} · {couple.wedding?.city ?? "City not set"}{couple.wedding?.date ? ` · ${couple.wedding.date.toLocaleDateString("en-EG")}` : ""}</p>
    </article>)}{couples.length === 0 && <p className="rounded-xl border border-dashed p-10 text-center text-[#817970]">No couples yet.</p>}</div>
  </main>;
}
