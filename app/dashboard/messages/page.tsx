import { prisma } from "@/lib/prisma";
import { requirePageCouple } from "@/lib/auth/guards";
import { MessagesWrapper } from "@/components/messages-client";

export default async function Messages() {
  const { couple, user } = await requirePageCouple();
  
  const dbMessages = await prisma.message.findMany({
    where: { conversation: { coupleId: couple.id } },
    include: { conversation: { include: { vendor: { include: { category: true } } } } },
    orderBy: { createdAt: "asc" }
  });
  
  const initialMessages = dbMessages.map(m => ({
    id: m.id,
    vendorId: m.conversation.vendorId,
    body: m.body,
    mine: m.senderId === user.id,
    time: m.createdAt
  }));
  
  const vendorIds = [...new Set(dbMessages.map(m => m.conversation.vendorId))];
  
  const dbVendors = await prisma.vendor.findMany({
    where: { id: { in: vendorIds } },
    include: { category: true }
  });
  
  const allVendors = await prisma.vendor.findMany({
    take: 6,
    include: { category: true },
    orderBy: { rating: "desc" }
  });
  
  const uniqueVendors = [...new Map([...dbVendors, ...allVendors].map(v => [v.id, v])).values()];
  
  const vendors = uniqueVendors.map(v => ({
    id: v.id,
    name: v.name,
    category: v.category.name,
    city: v.city
  }));
  
  return (
    <main className="mx-auto min-h-[65vh] max-w-[1100px] px-6 py-12">
      <p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">The little details, together</p>
      <h1 className="serif mt-2 text-5xl">Messages</h1>
      <MessagesWrapper initialMessages={initialMessages} vendors={vendors} />
    </main>
  );
}
