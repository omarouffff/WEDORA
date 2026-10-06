"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { money } from "@/lib/utils";
import { requestBooking } from "@/actions/bookings";

type Vendor = { id: string, name: string, category: string, price: number };

export function BookingRequestClient({ vendors }: { vendors: Vendor[] }) {
  const params = useSearchParams();
  const id = params.get("vendor");
  const v = vendors.find(x => x.id === id);
  
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!id) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-2xl px-6 py-20">
        <h1 className="serif text-4xl">Choose a vendor first</h1>
        <Link className="mt-5 inline-block underline" href="/vendors">Explore vendors</Link>
      </main>
    );
  }

  if (!v) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-2xl px-6 py-20">
        <h1 className="serif text-4xl">Vendor not found</h1>
        <Link className="mt-5 inline-block underline" href="/vendors">Explore vendors</Link>
      </main>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!v || isPending) return;
    
    startTransition(async () => {
      const res = await requestBooking({ vendorId: v.id, eventDate: date, notes });
      if (res.ok === false) {
        alert(res.error || "Could not send request");
      } else {
        setDone(true);
      }
    });
  }

  return (
    <main className="mx-auto min-h-[65vh] max-w-2xl px-6 py-14">
      <p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">Take the next step</p>
      <h1 className="serif mt-2 text-5xl">Ask about your date.</h1>
      
      <div className="mt-7 rounded-2xl border border-[#e9e4de] bg-white p-6">
        <div className="text-xs text-[#817970]">Your vendor</div>
        <div className="serif mt-1 text-2xl">{v.name}</div>
        <div className="mt-1 text-sm text-[#817970]">{v.category} · from {money(v.price)}</div>
        
        {done ? (
          <div className="mt-7 rounded-xl bg-[#f1ebe5] p-5 text-sm">
            Your request has been sent! <Link className="underline" href="/dashboard/bookings">View requests</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="text-xs">
              Wedding date
              <input 
                required 
                type="date" 
                min={new Date().toISOString().slice(0, 10)} 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                disabled={isPending}
                className="mt-2 w-full rounded-xl border border-[#e9e4de] px-4 py-3 text-sm disabled:opacity-50"
              />
            </label>
            <label className="text-xs">
              Anything you’d like them to know?
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                disabled={isPending}
                placeholder="Guest count, style, or questions…" 
                className="mt-2 min-h-28 w-full rounded-xl border border-[#e9e4de] px-4 py-3 text-sm disabled:opacity-50"
              />
            </label>
            <button 
              disabled={isPending}
              className="rounded-full bg-[#302d29] px-6 py-3.5 text-sm text-white disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send booking request"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export function BookingRequestWrapper(props: Parameters<typeof BookingRequestClient>[0]) {
  return (
    <Suspense fallback={<main className="p-10">Loading booking form…</main>}>
      <BookingRequestClient {...props} />
    </Suspense>
  );
}
