"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, Heart, Lightbulb, Send, Sparkles, Users, Wallet } from "lucide-react";

const prompts = [
  { label: "Create my wedding plan", icon: Sparkles, detail: "A balanced plan from first steps to wedding day." },
  { label: "Help me set a budget", icon: Wallet, detail: "A practical budget sketch for your celebration." },
  { label: "Find vendors", icon: Heart, detail: "A shortlist strategy for your city and priorities." },
  { label: "Create a timeline", icon: CalendarDays, detail: "A calm order for the decisions ahead." },
  { label: "Manage my guests", icon: Users, detail: "Ideas for invitations, replies, and guest details." },
  { label: "Give me wedding ideas", icon: Lightbulb, detail: "Inspiration shaped around your style." },
];

export function AIPlanner({ initialBudget, initialGuestCount, initialCity, weddingDate }: { initialBudget: number | null; initialGuestCount: number | null; initialCity: string | null; weddingDate: string | null }) {
  const [plan, setPlan] = useState("");
  const [busy, setBusy] = useState(false);
  const [budget, setBudget] = useState(initialBudget?.toString() ?? "");
  const [guests, setGuests] = useState(initialGuestCount?.toString() ?? "");
  const [city, setCity] = useState(["Cairo", "Giza", "Alexandria"].includes(initialCity ?? "") ? initialCity! : "Cairo");
  const [style, setStyle] = useState("Modern romantic");
  const [priorities, setPriorities] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("Create my wedding plan");
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setPlan("");
    setError("");
    try {
      const response = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: weddingDate || undefined, budget: Number(budget), guestCount: Number(guests), city, style, priorities: `${selectedPrompt}. ${priorities}`.trim() }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || "We couldn't prepare a plan just now. Please try again.");
      else setPlan(data.plan || "We couldn't prepare a plan just now. Please try again.");
    } catch {
      setError("We couldn't prepare a plan just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="mx-auto min-h-[70vh] max-w-[1120px] px-5 py-10 sm:px-6 md:py-14">
    <div className="flex items-center gap-3 text-xs uppercase tracking-[.2em] text-[#a6796f]"><Sparkles size={16} /> Your planning companion</div>
    <h1 className="serif mt-3 text-4xl sm:text-5xl">Let’s plan your perfect wedding.</h1>
    <p className="mt-3 max-w-xl text-sm leading-6 text-[#817970]">Tell us what you’d like help with. We’ll make a thoughtful starting point from your wedding details.</p>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_.9fr]">
      <div className="rounded-2xl border border-[#e9e4de] bg-white p-5 sm:p-7">
        <h2 className="serif text-2xl">What would you like help with?</h2>
        <p className="mt-1 text-xs text-[#817970]">Choose a starting point; you can change it any time.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">{prompts.map(({ label, icon: Icon, detail }) => <button key={label} type="button" onClick={() => setSelectedPrompt(label)} aria-pressed={selectedPrompt === label} className={`flex min-h-20 items-start gap-3 rounded-xl border p-3 text-left transition ${selectedPrompt === label ? "border-[#ae7a6d] bg-[#fbf6f2] ring-1 ring-[#ae7a6d]/20" : "border-[#eeeae5] hover:border-[#c7aa97]"}`}><span className="mt-0.5 rounded-full bg-[#f0e7df] p-2 text-[#a6796f]"><Icon size={15} /></span><span><span className="block text-xs font-semibold">{label}</span><span className="mt-1 block text-[11px] leading-4 text-[#817970]">{detail}</span></span></button>)}</div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-[#625d56]">Wedding budget <span className="text-[#817970]">(EGP)</span><input type="number" min={1} value={budget} onChange={event => setBudget(event.target.value)} placeholder="Add your total budget" className="mt-2 min-h-11 w-full rounded-xl border border-[#e9e4de] px-4 py-3 text-sm" /></label>
          <label className="text-xs text-[#625d56]">Guest count<input type="number" min={1} value={guests} onChange={event => setGuests(event.target.value)} placeholder="Add an estimated guest count" className="mt-2 min-h-11 w-full rounded-xl border border-[#e9e4de] px-4 py-3 text-sm" /></label>
          <label className="text-xs text-[#625d56]">Wedding city<select value={city} onChange={event => setCity(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#e9e4de] bg-white px-4 py-3 text-sm"><option>Cairo</option><option>Giza</option><option>Alexandria</option></select></label>
          <label className="text-xs text-[#625d56]">Your style<input value={style} onChange={event => setStyle(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#e9e4de] px-4 py-3 text-sm" /></label>
        </div>
        <label className="mt-4 block text-xs text-[#625d56]">Anything else on your mind?<textarea value={priorities} onChange={event => setPriorities(event.target.value)} placeholder="A garden venue, great food, a lively dance floor…" className="mt-2 min-h-24 w-full rounded-xl border border-[#e9e4de] px-4 py-3 text-sm" /></label>
        <button onClick={submit} disabled={busy || Number(budget) <= 0 || Number(guests) <= 0} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#302d29] px-6 py-3.5 text-sm text-white transition hover:bg-[#51463f] disabled:cursor-wait disabled:opacity-60">{busy ? "Putting your ideas together…" : "Create my starting plan"}<Send size={15} /></button>
      </div>

      <article aria-live="polite" className="min-h-[360px] rounded-2xl border border-[#e9e4de] bg-[#f5f1ed] p-6 sm:p-8">
        <div className="text-xs uppercase tracking-[.16em] text-[#a6796f]">A note for your celebration</div>
        {error ? <div role="alert" className="mt-6 rounded-xl bg-white p-4 text-sm leading-6 text-[#9e594d]">{error}</div> : plan ? <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#514b45]">{plan}</div> : <div className="mt-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e9dfd7]"><Sparkles size={20} className="text-[#a6796f]" /></div><p className="serif mt-5 text-2xl">A little inspiration, just for you.</p><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#817970]">Choose what you’d like help with, then we’ll shape ideas around your day.</p><div className="mt-6 inline-flex items-center gap-2 text-xs text-[#817970]"><span className="rounded-full bg-white px-3 py-1.5">{city}</span>{Number(guests) > 0 && <span className="rounded-full bg-white px-3 py-1.5">{guests} guests</span>}</div></div>}
        {plan && <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="mt-6 inline-flex items-center gap-2 text-xs text-[#8d6258]">Adjust your details <ArrowRight size={13} /></button>}
      </article>
    </section>
    <p className="mt-4 text-xs leading-5 text-[#817970]">Planning guidance is a starting estimate. Confirm vendor availability and prices directly.</p>
  </main>;
}
