# ClinicBook — Full Product Blueprint & Market Strategy

> **Purpose of this document:** Research the real needs of every user of a
> doctor-scheduling SaaS, analyze how the best products in the world solve them,
> and define the **complete screen inventory + feature set** ClinicBook must ship
> to compete globally and beat incumbents. This is the source of truth that the
> implementation follows.
>
> *Companion to [ClinicBook_Project_Document.md](ClinicBook_Project_Document.md).
> Stack realized in TypeScript: Next.js + ShadCN + Prisma + Supabase.*

---

## 1. Who uses this product, and what do they actually need?

We design for **four** distinct users. Each has different jobs-to-be-done.

### 1.1 The Patient (highest volume, lowest tolerance for friction)
What they want:
- Book in **under 60 seconds**, on a phone, **without creating an account**.
- See **real, accurate** availability — never "call to confirm."
- Get an **instant confirmation** (SMS + email) and a calendar invite.
- **Reschedule or cancel** in one tap, no phone calls.
- A **reminder** so they don't forget (and the clinic doesn't lose the slot).
- For telehealth: a **video link that just works**.
- Trust signals: doctor photo, specialty, reviews, clinic address, "verified."

Pain we remove: hold music, phone tag, double data entry, no-show guilt,
uncertainty ("did my booking go through?").

### 1.2 The Doctor / Solo Provider (the paying customer)
What they want:
- **10-minute setup** — live without IT help.
- Total control of **availability**: days, hours, slot length, breaks, buffers,
  multiple locations, time off.
- Different **appointment types/services** (consult 15m, checkup 30m, procedure
  60m) — each with its own duration, price, and intake questions.
- A **dashboard** that answers "what's my day look like?" at a glance.
- **Fewer no-shows** (reminders, deposits, waitlist auto-fill).
- A lightweight **patient record** (history, notes, contact) — a mini-EHR/CRM.
- **Analytics** that prove ROI: bookings, revenue, no-show rate, busiest times.
- **Predictable, flat pricing** — not per-booking anxiety (vs Zocdoc).
- To look **professional** to patients (branded booking page, custom domain).

### 1.3 The Clinic Admin / Front-desk (multi-provider)
What they want:
- Manage **many providers** under one account.
- A **unified calendar** across providers + rooms/resources.
- Assign bookings, handle walk-ins, manage cancellations/waitlist.
- **Aggregate reporting** and **billing** for the whole clinic.
- **Roles & permissions** (admin vs provider vs front-desk).

### 1.4 The Platform Owner (us)
What we need to win: low-friction onboarding, high activation, low churn,
strong word-of-mouth (every booking page is a marketing surface), and
defensible data lock-in (history + analytics + branded link).

---

## 2. Competitive analysis — how the best solve it, and the gaps we exploit

| Product | Strength | Weakness ClinicBook exploits |
|---|---|---|
| **Zocdoc** | Patient marketplace, insurance search | $30–$140 **per booking** (cost anxiety), enterprise-tilted, opaque pricing |
| **Calendly** | Best-in-class scheduling UX | Not healthcare: no intake, no HIPAA, no patient records, no reminders tuned for clinics |
| **SimplePractice / Jane** | Full practice mgmt + EHR | Heavy, expensive, steep setup; overkill for solo/small |
| **Acuity / Squarespace** | Flexible scheduling + payments | Generic; weak healthcare workflows, no telehealth-first |
| **Cal.com** | Open-source, dev-friendly | Not healthcare-specific; self-host complexity |
| **Practo** | Strong in India/SEA | Limited US/UK; marketplace lock-in |

**Where ClinicBook wins (positioning): "Calendly-simple, healthcare-smart,
flat-priced."** The sweet spot is the **90% of providers who are solo or small**
— too big for a generic scheduler, too small for SimplePractice. Concretely:

1. **Flat monthly pricing** (kills per-booking anxiety).
2. **10-minute setup** with an onboarding wizard.
3. **Healthcare-native**: intake forms, services, telehealth, reminders, deposits.
4. **No-show recovery suite**: reminders + deposits + **waitlist auto-fill** +
   (later) AI risk scoring — most affordable tools don't do this.
5. **Branded, beautiful booking page** + custom domain → the doctor looks great.
6. **Patient self-service** (reschedule/cancel/waitlist) with **no account** —
   zero friction, fewer front-desk calls.
7. **Global-ready**: timezones, multi-currency, multi-language, SMS via local
   providers, GDPR + HIPAA-aware data handling.

---

## 3. Design & UX principles (how we present it well)

1. **Patient flow is sacred** — every extra tap loses bookings. Mobile-first,
   3 steps max: pick time → details → confirmed.
2. **Progressive disclosure** for doctors — simple defaults, power options one
   click deeper. Don't overwhelm on day one (hence the onboarding wizard).
3. **Trust by design** — confirmations, statuses, and "what happens next" are
   always explicit. Empty states teach the next action.
4. **One consistent design system** (ShadCN + a calm clinical palette: sky-blue
   primary, generous whitespace, rounded cards).
5. **Speed = product** — server components for data, optimistic UI for actions,
   skeletons over spinners.
