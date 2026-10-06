import type {Metadata} from "next";
import "./globals.css";
import { Header, Footer } from "@/components/header";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL("https://wedora.eg"),
  title: { default: `${BRAND.name} — ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description: BRAND.description,
  openGraph: { title: `${BRAND.name} — ${BRAND.tagline}`, description: "A thoughtful way to plan your wedding in Egypt.", type: "website", locale: "en_EG", siteName: BRAND.name },
  twitter: { card: "summary_large_image", title: `${BRAND.name} — ${BRAND.tagline}`, description: BRAND.description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Header />{children}<Footer /></body></html>;
}
