import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";
export const metadata: Metadata = { title: "Create an account", robots: { index: false } };
export default function RegisterPage() { return <main className="mx-auto min-h-[68vh] max-w-md px-6 py-14"><div className="rounded-2xl border border-[#e9e4de] bg-white p-7 shadow-sm md:p-9"><p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">A lovely place to begin</p><h1 className="serif mt-2 text-4xl">Create your account.</h1><div className="mt-7"><RegisterForm/></div><p className="mt-6 text-center text-sm text-[#817970]">Already planning with us? <Link href="/login" className="text-[#9c6b61] hover:underline">Sign in</Link></p></div></main>; }
