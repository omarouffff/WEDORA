import type {MetadataRoute} from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://wedora.eg";
  const vendors = process.env.DATABASE_URL ? await prisma.vendor.findMany({ where: { approved: true }, select: { slug: true, updatedAt: true } }) : [];
  return ["", "about", "services", "vendors", "blog", "contact"].map((path) => ({ url: `${base}/${path}`, lastModified: new Date() }))
    .concat(vendors.map((vendor) => ({ url: `${base}/vendors/${vendor.slug}`, lastModified: vendor.updatedAt })));
}
