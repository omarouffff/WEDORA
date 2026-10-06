"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, MessageCircle } from "lucide-react";
import { sendMessage } from "@/actions/messages";

type Message = { id: string, vendorId: string, body: string, mine: boolean, time: Date };
type Vendor = { id: string, name: string, category: string, city: string };

export function MessagesClient({ 
  initialMessages, 
  vendors 
}: { 
  initialMessages: Message[], 
  vendors: Vendor[] 
}) {
  const params = useSearchParams();
  const initial = params.get("vendor");
  
  const [active, setActive] = useState(initial || "");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  // Sync state if initialMessages changes from server
  if (initialMessages !== messages && !isPending) {
    setMessages(initialMessages);
  }

  const threads = [...new Set(messages.map(m => m.vendorId))];
  const current = vendors.find(v => v.id === active);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !current) return;
    
    const b = body.trim();
    setBody("");
    
    startTransition(async () => {
      setMessages(prev => [
        ...prev, 
        { id: `temp-${Date.now()}`, vendorId: current.id, body: b, mine: true, time: new Date() }
      ]);
      await sendMessage({ vendorId: current.id, body: b });
    });
  }

  return (
    <>
      <div className="mt-7 grid min-h-[480px] overflow-hidden rounded-2xl border border-[#e9e4de] bg-white md:grid-cols-[270px_1fr]">
        <aside className="border-b border-[#e9e4de] p-4 md:border-b-0 md:border-r">
          <div className="text-xs uppercase tracking-wider text-[#817970]">Your conversations</div>
          {threads.map(id => {
            const v = vendors.find(x => x.id === id);
            return v && (
              <button 
                key={id} 
                onClick={() => setActive(id)} 
                className={`mt-2 w-full rounded-xl p-3 text-left text-sm ${active === id ? "bg-[#f3efea]" : "hover:bg-[#faf8f5]"}`}
              >
                {v.name}
              </button>
            )
          })}
          <div className="mt-5 text-xs text-[#817970]">Start a conversation</div>
          <div className="mt-2 grid gap-1">
            {vendors.slice(0, 6).map(v => (
              <button 
                key={v.id} 
                onClick={() => setActive(v.id)} 
                className="rounded-lg px-3 py-2 text-left text-xs hover:bg-[#faf8f5]"
              >
                {v.name}
              </button>
            ))}
          </div>
        </aside>
        
        <section className="flex min-h-[480px] flex-col">
          {current ? (
            <>
              <div className="border-b border-[#e9e4de] p-5">
                <div className="serif text-xl">{current.name}</div>
                <div className="mt-1 text-xs text-[#817970]">{current.category} · {current.city}</div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-[#faf8f5] p-5">
                {messages.filter(m => m.vendorId === current.id).map((m) => (
                  <div 
                    key={m.id} 
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.mine ? "ml-auto bg-[#37312d] text-white" : "bg-white"}`}
                  >
                    {m.body}
                    <div className={`mt-1 text-[9px] ${m.mine ? "text-white/50" : "text-[#817970]"}`}>
                      {m.time.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="flex gap-2 border-t border-[#e9e4de] p-4">
                <input 
                  value={body} 
                  onChange={e => setBody(e.target.value)} 
                  disabled={isPending}
                  aria-label="Your message" 
                  placeholder="Write a message…" 
                  className="flex-1 rounded-full border border-[#e9e4de] px-4 py-3 text-sm disabled:opacity-50"
                />
                <button 
                  aria-label="Send message" 
                  disabled={isPending}
                  className="rounded-full bg-[#302d29] p-3 text-white disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center">
              <MessageCircle size={22} className="text-[#a6796f]" />
              <p className="serif mt-3 text-2xl">A good conversation can start here.</p>
              <p className="mt-2 text-sm text-[#817970]">Choose a vendor to open a thread.</p>
              <Link className="mt-4 text-xs underline" href="/vendors">Browse the marketplace</Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export function MessagesWrapper(props: Parameters<typeof MessagesClient>[0]) {
  return (
    <Suspense fallback={<div className="p-10">Loading messages…</div>}>
      <MessagesClient {...props} />
    </Suspense>
  )
}