6. **Accessibility** — keyboard, contrast, ARIA; healthcare must be inclusive.

---

## 4. Complete screen inventory (the full SaaS)

Legend: ✅ built · 🟦 this build wave · ⬜ roadmap

### A. Public / Patient
1. ✅ Landing + value prop
2. 🟦 Pricing (dedicated page)
3. ✅ Public booking page `/book/[slug]`
4. ✅ Booking confirmation (inline)
5. ✅ Cancellation `/cancel/[token]`
6. 🟦 **Reschedule** `/reschedule/[token]`
7. 🟦 **Patient portal** — look up & manage bookings by phone/email
8. 🟦 Waitlist join (UI on booking page)
9. ⬜ Doctor directory / search (marketplace)
10. ⬜ Reviews & ratings

### B. Auth & Onboarding
11. ✅ Login
12. ✅ Register
13. 🟦 **Forgot / reset password**
14. 🟦 **Onboarding wizard** (profile → availability → services → share link)

### C. Doctor Portal
15. ✅ Dashboard / Today
16. ✅ Appointments list (tabs: upcoming/history/all)
17. 🟦 **Appointment detail** (drawer: patient, notes, status, reschedule)
18. 🟦 **Calendar** (week view, color-coded)
19. ✅ Availability builder (+ breaks)
20. ✅ Blocked dates / time off
21. 🟦 **Services / Appointment types** (duration, price, intake, telehealth)
22. 🟦 **Patients (CRM)** — list + detail with visit history & notes
23. 🟦 **Analytics / Reports** — charts (bookings, revenue, no-shows, peak times)
24. 🟦 **Waitlist management**
25. ✅ Settings → Profile
26. 🟦 Settings → **Booking page customization** (welcome msg, branding, policies)
27. 🟦 Settings → **Notifications & reminders** (channels, timing, templates)
28. 🟦 Settings → **Billing & subscription** (plan, usage, upgrade)
29. ⬜ Settings → Integrations (Google/Outlook calendar, Stripe, Zoom)
30. ⬜ Settings → Team & roles (multi-provider)
31. ⬜ Notifications inbox / activity feed

### D. Clinic Admin (multi-provider)
32. ⬜ Clinic dashboard
33. ⬜ Providers management
34. ⬜ Resources/rooms
35. ⬜ Aggregate reports & billing

> This wave (🟦) takes ClinicBook from "MVP" to a **professional, full-featured
> product** a real solo/small clinic can run on. The ⬜ items are the
> post-traction roadmap (marketplace, multi-provider, integrations).

---

## 5. Feature → solution mapping (the "how")

| Need | ClinicBook solution | Screen(s) |
|---|---|---|
| Book fast, no account | 3-step flow, live slots | Public booking |
| Right slot lengths | Per-service durations + buffers | Services, Availability |
| Don't forget | SMS + email + 24h reminder | Notification settings |
| Fewer no-shows | Deposits + waitlist auto-fill + (AI) | Services, Waitlist |
| Manage my day | Today + Calendar + detail drawer | Dashboard, Calendar |
| Know my patients | Lightweight CRM + notes + history | Patients |
| Prove ROI | Analytics with charts | Reports |
| Look professional | Branded booking page + custom domain | Booking customization |
| Predictable cost | Flat plans, transparent upgrade | Billing |
| Go global | Timezone, currency, language, local SMS | Settings (global) |

---

## 6. Data model additions for the full product

- **Service / AppointmentType**: `{ name, durationMin, priceCents, currency,
  isTelehealth, intakeNote, color, isActive }` → bookings reference a service.
- **Doctor settings**: booking-page fields (`welcomeMessage`, `brandColor`,
  `cancellationPolicy`, `currency`, `language`), reminder prefs
  (`reminderHoursBefore`, `smsEnabled`, `emailEnabled`), `requireDeposit`.
- (Roadmap) **TeamMember / Role**, **Resource/Room**, **Review**, **Integration**.

---

## 7. Go-to-market & global standing (summary)

- **Wedge:** solo doctors + small clinics in US/UK, then SEA.
- **Growth loops:** every branded booking page markets us; referral credits;
  ProductHunt + AppSumo lifetime deal; SEO ("Zocdoc alternative", "free clinic
  scheduling"); content/YouTube setup tutorials.
- **Moat:** switching cost (history + analytics + patients-know-the-link),
  no-show-recovery suite affordability, and a delightful patient experience.
- **Trust/compliance:** HIPAA-aware + GDPR; encrypted at rest (Supabase),
  audit logs, BAA-capable SMS/email providers, single-use cancel tokens.

---

## 8. Implementation order (this wave)

1. Schema: Service + settings fields → `prisma db push`.
2. Patients CRM (service + API + list/detail).
3. Analytics/Reports (charts).
4. Calendar (week view).
5. Services management.
6. Waitlist management.
7. Settings: booking customization, notifications, billing.
8. Onboarding wizard, password reset, patient portal + reschedule.
9. Expand nav, wire routes.
10. Build + run verification.

*Document owner: ClinicBook. Revision 1 — full-product blueprint.*
