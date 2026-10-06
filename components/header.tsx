import Link from "next/link";
import { Heart, Menu } from "lucide-react";
import { BRAND } from "@/lib/brand";

const nav = [
  ["Find vendors", "/vendors"],
  ["Planning tools", "/services"],
  ["Our story", "/about"],
  ["Inspiration", "/blog"],
] as const;

export function Header() {
  return <header className="sticky top-0 z-30 border-b border-[#e9e4de] bg-[#faf8f5]/95 backdrop-blur">
    <div className="mx-auto flex min-h-[68px] max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6 md:h-[76px]">
      <Link aria-label={`${BRAND.name} home`} className="serif shrink-0 text-[24px] tracking-[.16em] sm:text-[28px]" href="/">{BRAND.name}<span className="text-[#b77d71]">.</span></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-9 text-[13px] text-[#625d56] md:flex">{nav.map(([label, href]) => <Link key={href} href={href} className="transition hover:text-[#a6796f]">{label}</Link>)}</nav>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link aria-label="Saved vendors" className="hidden items-center gap-2 text-[13px] sm:flex" href="/dashboard/favorites"><Heart size={16} aria-hidden="true"/><span className="hidden lg:inline">Saved</span></Link>
        <Link href="/dashboard" className="rounded-full bg-[#302d29] px-4 py-2.5 text-xs text-white transition hover:bg-[#51463f] sm:px-5 sm:py-3 sm:text-[13px]">My wedding</Link>
        <details className="group relative md:hidden">
          <summary aria-label="Open navigation menu" className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-[#e9e4de] bg-white text-[#302d29] marker:hidden"><Menu size={18} aria-hidden="true"/></summary>
          <nav aria-label="Mobile navigation" className="absolute right-0 top-12 z-40 grid min-w-52 gap-1 rounded-2xl border border-[#e9e4de] bg-white p-2 shadow-xl">{nav.map(([label, href]) => <Link key={href} href={href} className="rounded-xl px-4 py-3 text-sm hover:bg-[#faf8f5]">{label}</Link>)}<Link href="/dashboard/favorites" className="rounded-xl px-4 py-3 text-sm hover:bg-[#faf8f5]">Saved vendors</Link><Link href="/login" className="rounded-xl px-4 py-3 text-sm hover:bg-[#faf8f5]">Sign in</Link></nav>
        </details>
      </div>
    </div>
  </header>;
}

export function Footer() {
  return <footer className="mt-24 bg-[#302d29] text-white"><div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-16 md:grid-cols-3"><div><div className="serif text-3xl tracking-[.14em]">{BRAND.name}</div><p className="mt-3 max-w-xs text-sm leading-6 text-white/60">Plan your perfect day. Thoughtfully, beautifully, all in one place.</p></div><div><div className="text-xs uppercase tracking-[.18em] text-white/50">Explore</div><div className="mt-4 grid gap-3 text-sm text-white/80"><Link href="/vendors">Find a vendor</Link><Link href="/dashboard/planner">Wedding planner</Link><Link href="/dashboard/budget">Budget planner</Link></div></div><div><div className="text-xs uppercase tracking-[.18em] text-white/50">Made for your story</div><p className="mt-4 text-sm text-white/80">Created with care for couples planning a celebration in Egypt.</p></div></div><div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/45">© {new Date().getFullYear()} {BRAND.name} · Made for the moments that matter</div></footer>;
}
