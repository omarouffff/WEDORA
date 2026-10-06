"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { submitRsvp } from "@/actions/rsvp";
import { MEAL_PREFERENCES } from "@/lib/constants";
import type { ActionResult } from "@/lib/action";

export function RsvpForm({ slug }: { slug: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult<{received:boolean}> | null>(null);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    start(async () => {
      const response = await submitRsvp({
        slug, name: form.get("name"), contact: form.get("contact"), attendance: form.get("attendance"),
        partySize: form.get("partySize"), mealPreference: form.get("mealPreference"), message: form.get("message"), website: form.get("website"),
      });
      setResult(response);
    });
  }
  const base = "mt-2 w-full rounded-xl border border-[#e9e4de] bg-white px-4 py-3 text-sm outline-none focus:border-[#b77d71] focus:ring-2 focus:ring-[#b77d71]/15 disabled:opacity-60";
  if (result?.ok) return <div role="status" className="mt-7 rounded-xl bg-[#f0ebe5] p-6 text-center text-sm text-[#514b45]">{result.message}</div>;
  return <form onSubmit={submit} className="mx-auto mt-7 grid max-w-lg gap-4">
    {result && !result.ok && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{result.error}</p>}
    <label className="text-xs">Your name<input name="name" required minLength={2} maxLength={100} disabled={pending} className={base}/></label>
    <label className="text-xs">Email or phone<input name="contact" required maxLength={120} autoComplete="email" disabled={pending} className={base}/></label>
    <label className="text-xs">Will you be joining us?<select name="attendance" disabled={pending} className={base}><option value="CONFIRMED">Joyfully accepts</option><option value="DECLINED">Regretfully declines</option></select></label>
    <label className="text-xs">Number in your party<input name="partySize" type="number" min={0} max={10} defaultValue={1} disabled={pending} className={base}/></label>
    <label className="text-xs">Meal preference<select name="mealPreference" defaultValue="" disabled={pending} className={base}><option value="">No preference</option>{MEAL_PREFERENCES.filter(x=>x!=="No preference").map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="text-xs">A note for the couple <span className="text-[#817970]">(optional)</span><textarea name="message" maxLength={500} disabled={pending} className={`${base} min-h-24`}/></label>
    <label aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">Leave this blank<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <button disabled={pending} className="flex items-center justify-center gap-2 rounded-full bg-[#302d29] px-6 py-3.5 text-sm text-white disabled:opacity-60">{pending&&<Loader2 size={15} className="animate-spin"/>}{pending?"Sending…":"Send RSVP"}</button>
  </form>;
}
