import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth-forms";
export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };
export default function ForgotPasswordPage() { return <main className="mx-auto min-h-[68vh] max-w-md px-6 py-16"><div className="rounded-2xl border border-[#e9e4de] bg-white p-7 shadow-sm md:p-9"><p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">We can help</p><h1 className="serif mt-2 text-4xl">Reset your password.</h1><p className="mt-3 text-sm leading-6 text-[#817970]">Enter your email and, if an account exists, we’ll send a secure reset link.</p><div className="mt-7"><ForgotPasswordForm/></div><Link href="/login" className="mt-6 block text-center text-sm text-[#9c6b61] hover:underline">Back to sign in</Link></div></main>; }
