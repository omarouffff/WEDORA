# VOWLY — Master Implementation Plan

**Brand:** VOWLY  
**Tagline:** *"Plan Your Perfect Day."*  
**Target Market:** Egypt (Currency: EGP, English UI with i18n/RTL readiness)  
**Aesthetic:** Luxury Wedding Magazine + Modern SaaS Marketplace (Ivory/Warm White, Champagne/Soft Rose accents, Editorial Typography, Crisp Whitespace, Glassmorphism, Micro-animations)

---

## 1. Architecture Overview

```
├── app/
│   ├── (auth)/                 # Login, Register, Forgot Password, Reset Password
│   ├── (public)/               # Homepage, About, Services, Categories (/venues, /photographers...), Blog, Contact
│   ├── (marketplace)/          # /vendors, /vendors/[id]
│   ├── dashboard/              # Couple Dashboard (/dashboard, /planner, /budget, /guests, /website, /messages, /favorites, /ai-planner)
│   ├── vendor/dashboard/       # Vendor Management (/overview, /bookings, /services, /portfolio, /availability, /reviews, /analytics)
│   ├── admin/                  # Admin Control (/users, /vendors, /bookings, /categories, /reviews, /blog, /analytics)
│   ├── w/[slug]/               # Public couple wedding website (/w/omar-and-sara) with live RSVP
│   ├── api/                    # REST / Server endpoints (Auth, AI, Bookings, RSVP, Search, etc.)
│   └── layout.tsx & globals.css
├── components/
│   ├── ui/                     # Accessible UI kit (Buttons, Inputs, Cards, Badges, Modals, Toasts, Skeletons)
│   ├── layout/                 # Navbar, Footer, Dashboard Sidebar, Vendor Sidebar, Admin Sidebar
│   ├── marketplace/            # VendorCard, FilterPanel, SearchBar, CompareModal
│   ├── couple/                 # TaskList, BudgetCharts, GuestTable, WebsitePreview, AIPlanner
│   ├── vendor/                 # AnalyticsCards, BookingActions, ServiceManager
│   └── website-templates/      # Classic Luxury, Modern Minimal, Romantic Garden
├── lib/
│   ├── prisma.ts               # Prisma Client singleton
│   ├── auth.ts                 # Server-side auth & session management (Supabase / local JWT session fallback)
│   ├── validations/            # Zod schemas for all forms & API payloads
│   └── utils.ts                # Formatting (EGP, dates, currency), class names
├── services/
│   ├── ai/                     # OpenAI integration with deterministic local fallback
│   ├── payments/               # Paymob / Stripe abstraction layer
│   ├── email/                  # Resend abstraction layer
│   └── maps/                   # Google Maps / Egyptian location coordinates
├── prisma/
│   ├── schema.prisma           # Full Prisma schema with all 27 models
│   ├── schema.postgresql.prisma# Production Postgres schema
│   └── seed.ts                 # Rich Egyptian seed data (Cairo, Giza, Alex vendors, services, packages, reviews)
└── types/                      # Shared TypeScript models and enums
```

---

## 2. Planned Subsystems & Execution Phases

- **Phase 1: Setup & Environment**: Initialize package.json, TypeScript, Tailwind config, Next.js 14, PostCSS, install dependencies.
- **Phase 2: Design Tokens & Base UI**: Setup custom luxury color palette (warm ivory `#FAF8F5`, champagne `#D4AF37`/`#C5A880`, rose `#E8D8CE`, stone `#1C1917`), font styling, glass card components, buttons, badges, inputs.
- **Phase 3: Database & Models**: 27 Prisma models (User, Couple, Wedding, Vendor, VendorCategory, VendorService, VendorPortfolio, VendorReview, VendorAvailability, VendorBooking, FavoriteVendor, WeddingTask, BudgetCategory, WeddingBudget, BudgetTransaction, Guest, GuestGroup, RSVP, WeddingWebsite, WeddingWebsiteSection, Notification, Conversation, Message, Payment, Invoice, AIRecommendation) + seed data generator with realistic Egyptian vendors.
- **Phase 4: Authentication & Roles**: Supabase-ready auth with robust server-side JWT session fallback, role guards (`COUPLE`, `VENDOR`, `ADMIN`), login/register/logout.
- **Phase 5: Public Pages**: Editorial Homepage, About, Services, 9 Category landing pages (`/venues`, `/photographers`, `/decorators`, `/makeup`, `/catering`, `/flowers`, `/dresses`, `/music`, `/transportation`), Blog listing & article reader, Contact.
- **Phase 6 & 7: Vendor Marketplace & Profile**: Live search, category filter, city filter (Cairo, Giza, Alexandria), price range in EGP, ratings, verified badges, vendor detail view with portfolio gallery, package pricing, booking modal, reviews, similar vendors.
- **Phase 8: Couple Dashboard**: Live countdown ("182 Days Until Your Wedding"), planning progress %, budget metrics (Total, Spent, Remaining in EGP), guest RSVP summary, quick actions, recent bookings, AI recommendations.
- **Phase 9: Wedding Planner**: Task manager with add/edit/delete, categorized checklist (Venue, Catering, Music, etc.), priority badges, overdue alerts, auto progress calculation.
- **Phase 10: Budget Planner**: Interactive Recharts breakdown, add/edit expenses, category allocations, over-budget warning banner.
- **Phase 11: Guest Management**: Guest list with group tagging, RSVP status tracking (Confirmed, Pending, Declined), meal preferences, guest counter.
- **Phase 12 & 13: Wedding Website Builder & Live RSVP**: Couple builder with 3 distinct luxury templates (`Classic Luxury`, `Modern Minimal`, `Romantic Garden`), customizable story, schedule, gallery, live `/w/[slug]` public page, working RSVP form syncing directly to guest list.
- **Phase 14 & 15: Vendor Dashboard & Bookings**: Vendor analytics (views, requests, revenue), booking request management (accept, reject, change), portfolio and service management.
- **Phase 16: Messaging System**: Real-time ready chat between couples and vendors with conversation list, message thread, unread counts.
- **Phase 17: Notifications**: Notification bell with live unread count, activity triggers (booking status, new message, task deadline, RSVP).
- **Phase 18 & 19: AI Wedding Planner & Smart Recommendations**: Conversational AI planner generating budget breakdown, timeline, vendor checklist, cost-saving tips tailored to Cairo/Giza/Alexandria, with explainable "Because you liked..." suggestions.
- **Phase 20: Admin Dashboard**: Platform overview, vendor verification toggles, booking metrics, blog post management, category control.
- **Phase 21: SEO & Metadata**: Dynamic OpenGraph tags, sitemap, robots.txt, structured data.
- **Phase 22 - 24: Testing, Polish & Production Review**: End-to-end route check, TypeScript verification, Next.js build validation, responsive testing.
