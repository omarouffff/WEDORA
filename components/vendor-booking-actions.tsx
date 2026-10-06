"use client";
import { useState, useTransition } from "react";
import { decideBooking } from "@/actions/bookings";

export function VendorBookingActions({ bookingId, status }: { bookingId: string; status: string }) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const run = (next: "CONFIRMED" | "REJECTED") => startTransition(async () => {
    const result = await decideBooking({ bookingId, status: next, note });
    setMessage(result.ok ? `Request ${next === "CONFIRMED" ? "accepted" : "declined"}.` : result.error);
  });
  if (status !== "PENDING") return null;
  return <div className="mt-3 flex flex-wrap items-center gap-2">
    <input aria-label="Optional note to couple" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" className="min-w-40 rounded-lg border px-3 py-2 text-sm" />
    <button disabled={pending} onClick={() => run("CONFIRMED")} className="rounded-full bg-[#302d29] px-4 py-2 text-sm text-white disabled:opacity-50">Accept</button>
    <button disabled={pending} onClick={() => run("REJECTED")} className="rounded-full border px-4 py-2 text-sm disabled:opacity-50">Decline</button>
    {message && <span role="status" className="text-sm">{message}</span>}
  </div>;
}
