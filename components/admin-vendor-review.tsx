"use client";
import { useTransition, useState } from "react";
import { reviewVendor } from "@/actions/admin";

export function AdminVendorReview({ vendorId, approved }: { vendorId: string; approved: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const decide = (decision: "APPROVE" | "REJECT") => startTransition(async () => {
    const result = await reviewVendor({ vendorId, decision });
    setMessage(result.ok ? (decision === "APPROVE" ? "Approved." : "Rejected.") : result.error);
  });
  return <div className="flex flex-wrap items-center gap-2">
    {approved ? <button disabled={pending} onClick={() => decide("REJECT")} className="rounded-full border px-4 py-2 text-sm disabled:opacity-50">Remove approval</button> : <button disabled={pending} onClick={() => decide("APPROVE")} className="rounded-full bg-[#302d29] px-4 py-2 text-sm text-white disabled:opacity-50">Approve & verify</button>}
    {!approved && <button disabled={pending} onClick={() => decide("REJECT")} className="rounded-full border px-4 py-2 text-sm disabled:opacity-50">Reject</button>}
    {message && <span role="status" className="text-sm">{message}</span>}
  </div>;
}
