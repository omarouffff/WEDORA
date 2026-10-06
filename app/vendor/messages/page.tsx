import { prisma } from "@/lib/prisma";
import { requirePageVendor } from "@/lib/auth/guards";
import { VendorMessages } from "@/components/vendor-messages";

export default async function VendorMessagesPage() {
  const { vendor, user } = await requirePageVendor();
  const conversations = await prisma.conversation.findMany({
    where: { vendorId: vendor.id },
    include: { couple: { include: { user: { include: { profile: true } }, wedding: true } }, messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { lastMessageAt: "desc" },
  });
  const threads = conversations.map((conversation) => ({
    id: conversation.id,
    couple: conversation.couple.user.profile?.name ?? "Couple",
    wedding: conversation.couple.wedding?.title ?? "Wedding planning",
    messages: conversation.messages.map((message) => ({ id: message.id, body: message.body, mine: message.senderId === user.id, time: message.createdAt.toISOString() })),
  }));
  return <main className="mx-auto max-w-5xl px-5 py-10 md:px-8"><p className="text-xs uppercase tracking-[.2em] text-[#a6796f]">The little details, together</p><h1 className="serif mt-2 text-4xl">Messages</h1><p className="mt-2 text-[#817970]">Talk with couples who are planning a celebration.</p><VendorMessages threads={threads}/></main>;
}
