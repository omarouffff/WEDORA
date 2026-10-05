# VOWLY

VOWLY is a wedding planning MVP for couples planning celebrations in Egypt. The current build combines an editorial vendor discovery experience with local demo planning tools and a PostgreSQL/Prisma foundation.

## What's here

- Premium responsive homepage, brand pages, inspiration articles, category routes, vendor search, filters, profiles, related vendors, and Egyptian pound pricing.
- Browser-saved demo checklist, budget with category chart and over-budget state, guest list, and RSVP status counts.
- AI wedding plan endpoint with Zod validation, OpenAI integration on the server, and a deterministic local fallback.
- PostgreSQL Prisma schema covering identity, weddings, vendors, tasks, budgets, guests, RSVPs, websites, bookings, favorites, messaging, payments, notifications, and recommendations.
- Metadata, Open Graph defaults, robots, and sitemap.

Planning data on the current demo dashboard is stored in that browser's local storage. It does not sync between devices or users. Supabase packages and environment placeholders are included, but authentication, role guards, and storage uploads still need to be connected before production use. Marketplace sample vendors are fictional and live in `lib/data.ts` so the catalog can be browsed without a database.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS 4, Prisma, PostgreSQL, Supabase client packages, Zod, OpenAI server SDK, Recharts, Lucide, and Framer Motion.

## Run locally

1. Install Node.js 20+ and PostgreSQL 15+.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and `DIRECT_URL` to your PostgreSQL database.
3. Install packages: `npm install`.
4. Generate Prisma client: `npm run db:generate`.
5. Create/update database tables: `npm run db:push`.
6. Seed categories: `npm run db:seed`.
7. Start the app: `npm run dev`.

The public experience and local planning screens can run without Supabase, OpenAI, payments, email, or maps. Without `OPENAI_API_KEY`, the AI planner returns a practical local plan. Add `OPENAI_API_KEY` to `.env` to enable server-side OpenAI generation.

## Environment variables

See `.env.example` for PostgreSQL, Supabase, OpenAI, Google Maps, Paymob, Stripe, and Resend integration keys. Keep secrets on the server; only Supabase URL and anon key are intended to be public.

## Database

The Prisma schema is `prisma/schema.prisma`. `npm run db:push` is convenient for local development. For production, generate and review Prisma migrations, then apply with `npx prisma migrate deploy`. The seed command creates the marketplace category records; the fictional demo vendor catalog is currently static data so discovery remains available before a database is connected.

## Quality checks

- `npm run typecheck`
- `npm run build`
- `npx prisma validate` (requires `DATABASE_URL` and `DIRECT_URL`)

## Current MVP boundaries

Authentication and server-side authorization, persistent couple-specific records, booking and message workflows, live RSVP writes, vendor/admin management, payments, transactional email, Google Maps, and production migration coverage are not connected yet. The corresponding database models and environment hooks provide the foundation. Do not deploy this demo as a production application until these flows and security controls are implemented.
