"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Save, Heart, Loader2 } from "lucide-react";
import { saveWebsite } from "@/actions/website";

const templates = [
  { id: "CLASSIC_LUXURY", name: "Classic Luxury", color: "#eee4db" },
  { id: "MODERN_MINIMAL", name: "Modern Minimal", color: "#e8e8e5" },
  { id: "ROMANTIC_GARDEN", name: "Romantic Garden", color: "#e3eadf" },
];

type WebsiteData = {
  names: string;
  date: string;
  slug: string;
  story: string;
  template: string;
  published: boolean;
};

export function WebsiteClient({ initialData }: { initialData: WebsiteData }) {
  const [data, setData] = useState<WebsiteData>(initialData);
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function update(k: keyof WebsiteData, v: string | boolean) {
    setData((x) => ({ ...x, [k]: v }));
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      const res = await saveWebsite(data);
      if (res?.ok === false) {
        alert(res.error || "Could not save website");
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <>
      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        <section className="rounded-2xl border border-[#e9e4de] bg-white p-6">
          <div className="grid gap-4">
            <label className="text-xs">
              Your names
              <input
                value={data.names}
                onChange={(e) => update("names", e.target.value)}
                disabled={isPending}
                className="mt-2 w-full rounded-xl border border-[#e9e4de] px-4 py-3 text-sm disabled:opacity-50"
              />
            </label>
            <label className="text-xs">
              Wedding date
              <input
                type="date"
                value={data.date}
                onChange={(e) => update("date", e.target.value)}
                disabled={isPending}
                className="mt-2 w-full rounded-xl border border-[#e9e4de] px-4 py-3 text-sm disabled:opacity-50"
              />
            </label>
            <label className="text-xs">
              Your website address
              <div className="mt-2 flex items-center rounded-xl border border-[#e9e4de] px-3 text-sm">
                <span className="text-[#817970]">/w/</span>
                <input
                  value={data.slug}
                  onChange={(e) =>
                    update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                  }
                  disabled={isPending}
                  className="min-w-0 flex-1 py-3 outline-none disabled:opacity-50"
                />
              </div>
            </label>
          <label className="text-xs">
            Your story
              <textarea
                value={data.story}
                onChange={(e) => update("story", e.target.value)}
                disabled={isPending}
                className="mt-2 min-h-28 w-full rounded-xl border border-[#e9e4de] px-4 py-3 text-sm disabled:opacity-50"
              />
          </label>
          <label className="flex items-start gap-3 rounded-xl bg-[#faf8f5] p-4 text-xs leading-5 text-[#625d56]">
            <input type="checkbox" checked={data.published} onChange={(e) => update("published", e.target.checked)} disabled={isPending} className="mt-0.5 accent-[#a6796f]" />
            <span><b className="block text-sm text-[#302d29]">Publish this website</b>Make the invitation and RSVP form available to anyone with your link.</span>
          </label>
          </div>
          <div className="mt-5 text-xs">Choose a look</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => update("template", t.id)}
                disabled={isPending}
                className={`rounded-xl border p-2 text-left disabled:opacity-50 ${
                  data.template === t.id
                    ? "border-[#a6796f] ring-1 ring-[#a6796f]"
                    : "border-[#e9e4de]"
                }`}
              >
                <div style={{ background: t.color }} className="h-12 rounded-lg" />
                <span className="mt-2 block text-[10px]">{t.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={handleSave}
              disabled={isPending || saved}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#302d29] px-5 py-3 text-sm text-white disabled:opacity-50"
            >
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saved ? "Saved" : "Save website"}
            </button>
            {data.published && saved && data.slug ? <Link aria-label="Open published wedding website" href={`/w/${data.slug}`} className="flex items-center justify-center gap-2 rounded-full border border-[#e9e4de] px-4 text-sm"><ExternalLink size={15} /></Link> : <span title="Save and publish to open the public page" className="flex cursor-not-allowed items-center justify-center rounded-full border border-[#e9e4de] px-4 text-[#b7afa7]"><ExternalLink size={15} /></span>}
          </div>
        </section>

        <div className="overflow-hidden rounded-2xl border border-[#e9e4de] bg-white shadow-sm">
          <div
            style={{ background: templates.find((x) => x.id === data.template)?.color }}
            className="relative flex min-h-[440px] flex-col items-center justify-center px-8 py-16 text-center transition-colors duration-500"
          >
            <div className="absolute inset-3 border border-[#817970]/25" />
            <Heart size={17} className="text-[#a6796f]" />
            <div className="mt-8 text-[10px] uppercase tracking-[.28em] text-[#817970]">
              Together with our families
            </div>
            <h2 className="serif mt-4 text-5xl md:text-6xl">{data.names || "Your names"}</h2>
            <div className="mt-5 text-xs uppercase tracking-[.22em] text-[#625d56]">
              Joyfully invite you to celebrate
            </div>
            <div className="mt-4 text-sm text-[#817970]">
              {data.date
                ? new Date(`${data.date}T12:00:00`).toLocaleDateString("en-EG", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Your wedding date"}
            </div>
          </div>
          <div className="px-8 py-10 text-center">
            <div className="text-[10px] uppercase tracking-[.2em] text-[#a6796f]">Our story</div>
            <p className="serif mx-auto mt-3 max-w-xl text-xl leading-8">{data.story}</p>
            <div className="mt-8 rounded-xl bg-[#faf8f5] p-5">
              <div className="serif text-xl">Will you join us?</div>
              <p className="mt-2 text-xs text-[#817970]">Kindly reply by March 1, 2027</p>
              <span className="mt-4 inline-block rounded-full bg-[#302d29] px-6 py-3 text-xs text-white">RSVP preview</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
