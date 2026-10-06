"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resendVerificationAction,
  resetPasswordAction,
  verifyEmailAction,
} from "@/actions/auth";
import { CITIES, VENDOR_CATEGORIES } from "@/lib/constants";
import type { ActionResult } from "@/lib/action";

function Notice({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return <div role={result.ok ? "status" : "alert"} className={`rounded-xl p-3 text-sm ${result.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{result.ok ? result.message : result.error}</div>;
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block text-xs text-[#625d56]">{label}<input {...props} className={`mt-2 w-full rounded-xl border border-[#e9e4de] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b77d71] focus:ring-2 focus:ring-[#b77d71]/15 disabled:opacity-60 ${props.className ?? ""}`} /></label>;
}

function PasswordField({ label = "Password", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const [visible, setVisible] = useState(false);
  return <label className="block text-xs text-[#625d56]">{label}<span className="mt-2 flex rounded-xl border border-[#e9e4de] bg-white focus-within:border-[#b77d71] focus-within:ring-2 focus-within:ring-[#b77d71]/15"><input {...props} type={visible ? "text" : "password"} className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none disabled:opacity-60"/><button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)} className="px-3 text-[#817970]">{visible ? <EyeOff size={16}/> : <Eye size={16}/>}</button></span></label>;
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#302d29] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#51463f] disabled:cursor-wait disabled:opacity-60">{pending && <Loader2 size={16} className="animate-spin"/>}{pending ? "Please wait…" : children}</button>;
}

export function LoginForm({ next }: { next?: string }) {
  const [pending, start] = useTransition(); const [result, setResult] = useState<ActionResult | null>(null);
  return <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); start(async () => setResult(await loginAction({ email: f.get("email"), password: f.get("password") }, next))); }}>
    <Notice result={result}/><Field label="Email address" name="email" type="email" autoComplete="email" required/><PasswordField label="Password" name="password" autoComplete="current-password" required/><div className="-mt-1 text-right"><Link className="text-xs text-[#9c6b61] hover:underline" href="/forgot-password">Forgot password?</Link></div><Submit pending={pending}>Sign in</Submit>
  </form>;
}

export function RegisterForm() {
  const [role, setRole] = useState("COUPLE"); const [pending, start] = useTransition(); const [result, setResult] = useState<ActionResult | null>(null);
  return <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const input = Object.fromEntries(f.entries()); start(async () => setResult(await registerAction(input))); }}>
    <Notice result={result}/><Field label="Your name" name="name" autoComplete="name" required/><Field label="Email address" name="email" type="email" autoComplete="email" required/><PasswordField label="Password" name="password" autoComplete="new-password" required minLength={8}/>
    <label className="block text-xs text-[#625d56]">What are you planning?<select name="role" value={role} onChange={e=>setRole(e.target.value)} className="mt-2 w-full rounded-xl border border-[#e9e4de] bg-white px-4 py-3 text-sm"><option value="COUPLE">A wedding as a couple</option><option value="VENDOR">My wedding business</option></select></label>
    {role === "VENDOR" && <><Field label="Business name" name="businessName" required/><label className="block text-xs text-[#625d56]">Category<select name="category" required className="mt-2 w-full rounded-xl border border-[#e9e4de] bg-white px-4 py-3 text-sm"><option value="">Choose a category</option>{VENDOR_CATEGORIES.map(c=><option key={c.name}>{c.name}</option>)}</select></label><label className="block text-xs text-[#625d56]">City<select name="city" required className="mt-2 w-full rounded-xl border border-[#e9e4de] bg-white px-4 py-3 text-sm"><option value="">Choose a city</option>{CITIES.map(c=><option key={c}>{c}</option>)}</select></label></>}
    <Submit pending={pending}>Create account</Submit><p className="text-center text-[11px] leading-5 text-[#817970]">By creating an account, you agree to our terms and privacy policy.</p>
  </form>;
}

export function ForgotPasswordForm() {
  const [pending, start] = useTransition(); const [result, setResult] = useState<ActionResult | null>(null);
  return <form className="grid gap-4" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);start(async()=>setResult(await forgotPasswordAction({email:f.get("email")})));}}><Notice result={result}/><Field label="Email address" name="email" type="email" autoComplete="email" required/><Submit pending={pending}>Send reset link</Submit></form>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router=useRouter();const [pending,start]=useTransition();const [result,setResult]=useState<ActionResult|null>(null);const [mismatch,setMismatch]=useState(false);
  return <form className="grid gap-4" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const password=String(f.get("password")||"");if(password!==f.get("confirm")){setMismatch(true);return;}setMismatch(false);start(async()=>{const r=await resetPasswordAction({token,password});setResult(r);if(r.ok)router.replace("/login?reset=1");});}}><Notice result={result}/>{mismatch&&<div role="alert" className="text-sm text-red-700">Passwords do not match.</div>}<Field type="hidden" name="token" value={token} label=""/><PasswordField label="New password" name="password" autoComplete="new-password" required minLength={8}/><PasswordField label="Confirm password" name="confirm" autoComplete="new-password" required minLength={8}/><Submit pending={pending}>Update password</Submit></form>;
}

export function VerifyEmailPanel({ token }: { token?: string }) {
  const [pending,start]=useTransition();const [result,setResult]=useState<ActionResult|null>(null);
  return <div className="grid gap-4"><Notice result={result}/>{token ? <button disabled={pending} onClick={()=>start(async()=>setResult(await verifyEmailAction(token)))} className="rounded-full bg-[#302d29] px-6 py-3.5 text-sm text-white disabled:opacity-60">{pending?"Confirming…":"Confirm email address"}</button> : <button disabled={pending} onClick={()=>start(async()=>setResult(await resendVerificationAction()))} className="rounded-full border border-[#e9e4de] px-6 py-3.5 text-sm disabled:opacity-60">{pending?"Sending…":"Resend confirmation email"}</button>}</div>;
}
