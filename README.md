# ClinicBook

> **Calendly for Doctors** — online appointment scheduling SaaS.
> Doctors get a shareable link; patients book in under 60 seconds with no account.

This is the full-stack web application. The product spec lives in
[`Skills/ClinicBook_Project_Document.md`](Skills/ClinicBook_Project_Document.md).

## Tech stack

| Layer    | Choice                                              |
| -------- | --------------------------------------------------- |
| Framework| Next.js 15 (App Router) + React 19                  |
| UI       | ShadCN UI (Radix + Tailwind CSS)                    |
| Backend  | Next.js Route Handlers + a modular service layer    |
| ORM      | Prisma                                              |
| Database | Supabase Postgres                                   |
| Auth     | Supabase Auth (`@supabase/ssr`)                     |
| Validation | Zod                                               |

> The original spec proposed FastAPI/Python; this implementation uses a unified
> TypeScript stack (Next.js + Prisma + Supabase) per the build decision.

## Architecture

```
src/
├── app/                      # Next.js routes
│   ├── (auth)/               # login, register, auth server actions
│   ├── (dashboard)/          # protected doctor portal
│   ├── book/[slug]/          # public booking page (no auth)
│   ├── cancel/[token]/       # one-click cancellation
│   └── api/                  # REST route handlers (thin — delegate to modules)
├── modules/                  # modular backend (domain logic)
│   ├── auth/                 # registration (Supabase + profile)
│   ├── doctors/              # profile service + zod schemas
│   ├── availability/         # weekly rules + blocked slots
│   ├── booking/              # slot computation + booking/cancel/waitlist
│   ├── appointments/         # doctor-side appointment management
│   ├── analytics/            # dashboard summary stats
│   ├── notifications/        # SMS/email (logged; pluggable providers)
│   └── billing/              # plan config + gating
├── components/               # UI (ui/ = ShadCN primitives, feature folders)
├── lib/                      # prisma, supabase clients, auth, utils, errors
└── middleware.ts             # session refresh + route protection
prisma/
├── schema.prisma             # all tables (doctors, appointments, …)
└── seed.ts                   # demo doctor + availability
```

Each domain is a **module** with a `*.service.ts` (logic) and `*.schema.ts`
(Zod validation). API route handlers stay thin: parse → call service → respond.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in, at minimum, the Supabase values (`DATABASE_URL`, `DIRECT_URL`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`) from your Supabase project settings.

Twilio/Resend/Stripe keys are optional — without them, SMS/email are logged to
the console (stubbed) so the booking flow still works end to end.

### 3. Set up the database

```bash
npm run prisma:generate   # generate the Prisma client
npm run prisma:push       # push the schema to Supabase Postgres
npm run db:seed           # optional: seed the demo doctor
```

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

- **Landing / pricing:** `/`
- **Register a doctor:** `/register`
- **Doctor dashboard:** `/dashboard`
- **Public booking page:** `/book/dr-sarah-johnson` (after seeding)

## Key flows

- **Doctor:** register → set weekly availability + breaks → share booking link →
  manage appointments (complete / no-show / cancel) → view analytics.
- **Patient:** open `/book/[slug]` → pick date → pick a live slot → fill the
  intake form → confirmed, with a one-click cancel link.
- **Plan gating:** the free plan caps bookings per day (enforced in
  `bookingService.createBooking`).
- **Double-booking:** prevented by a DB unique constraint on
  `(doctorId, appointmentDate, startTime)` plus a pre-check.

## Scripts

| Script                 | Purpose                          |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the dev server             |
| `npm run build`        | Generate Prisma client + build   |
| `npm run typecheck`    | `tsc --noEmit`                   |
| `npm run prisma:push`  | Push schema to the database      |
| `npm run prisma:studio`| Browse data in Prisma Studio     |
| `npm run db:seed`      | Seed the demo doctor             |

## Roadmap (from the spec)

Implemented (MVP): auth, profile, availability + blocks, public booking,
real-time slots, cancellation, doctor dashboard, analytics, plan gating,
notification logging, waitlist join.

Next: live Twilio/Resend/Stripe wiring, telehealth video rooms (Daily.co),
24-hour reminder cron, waitlist auto-invite expiry, AI no-show prediction.
