import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RsvpForm } from "@/components/rsvp-form";

type Props = { params: Promise<{ slug: string }> };
async function websiteBySlug(slug: string) {
  return prisma.weddingWebsite.findUnique({
    where: { slug },
    include: { sections: { orderBy: { position: "asc" } }, wedding: { include: { couple: true } } },
  });
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await websiteBySlug(slug);
  if (!page?.published) return { title: "Wedding invitation", robots: { index: false } };
  const names = page.headline || page.wedding.couple.partnerName || page.wedding.title;
  return { title: `${names} — Wedding Invitation`, description: page.story || `Join ${names} to celebrate their wedding.`, openGraph: { title: `${names} — Wedding Invitation`, description: page.story || "A wedding celebration in Egypt", images: page.heroImage ? [page.heroImage] : [] } };
}
export default async function WeddingSite({ params }: Props) {
  const { slug } = await params;
  const page = await websiteBySlug(slug);
  if (!page?.published) notFound();
  const names = page.headline || page.wedding.couple.partnerName || page.wedding.title;
  const date = page.wedding.date;
  const bg = page.template === "ROMANTIC_GARDEN" ? "#e3eadf" : page.template === "MODERN_MINIMAL" ? "#e8e8e5" : "#eee4db";
  const schedule = page.sections.find(s => s.kind === "schedule");
  const scheduleItems = Array.isArray(schedule?.content) ? schedule.content as Array<{time?:string;title?:string;description?:string}> : [];
  return <main className="mx-auto min-h-[70vh] max-w-4xl px-5 py-8">
    <section style={{background:bg}} className="relative flex min-h-[430px] flex-col items-center justify-center overflow-hidden rounded-2xl px-8 py-16 text-center">
      <div className="absolute inset-3 border border-[#817970]/25"/>{page.heroImage&&<Image src={page.heroImage} alt="Wedding celebration" fill priority sizes="100vw" className="absolute inset-0 object-cover opacity-30"/>}
      <Heart className="relative text-[#a6796f]" size={18}/><div className="relative mt-8 text-[10px] uppercase tracking-[.28em] text-[#817970]">Together with our families</div>
      <h1 className="serif relative mt-4 text-5xl md:text-6xl">{names}</h1><div className="relative mt-5 text-xs uppercase tracking-[.22em] text-[#625d56]">Joyfully invite you to celebrate</div>
      {date&&<div className="relative mt-4 text-sm text-[#817970]">{date.toLocaleDateString("en-EG",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>}
    </section>
    {page.story&&<section className="px-5 py-12 text-center"><div className="text-[10px] uppercase tracking-[.2em] text-[#a6796f]">Our story</div><p className="serif mx-auto mt-4 max-w-xl text-2xl leading-9">{page.story}</p></section>}
    {(page.venueName||page.venueAddress||page.dressCode)&&<section className="grid gap-3 py-5 sm:grid-cols-2">{page.venueName&&<div className="rounded-xl bg-white p-5"><div className="text-[10px] uppercase tracking-wider text-[#a6796f]">Where</div><p className="serif mt-2 text-xl">{page.venueName}</p>{page.venueAddress&&<p className="mt-1 text-sm text-[#817970]">{page.venueAddress}</p>}</div>}{page.dressCode&&<div className="rounded-xl bg-white p-5"><div className="text-[10px] uppercase tracking-wider text-[#a6796f]">Dress code</div><p className="serif mt-2 text-xl">{page.dressCode}</p></div>}</section>}
    {scheduleItems.length>0&&<section className="py-8 text-center"><h2 className="serif text-3xl">The celebration</h2><div className="mx-auto mt-5 grid max-w-xl gap-3">{scheduleItems.map((item,i)=><div key={`${item.time}-${i}`} className="rounded-xl bg-white p-4"><span className="text-xs text-[#a6796f]">{item.time}</span><p className="serif mt-1 text-xl">{item.title}</p>{item.description&&<p className="mt-1 text-sm text-[#817970]">{item.description}</p>}</div>)}</div></section>}
    {page.gallery.length>0&&<section className="grid grid-cols-2 gap-3 py-6 md:grid-cols-3">{page.gallery.map((src,i)=><Image key={`${src}-${i}`} src={src} alt={`Wedding gallery ${i+1}`} width={700} height={600} sizes="(max-width:768px) 50vw, 33vw" className="aspect-square w-full rounded-xl object-cover"/>)}</section>}
    {page.rsvpEnabled&&<section className="rounded-2xl bg-white p-7 md:p-10"><div className="text-center"><div className="serif text-3xl">Will you join us?</div><p className="mt-2 text-sm text-[#817970]">We’d love to celebrate with you.</p></div><RsvpForm slug={page.slug}/></section>}
    <p className="py-8 text-center text-[10px] uppercase tracking-[.2em] text-[#a6796f]">With love · WEDORA</p>
  </main>;
}
