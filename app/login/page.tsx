import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";
export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const { next, reset } = await searchParams;
  return <main className="mx-auto min-h-[68vh] max-w-md px-6 py-16"><div className="rounded-2xl border border-[#e9e4de] bg-white p-7 shadow-sm md:p-9"><p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">Welcome back</p><h1 className="serif mt-2 text-4xl">Your day, in good hands.</h1>{reset && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Your password was changed. Sign in with your new password.</p>}<div className="mt-7"><LoginForm next={next}/></div><p className="mt-6 text-center text-sm text-[#817970]">New to WEDORA? <Link href="/register" className="text-[#9c6b61] hover:underline">Create an account</Link></p></div></main>;
}
