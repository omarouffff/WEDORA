import { prisma } from "@/lib/prisma";
import { requirePageCouple } from "@/lib/auth/guards";
import { AIPlanner } from "@/components/ai-planner";

export default async function AIPlannerPage() {
  const { wedding } = await requirePageCouple();
  const [budget, guestSummary] = await Promise.all([
    prisma.weddingBudget.findUnique({ where: { weddingId: wedding.id }, select: { total: true } }),
    prisma.guest.aggregate({ where: { weddingId: wedding.id }, _sum: { partySize: true } }),
  ]);
  const guestCount = wedding.guestCount ?? guestSummary._sum.partySize;

  return <AIPlanner
    initialBudget={budget ? Number(budget.total) : null}
    initialGuestCount={guestCount && guestCount > 0 ? guestCount : null}
    initialCity={wedding.city}
    weddingDate={wedding.date?.toISOString().slice(0, 10) ?? null}
  />;
}
