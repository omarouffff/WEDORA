# WEDORA

WEDORA is an Egypt-focused wedding planning and vendor marketplace MVP. Couples can organize tasks, budget, guests and RSVPs, shortlist vendors, request bookings, message vendors, and publish a personal wedding page. Vendor and admin workspaces use server-side role checks.

## Stack and architecture

- Next.js App Router, React, TypeScript, Tailwind CSS
- PostgreSQL with Prisma migrations and seed data
- Signed, HTTP-only session cookies with database-backed role and suspension checks
- Server Actions validated with Zod; business calculations live in `lib/calculations.ts`
- Server-side OpenAI integration with deterministic mock fallback
- Resend-compatible email abstraction with local console fallback
- Paymob/Stripe integration keys are reserved; payment processing is not enabled

## Features

- Public editorial homepage, vendor search and profiles, service/category pages, blog, sitemap and robots rules
- Couple dashboard, planner, budget, guest list, favorites, bookings, messages, AI planner and wedding website editor
- Published wedding sites at `/w/[slug]` with persistent RSVP submission
- Vendor dashboard and booking request review
- Admin overview, vendor approval and couple directory
- Fictional Egyptian seed vendors in Cairo, Giza and Alexandria

## Local setup

1. Install Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env`. Set a PostgreSQL `DATABASE_URL` and `DIRECT_URL`, plus a random `AUTH_SECRET` of at least 32 characters.
3. For the bundled local PostgreSQL helper, run `npm run db:local` in a separate terminal and use the local URLs from `.env.example`.
4. Run `npm run db:deploy` to apply checked-in migrations. For a new development database, `npx prisma migrate dev` may be used to create migrations.
5. Seed demo categories and fictional marketplace profiles with `npm run db:seed`.
6. Start the app with `npm run dev`.

## Environment variables

See `.env.example`. `DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET` are required for production. `OPENAI_API_KEY` enables hosted AI generation; without it the planner uses the local deterministic response. `RESEND_API_KEY` and `EMAIL_FROM` enable email delivery; local mail is written to the server console. Supabase, Google Maps, Paymob and Stripe settings are integration hooks and are not required for current flows. Never expose service-role or provider secrets to the browser.

## Database operations

- Schema: `prisma/schema.prisma`
- Checked-in migration: `prisma/migrations/`
- Apply production migrations: `npm run db:deploy`
- Seed: `npm run db:seed`
- Do not use `npm run db:reset` against any database containing user data.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run test
npm run build
npx prisma validate
npx prisma migrate status
```

## Deployment notes and current limits

Configure a managed PostgreSQL database, a unique 32+ character `AUTH_SECRET`, a stable `NEXT_PUBLIC_APP_URL`, and the production sender/domain before deployment. Apply migrations before starting new application instances. Local in-memory rate limits are per process and should be replaced with a shared store for multi-instance deployments. Supabase Auth/Storage, real-time messaging, payments, maps, and scheduled deadline notifications are not active integrations yet. Review the deployment domain in `app/layout.tsx`, `app/robots.ts`, and `app/sitemap.ts` before publishing under a different hostname.
