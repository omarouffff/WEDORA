import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return <main className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ebe5] text-[#a6796f]"><Search size={22} aria-hidden="true" /></span>
    <p className="mt-6 text-xs uppercase tracking-[.2em] text-[#a6796f]">A little detour</p>
    <h1 className="serif mt-2 text-4xl md:text-5xl">We couldn’t find that page.</h1>
    <p className="mt-4 text-[#817970]">The link may have changed, or this page may no longer be here.</p>
    <Link href="/" className="mt-7 rounded-full bg-[#302d29] px-6 py-3 text-sm text-white">Back to WEDORA</Link>
  </main>;
}
