"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { money } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { addExpense, deleteExpense, updateBudgetTotal } from "@/actions/budget";

type Expense = { id: string, category: string, amount: number, note: string };

export function BudgetBoard({ initialTotal, initialItems }: { initialTotal: number, initialItems: Expense[] }) {
  const [items, setItems] = useState<Expense[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Venue");
  const [note, setNote] = useState("");
  
  const [isPending, startTransition] = useTransition();

  // Sync props if changed from server
  if (initialTotal !== total && !isPending) setTotal(initialTotal);
  if (initialItems !== items && !isPending) setItems(initialItems);

  const spent = items.reduce((n, e) => n + e.amount, 0);

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setTotal(val);
  };
  
  const handleTotalBlur = () => {
    startTransition(async () => {
      await updateBudgetTotal({ total });
    });
  };

  const handleAdd = () => {
    const a = Number(amount);
    if (!a || a < 1) return;
    
    const cat = category;
    const n = note;
    setAmount("");
    setNote("");

    startTransition(async () => {
      const tempId = `temp-${Date.now()}`;
      setItems((prev) => [...prev, { id: tempId, category: cat, amount: a, note: n }]);
      await addExpense({ category: cat, amount: a, note: n });
    });
  };

  const handleDelete = (id: string) => {
    if (id.startsWith("temp-")) return;
    startTransition(async () => {
      setItems((prev) => prev.filter((x) => x.id !== id));
      await deleteExpense({ id });
    });
  };

  const chart = [...new Set(items.map((i) => i.category))].map((c) => ({
    name: c,
    planned: items.filter((i) => i.category === c).reduce((n, i) => n + i.amount, 0),
  }));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Wedding budget", money(total)],
          ["Planned so far", money(spent)],
          ["Still available", money(total - spent)],
        ].map(([a, b]) => (
          <div key={a} className="rounded-xl bg-[#f7f4f0] p-5">
            <div className="text-xs text-[#817970]">{a}</div>
            <div className="serif mt-2 text-2xl">{b}</div>
          </div>
        ))}
      </div>
      
      <label className="mt-6 block text-xs text-[#625d56]">
        Your total budget{" "}
        <input
          type="number"
          value={total}
          onChange={handleTotalChange}
          onBlur={handleTotalBlur}
          disabled={isPending}
          className="ml-3 w-40 rounded-lg border border-[#e9e4de] bg-white px-3 py-2 text-sm disabled:opacity-50"
        />
      </label>
      
      {spent > total && (
        <div role="alert" className="mt-4 rounded-xl bg-[#fbefeb] p-4 text-sm text-[#9e594d]">
          You’re over your planned budget by {money(spent - total)}. Review your estimates or adjust your total.
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-8 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeae5" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => money(Number(v))} />
              <Bar dataKey="planned" fill="#b77d71" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-[160px_140px_1fr_auto]">
        <select
          className="rounded-xl border border-[#e9e4de] bg-white px-3 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isPending}
        >
          {["Venue", "Catering", "Decoration", "Photography", "Music", "Dress", "Makeup", "Flowers", "Invitations", "Transportation", "Other"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          aria-label="Amount in EGP"
          placeholder="Amount (EGP)"
          type="number"
          className="rounded-xl border border-[#e9e4de] px-3 text-sm disabled:opacity-50"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isPending}
        />
        <input
          aria-label="Expense notes"
          placeholder="A note for this expense"
          className="rounded-xl border border-[#e9e4de] px-3 text-sm disabled:opacity-50"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isPending}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#302d29] px-4 py-3 text-sm text-white disabled:opacity-50"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Add
        </button>
      </div>

      <div className="mt-4 divide-y divide-[#eeeae5]">
        {items.map((i) => (
          <div className="flex items-center gap-3 py-3" key={i.id}>
            <span className="flex-1 text-sm">
              {i.category} <span className="ml-2 text-xs text-[#817970]">{i.note}</span>
            </span>
            <b className="text-sm">{money(i.amount)}</b>
            <button
              onClick={() => handleDelete(i.id)}
              aria-label="Delete expense"
              disabled={isPending}
              className="p-2 text-[#a8a098] hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-8 text-center text-sm text-[#817970]">
            No expenses planned yet.
          </div>
        )}
      </div>
    </>
  );
}
