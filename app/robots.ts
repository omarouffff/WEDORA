import type {MetadataRoute} from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/vendor/", "/admin/"] }, sitemap: "https://wedora.eg/sitemap.xml" }; }
