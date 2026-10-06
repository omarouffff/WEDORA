"use client";

import { useTransition, useState } from "react";
import { Check, Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { addTask, toggleTask, deleteTask, updateTask } from "@/actions/planner";
import type { WeddingTask } from "@prisma/client";

export function PlannerBoard({ initialTasks }: { initialTasks: WeddingTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Venue");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) return;
    const t = title.trim();
    const c = category;
    setTitle("");
    setError("");
    startTransition(async () => {
      // Optimistic locally
      setTasks((prev) => [
        ...prev,
        { id: `temp-${Date.now()}`, title: t, category: c, status: "TODO", priority: "MEDIUM", dueDate: null, completedAt: null, reminderSentAt: null, weddingId: "", createdAt: new Date(), updatedAt: new Date() } as WeddingTask
      ]);
      const res = await addTask({ title: t, category: c });
      if (res.ok === false) {
        setTasks((prev) => prev.filter((task) => !task.id.startsWith("temp-")));
        setTitle(t);
        setError(res.error);
      }
      // in reality we could re-fetch or rely on revalidatePath
      // since revalidatePath is called, the server will send down new props
    });
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    if (id.startsWith("temp-")) return;
    startTransition(async () => {
      setTasks((prev) => prev.map(t => t.id === id ? { ...t, status: currentStatus === "DONE" ? "TODO" : "DONE" } : t));
      const result = await toggleTask({ id });
      if (result.ok === false) { setTasks((prev) => prev.map((task) => task.id === id ? { ...task, status: currentStatus as WeddingTask["status"] } : task)); setError(result.error); }
    });
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith("temp-")) return;
    startTransition(async () => {
      const removed = tasks.find((task) => task.id === id);
      setTasks((prev) => prev.filter(t => t.id !== id));
      const result = await deleteTask({ id });
      if (result.ok === false && removed) { setTasks((prev) => [...prev, removed]); setError(result.error); }
    });
  };

  // Ensure tasks are synced from props if revalidation happens
  // For simplicity since we use local state for optimistic UI:
  // if initialTasks change from server, we update local state unless we are mutating.
  // Actually, standard pattern is to use useOptimistic, but we'll stick to a simple sync:
  if (initialTasks !== tasks && !isPending) {
     setTasks(initialTasks);
  }

  const doneCount = tasks.filter(t => t.status === "DONE").length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
        <input
          aria-label="Task name"
          className="rounded-xl border border-[#e9e4de] bg-white px-4 py-3 text-sm"
          placeholder="Add a little task…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          disabled={isPending}
        />
        <select
          className="rounded-xl border border-[#e9e4de] bg-white px-3 text-sm"
          value={category}
          onChange={e => setCategory(e.target.value)}
          disabled={isPending}
        >
          {["Venue", "Catering", "Decoration", "Photography", "Music", "Dress", "Makeup", "Flowers", "Invitations", "Transportation", "Guests", "Honeymoon"].map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#302d29] px-5 py-3 text-sm text-white disabled:opacity-50"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add task
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}

      <div className="mt-6 flex gap-6 text-xs text-[#817970]">
        <span>{doneCount} of {tasks.length} complete</span>
        <span>{progress}% progress</span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e9e4de]">
        <div
          className="h-full rounded-full bg-[#b77d71] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 divide-y divide-[#eeeae5]">
        {tasks.map(t => (
          <div className="flex items-center gap-3 py-4" key={t.id}>
            <button
              aria-label={t.status === "DONE" ? "Mark incomplete" : "Complete task"}
              onClick={() => handleToggle(t.id, t.status)}
              disabled={isPending}
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                t.status === "DONE" ? "border-[#b77d71] bg-[#b77d71] text-white" : "border-[#cfc5bb]"
              }`}
            >
              {t.status === "DONE" && <Check size={12} />}
            </button>
            <span className={`flex-1 text-sm ${t.status === "DONE" ? "text-[#a8a098] line-through" : ""}`}>
              {t.title}
            </span>
            <span className="rounded-full bg-[#f4efea] px-3 py-1.5 text-[10px] text-[#817970]">
              {t.category}
            </span>
            <button aria-label={`Edit ${t.title}`} onClick={() => { const nextTitle = window.prompt("Task name", t.title); if (!nextTitle?.trim()) return; const nextCategory = window.prompt("Category", t.category); if (!nextCategory?.trim()) return; startTransition(async () => { const result = await updateTask({ id: t.id, title: nextTitle, category: nextCategory }); if (result.ok) setTasks((prev) => prev.map((task) => task.id === t.id ? { ...task, title: nextTitle.trim(), category: nextCategory } : task)); else setError(result.error); }); }} disabled={isPending} className="p-2 text-[#a8a098] hover:text-[#302d29] disabled:opacity-50"><Pencil size={14}/></button>
            <button
              aria-label="Delete task"
              onClick={() => handleDelete(t.id)}
              disabled={isPending}
              className="p-2 text-[#a8a098] hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="py-8 text-center text-sm text-[#817970]">
            No tasks yet. Add one above!
          </div>
        )}
      </div>
    </>
  );
}
