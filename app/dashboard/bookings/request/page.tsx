import { prisma } from "@/lib/prisma";
import { BookingRequestWrapper } from "@/components/booking-request-client";
import { requirePageCouple } from "@/lib/auth/guards";

export default async function BookingRequest() {
  await requirePageCouple();
  const vendors = await prisma.vendor.findMany({
    where: { approved: true },
    include: { category: true }
  });
  
  const mappedVendors = vendors.map(v => ({
    id: v.id,
    name: v.name,
    category: v.category.name,
    price: Number(v.startingPrice)
  }));
  
  return <BookingRequestWrapper vendors={mappedVendors} />;
}
