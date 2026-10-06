import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { generatePlan } from "@/services/ai";
import { CITIES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth/session";
import { limitByIp } from "@/lib/rate-limit";

const requestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  budget: z.number().finite().positive().max(1_000_000_000),
  guestCount: z.number().int().min(1).max(5000),
  city: z.enum(CITIES),
  style: z.string().trim().min(2).max(60),
  priorities: z.string().trim().max(1000).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to use your planning companion." }, { status: 401 });
  if (user.role !== "COUPLE") return NextResponse.json({ error: "This planning tool is for couples." }, { status: 403 });
  const limited = await limitByIp("ai-plan", 6, 60 * 60 * 1000, user.id);
  if (limited) return NextResponse.json({ error: limited }, { status: 429 });
  try {
    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Please check your wedding details and try again." }, { status: 400 });
    const data = parsed.data;
    return NextResponse.json({ plan: await generatePlan(data), mode: process.env.OPENAI_API_KEY ? "openai" : "demo" });
  } catch (error) {
    console.error("[ai plan error]", error);
    return NextResponse.json({ error: "We couldn't prepare a plan just now. Please try again." }, { status: 500 });
  }
}
