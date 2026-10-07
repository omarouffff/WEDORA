import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Heart, Sparkles } from "lucide-react";
import { categories, categoryPhotos, photo } from "@/lib/data";
import { VendorCard } from "@/components/vendor-card";
import { listVendors } from "@/services/vendors";

const steps = [
  ["01", "Find your people", "Explore wedding vendors across Egypt and save the ones that feel right.", "/vendors"],
  ["02", "Make a plan", "Keep the checklist, budget, and guest replies together as you go.", "/dashboard"],
  ["03", "Bring it to life", "Request bookings and create a wedding website to share with your guests.", "/dashboard/website"],
];

const tools = [
  ["Your checklist", "Know what to do next, one step at a time.", "/dashboard/planner"],
  ["Your budget", "Keep spending in view without losing sight of the day.", "/dashboard/budget"],
  ["Your guests", "Gather your list and keep RSVPs together.", "/dashboard/guests"],
  ["Your wedding website", "Share the details and collect replies in one place.", "/dashboard/website"],
];

export default async function Home() {
  const featuredVendors = await listVendors();

  return (
    <main>
      <section className="relative min-h-[590px] overflow-hidden md:min-h-[680px]">
        <Image fill priority sizes="100vw" src={photo("photo-1519741497674-611481863552", 2000)} className="object-cover" alt="An elegant outdoor wedding celebration beneath warm lights" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#171614]/70 via-[#171614]/30 to-transparent" />
        <div className="relative mx-auto flex min-h-[590px] max-w-[1320px] items-center px-6 py-20 sm:px-8 md:min-h-[680px]">
          <div className="max-w-[620px] text-white">
            <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[.25em] text-white/80"><span className="h-px w-9 bg-[#d4b79d]" />WEDORA · YOUR WEDDING, IN ONE PLACE</div>
            <h1 className="serif text-6xl leading-[1.05] sm:text-7xl md:text-[82px]">Plan Your<br /><i className="font-normal text-[#e8d3c3]">Perfect Day.</i></h1>
            <p className="mt-7 max-w-[480px] text-base leading-7 text-white/90 md:text-lg">Everything you need to plan, organize, and create the wedding you’ve always imagined.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link href="/dashboard" className="flex min-h-12 items-center gap-3 rounded-full bg-[#f7f2ed] px-7 py-4 text-sm font-semibold text-[#302d29] transition hover:bg-white">Start planning <ArrowRight size={16} /></Link><Link href="/vendors" className="flex min-h-12 items-center rounded-full border border-white/60 px-7 py-4 text-sm font-medium text-white transition hover:bg-white/10">Explore vendors</Link></div>
            <div className="mt-12 flex items-center gap-3 text-xs text-white/80"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10"><Heart size={15} /></span><span><b className="text-white">Made for your story</b><br />Thoughtful planning starts here</span></div>
          </div>
        </div>
        <div className="absolute bottom-7 right-8 hidden text-[10px] uppercase tracking-[.2em] text-white/75 md:block">Cairo · Giza · Alexandria</div>
      </section>

      <section className="mx-auto grid max-w-[1320px] items-center gap-8 px-6 py-16 sm:px-8 md:grid-cols-[.8fr_1.2fr] md:py-20">
        <div><p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">Meet WEDORA</p><h2 className="serif mt-3 text-4xl leading-tight md:text-5xl">A little more joy.<br />A little less juggling.</h2></div>
        <div><p className="max-w-2xl text-base leading-8 text-[#625d56]">WEDORA brings your wedding plan and the people who make it happen into one calm, personal space. Discover trusted local vendors, keep an eye on your budget, organize guests, and take each next step at your own pace.</p><Link href="/about" className="mt-5 inline-flex items-center gap-2 text-sm text-[#8d6258]">Get to know us <ArrowRight size={15} /></Link></div>
      </section>

      <section className="bg-[#f0ebe5] py-16 md:py-20"><div className="mx-auto max-w-[1320px] px-6 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">Start with a feeling</p><h2 className="serif mt-3 text-4xl md:text-5xl">Find your kind of celebration.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#817970]">Browse services to see the local professionals who can bring each detail to life.</p></div><Link href="/vendors" className="inline-flex items-center gap-2 text-sm">Browse all vendors <ArrowUpRight size={16} /></Link></div>
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">{categories.map((category) => <Link href={`/vendors?category=${encodeURIComponent(category)}`} className="group relative h-48 overflow-hidden rounded-2xl sm:h-56 md:h-64" key={category}><Image fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" className="object-cover transition duration-700 group-hover:scale-105" src={photo(categoryPhotos[category] ?? categoryPhotos.Venues, 700)} alt={`${category} for a wedding`} /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" /><span className="absolute inset-x-4 bottom-4 text-sm font-medium text-white sm:inset-x-5 sm:bottom-5 sm:text-base">{category}<span className="ml-2 inline-block transition group-hover:translate-x-1">→</span></span></Link>)}</div>
      </div></section>

      <section className="mx-auto max-w-[1320px] px-6 py-16 sm:px-8 md:py-20"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">Thoughtful local talent</p><h2 className="serif mt-3 text-4xl md:text-5xl">Find the ones who get it.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#817970]">Compare details, get a feel for their work, and save your favorites as you explore.</p></div><Link href="/vendors" className="inline-flex items-center gap-2 text-sm">Explore all vendors <ArrowUpRight size={16} /></Link></div>
        {featuredVendors.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featuredVendors.slice(0, 4).map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)}</div> : <div className="mt-9 rounded-2xl border border-dashed border-[#d8d0c8] bg-white px-6 py-12 text-center"><p className="serif text-2xl">Your shortlist starts here.</p><p className="mt-2 text-sm text-[#817970]">Explore the marketplace to find vendors for your celebration.</p><Link className="mt-5 inline-flex rounded-full bg-[#302d29] px-6 py-3 text-sm text-white" href="/vendors">Explore vendors</Link></div>}
      </section>

      <section className="border-y border-[#e9e4de] bg-white py-16 md:py-20"><div className="mx-auto max-w-[1320px] px-6 sm:px-8"><div className="max-w-2xl"><p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">A clear place to begin</p><h2 className="serif mt-3 text-4xl md:text-5xl">From first idea to your wedding day.</h2><p className="mt-3 text-sm leading-6 text-[#817970]">Start anywhere. WEDORA keeps your choices and next steps close as plans take shape.</p></div><div className="mt-9 grid gap-4 md:grid-cols-3">{steps.map(([number, title, description, href]) => <Link href={href} key={number} className="group rounded-2xl border border-[#e9e4de] p-6 transition hover:-translate-y-1 hover:border-[#c7aa97] hover:shadow-lg hover:shadow-stone-900/5"><span className="text-xs tracking-[.15em] text-[#a6796f]">{number}</span><h3 className="serif mt-5 text-2xl">{title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[#817970]">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-xs">Take a look <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span></Link>)}</div></div></section>

      <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-6 py-16 sm:px-8 md:grid-cols-2 md:gap-16 md:py-20"><div className="relative"><div className="relative aspect-[1.15] overflow-hidden rounded-2xl"><Image fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" src={photo("photo-1523438885200-e635ba2c371e", 1000)} alt="A couple sharing a joyful moment on their wedding day" /></div><div className="absolute -bottom-5 right-3 rounded-xl border border-[#e9e4de] bg-white p-5 shadow-lg sm:-right-5"><div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#a6796f]"><Sparkles size={15} /> Your planning space</div><p className="serif mt-2 text-xl">One less thing to worry about.</p></div></div><div className="pt-4 md:pl-4"><p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">The little details, taken care of</p><h2 className="serif mt-4 text-4xl leading-tight md:text-5xl">Make room for what matters.</h2><p className="mt-5 leading-7 text-[#817970]">Keep your checklist, budget, guest list, and the people bringing your vision to life together, without letting planning take over.</p><div className="mt-7 grid gap-4 text-sm">{["A clear plan, one step at a time", "A budget that feels like yours", "Every conversation in one place"].map((item) => <div key={item} className="flex items-center gap-3"><span className="rounded-full bg-[#e9dfd7] p-1.5"><Check size={14} /></span>{item}</div>)}</div><Link href="/dashboard" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#302d29] px-6 py-3.5 text-sm text-white transition hover:bg-[#51463f]">Make a little plan <ArrowRight size={16} /></Link></div></section>

      <section className="bg-[#f0ebe5] py-16 md:py-20"><div className="mx-auto max-w-[1320px] px-6 sm:px-8"><div className="max-w-2xl"><p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">Your planning space</p><h2 className="serif mt-3 text-4xl md:text-5xl">Everything has its place.</h2><p className="mt-3 text-sm leading-6 text-[#817970]">Your dashboard brings the practical pieces together, so the next step is always easy to find.</p></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tools.map(([title, description, href]) => <Link key={title} href={href} className="group rounded-2xl bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-900/5"><h3 className="serif text-xl">{title}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-[#817970]">{description}</p><span className="mt-4 inline-flex items-center gap-2 text-xs">Open tool <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span></Link>)}</div></div></section>

      <section className="mx-auto max-w-[1320px] px-6 py-16 sm:px-8 md:py-20"><div className="relative overflow-hidden rounded-3xl bg-[#38312d] px-6 py-14 text-center text-white sm:px-10 md:px-16 md:py-16"><div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/10" /><div className="relative"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10"><Sparkles size={21} /></div><p className="mt-5 text-xs uppercase tracking-[.2em] text-white/65">A little help when you need it</p><h2 className="serif mt-3 text-4xl md:text-5xl">Meet your planning companion.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/75">Tell us what you’re dreaming of. Get thoughtful ideas for your timeline, budget, and next steps.</p><Link href="/dashboard/ai-planner" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f7f2ed] px-6 py-3.5 text-sm font-semibold text-[#302d29] transition hover:bg-white">Get inspired <ArrowRight size={16} /></Link></div></div></section>
    </main>
  );
}
