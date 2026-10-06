import type { NextConfig } from "next";
// Keep generated build output out of OneDrive's synchronised `.next` cache,
// which can be hydrated as reparse points and break Next's manifest reads.
const config: NextConfig = { distDir: ".next-final-audit", images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] } };
export default config;
