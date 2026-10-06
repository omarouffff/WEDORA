"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Users, Loader2 } from "lucide-react";
import { addGuest, deleteGuest, updateGuestStatus } from "@/actions/guests";
import { RSVPStatus } from "@prisma/client";

type Guest = {
  id: string;
  name: string;
  contact: string;
  group: string;
  status: RSVPStatus;
  count: number;
};

export function GuestBoard({ initialGuests }: { initialGuests: Guest[] }) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [group, setGroup] = useState("Family");
  const [isPending, startTransition] = useTransition();

  // Sync props if changed from server
  if (initialGuests !== guests && !isPending) {
    setGuests(initialGuests);
  }

  const counts = {
    total: guests.length,
    yes: guests.filter((x) => x.status === "CONFIRMED").length,
    pending: guests.filter((x) => x.status === "PENDING").length,
    no: guests.filter((x) => x.status === "DECLINED").length,
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    const n = name.trim();
    const c = contact;
    const g = group;
    setName("");
    setContact("");

    startTransition(async () => {
      const tempId = `temp-${Date.now()}`;
      setGuests((prev) => [
        { id: tempId, name: n, contact: c, group: g, status: "PENDING", count: 1 },
        ...prev,
      ]);
      await addGuest({ name: n, contact: c, groupName: g });
    });
  };

  const handleDelete = (id: string) => {
    if (id.startsWith("temp-")) return;
    startTransition(async () => {
      setGuests((prev) => prev.filter((a) => a.id !== id));
      await deleteGuest({ id });
    });
  };

  const handleStatusChange = (id: string, newStatus: RSVPStatus) => {
    if (id.startsWith("temp-")) return;
    startTransition(async () => {
      setGuests((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      await updateGuestStatus({ id, status: newStatus });
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["All guests", counts.total],
          ["Confirmed", counts.yes],
          ["Awaiting reply", counts.pending],
          ["Can't make it", counts.no],
        ].map(([label, n]) => (
          <div key={label} className="rounded-xl bg-[#f7f4f0] p-4">
            <div className="text-xs text-[#817970]">{label}</div>
            <div className="serif mt-2 text-2xl">{n}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto]">
        <input
          aria-label="Guest name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Guest name"
          disabled={isPending}
          className="rounded-xl border border-[#e9e4de] px-3 py-3 text-sm disabled:opacity-50"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <input
          aria-label="Guest email or phone"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email or phone (optional)"
          disabled={isPending}
          className="rounded-xl border border-[#e9e4de] px-3 py-3 text-sm disabled:opacity-50"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <select
          className="rounded-xl border border-[#e9e4de] px-3 text-sm disabled:opacity-50"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          disabled={isPending}
        >
          <option>Family</option>
          <option>Friends</option>
          <option>Work</option>
        </select>
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#302d29] px-4 py-3 text-sm text-white disabled:opacity-50"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Add guest
        </button>
      </div>

      {guests.length > 0 ? (
        <div className="mt-6 divide-y divide-[#eeeae5]">
          {guests.map((x) => (
            <div key={x.id} className="flex flex-wrap items-center gap-3 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0ebe5]">
                <Users size={16} className="text-[#a6796f]" />
              </div>
              <div className="min-w-32 flex-1">
                <div className="text-sm font-medium">{x.name}</div>
                <div className="mt-1 text-xs text-[#817970]">
                  {x.contact || "No contact provided"}
                </div>
              </div>
              <span className="rounded-full bg-[#f4efea] px-3 py-1.5 text-[10px]">
                {x.group}
              </span>
              <select
                aria-label={`RSVP for ${x.name}`}
                value={x.status}
                onChange={(e) => handleStatusChange(x.id, e.target.value as RSVPStatus)}
                disabled={isPending}
                className="rounded-full border border-[#e9e4de] bg-white px-3 py-2 text-xs disabled:opacity-50"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="DECLINED">Declined</option>
              </select>
              <button
                aria-label={`Remove ${x.name}`}
                onClick={() => handleDelete(x.id)}
                disabled={isPending}
                className="p-2 text-[#a8a098] hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-sm text-[#817970]">
          Your guest list is waiting for its first name.
        </div>
      )}
    </>
  );
}
