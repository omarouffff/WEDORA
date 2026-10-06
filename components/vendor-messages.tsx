"use client";
import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { sendVendorMessage } from "@/actions/messages";

type Thread = { id: string; couple: string; wedding: string; messages: { id: string; body: string; mine: boolean; time: string }[] };

export function VendorMessages({ threads }: { threads: Thread[] }) {
  const [active, setActive] = useState(threads[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const current = threads.find((thread) => thread.id === active);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!current || !body.trim() || pending) return;
    const message = body.trim();
    startTransition(async () => {
      const result = await sendVendorMessage({ conversationId: current.id, body: message });
      setNotice(result.ok ? "Message sent." : result.error);
      if (result.ok) setBody("");
    });
  }
  return <section className="mt-8 grid min-h-[480px] overflow-hidden rounded-2xl border border-[#e9e4de] bg-white md:grid-cols-[270px_1fr]">
    <aside className="border-b border-[#e9e4de] p-4 md:border-b-0 md:border-r"><h2 className="text-xs uppercase tracking-wider text-[#817970]">Conversations</h2>
      {threads.map((thread) => <button key={thread.id} onClick={() => { setActive(thread.id); setNotice(""); }} className={`mt-2 w-full rounded-xl p-3 text-left text-sm ${active === thread.id ? "bg-[#f3efea]" : "hover:bg-[#faf8f5]"}`}><span className="block font-medium">{thread.couple}</span><span className="mt-1 block text-xs text-[#817970]">{thread.wedding}</span></button>)}
      {!threads.length && <p className="mt-4 text-sm text-[#817970]">Messages from couples will appear here.</p>}
    </aside>
    <div className="flex min-h-[480px] flex-col">{current ? <>
      <div className="border-b border-[#e9e4de] p-5"><h2 className="serif text-xl">{current.couple}</h2><p className="mt-1 text-xs text-[#817970]">{current.wedding}</p></div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#faf8f5] p-5">{current.messages.map((message) => <div key={message.id} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.mine ? "ml-auto bg-[#37312d] text-white" : "bg-white"}`}>{message.body}<div className={`mt-1 text-[9px] ${message.mine ? "text-white/50" : "text-[#817970]"}`}>{new Date(message.time).toLocaleString("en-EG")}</div></div>)}</div>
      <form onSubmit={submit} className="flex flex-wrap gap-2 border-t border-[#e9e4de] p-4"><input value={body} onChange={(e) => setBody(e.target.value)} disabled={pending} maxLength={2000} aria-label="Your message" placeholder="Write a message…" className="min-w-0 flex-1 rounded-full border border-[#e9e4de] px-4 py-3 text-sm disabled:opacity-50"/><button aria-label="Send message" disabled={pending || !body.trim()} className="rounded-full bg-[#302d29] p-3 text-white disabled:opacity-50"><Send size={16}/></button>{notice && <p role="status" className="w-full text-xs text-[#817970]">{notice}</p>}</form>
    </> : <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-[#817970]">Choose a conversation to read and reply.</div>}</div>
  </section>;
}
