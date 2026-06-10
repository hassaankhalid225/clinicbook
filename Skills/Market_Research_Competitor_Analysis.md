# Market Research — Multi-Tenant Doctor Software & Competitor Analysis

> Researched June 2026 (web sources cited inline). Purpose: identify how the
> biggest doctor-booking/practice platforms work, list their features so we can
> cover **100% of them**, and capture current buyer trends. Drives the v2
> implementation: module-based pricing, Stripe payments, receipts, and queue
> management.

---

## 1. How big multi-tenant doctor software works

All major players follow the same structural pattern we now implement:

1. **Tenant = practice/provider.** Every doctor (or clinic) is an isolated
   tenant; patients interact with a tenant's public surface (profile/booking
   page) without needing accounts. Data is isolated per tenant; the platform
   admin operates across tenants.
2. **Two-sided model.** A marketplace/discovery side for patients (search,
   profiles, reviews, instant booking) + a SaaS side for providers (calendar,
   EHR-lite records, billing, reminders, analytics).
3. **Modular monetization.** Providers pay either per-booking (Zocdoc) or a
   flat subscription with add-on modules/tiers (SimplePractice, Jane, Practo
   Ray). Add-on modules (telehealth, insurance billing, AI notes) are upsells.
4. **Payments are embedded.** Card-on-file, online prepayment at booking,
   deposits to kill no-shows, and receipts/invoices for patients.

## 2. Biggest competitors

### Zocdoc — the biggest patient-acquisition marketplace (US)
- Model: free to list; **pay-per-new-patient-booking** (historically ~$35–$110
  by specialty/location, charged even if the patient no-shows)
  ([Zocdoc pricing help](https://www.zocdoc.com/provider-help/en/articles/10859404-understanding-zocdoc-pricing-and-billing),
  [Emitrr analysis](https://emitrr.com/blog/zocdoc-pricing/),
  [Fierce Healthcare](https://www.fiercehealthcare.com/practices/some-new-york-doctors-unhappy-about-zocdoc-s-new-pricing-model-company-says-it-was)).
- Features: marketplace search (specialty/location/insurance), verified
  reviews, real-time availability synced to EHRs, digital **intake** (insurance
  cards + forms before the visit), automated reminders, HIPAA-compliant video
  visits, practice dashboard with booking-source reporting
  ([Zocdoc provider features](https://www.zocdoc.com/blog/facts/transparency-and-control-for-providers/)).
- Weakness we exploit: unpredictable per-booking cost → our **flat, modular
  subscription** the doctor composes themself.

### SimplePractice — practice management for solo/small (US)
- $29–$99/mo tiers; client portal (book, message, pay, intake), card
  processing with stored cards, insurance claims, telehealth, **AI note-taking**,
  calendar + automated reminders
  ([comparison](https://softwarefinder.com/resources/jane-app-vs-simplepractice),
  [Capterra](https://www.capterra.com/compare/130710-178984/SimplePractice-vs-Jane-App)).

### Jane App — multi-service clinics (CA/US)
- $39–$99/mo; best-in-class scheduling, 24/7 online booking, patient portal
  with payments + intake forms, integrated billing (packages, memberships,
  payment plans), telehealth, charting
  ([Jane vs SimplePractice](https://jane.app/guide/jane-vs-simplepractice),
  [Therapist Network review](https://www.thetherapist.network/news/jane-vs-simple-practice-is-jane-app-worth-it-for-therapists-in-2025-full-review-comparison-guide)).

### Practo / oladoc / Marham — South Asia marketplaces (our regional edge)
- oladoc: instant confirmations, reminders, video consults, lab tests
  ([oladoc](https://oladoc.com/), [comparison](https://www.considracare.pk/marham-vs-oladoc/)).
- Marham: search by specialty/hospital/disease, filter by fee/rating/experience,
  SMS confirmations ([Marham](https://www.marham.pk/)).
- Practo Ray (clinic SaaS): appointment scheduler, EHR, SMS alerts, medical
  billing ([Practo Ray](https://www.practo.com/en-ph/providers/clinics/ray/features)).
- **Regional reality:** walk-in-heavy clinics run on *token numbers* and daily
  rush; none of the affordable tools do queue/token management well → our
  **Queue module** is a genuine differentiator.

## 3. Trends (2025–2026)

- **AI scheduling** is the headline trend: no-show prediction, auto-fill from
  waitlists, AI reminders/intake routing
  ([Pabau AI scheduling](https://pabau.com/blog/ai-patient-scheduling/),
  [Prosper guide](https://www.getprosper.ai/blog/patient-appointment-scheduling-software-guide)).
- **Self-scheduling gap = opportunity:** 89% of patients want anytime booking,
  yet in mid-2025 71% of medical groups said fewer than 25% of patients
  self-book ([Prosper self-scheduling](https://www.getprosper.ai/blog/patient-self-scheduling-software-guide)).
- Reminders claim up to **60% no-show reduction**; self-service booking lifts
  efficiency/satisfaction dramatically ([WaitWell](https://waitwellsoftware.com/resources/articles/best-patient-scheduling-software/)).
- Telehealth is table stakes; queues/wait-time management is a rising buyer
  priority going into 2026.

## 4. 100% feature-coverage matrix → our modules

| Competitor feature | Who has it | Our coverage |
|---|---|---|
| Marketplace search + filters | Zocdoc, Marham, oladoc | ✅ `/doctors` discovery (specialty/city/rating/type/distance) |
| Doctor profile + verified badge + reviews | Zocdoc, Marham | ✅ Portfolio + reviews/replies + verification (admin) |
| Real-time slots, instant booking, no patient account | All | ✅ Slot engine + public booking |
| Automated reminders (SMS/email) | All | ✅ Reminders module (logged now, Twilio-ready) |
| Online payments at booking, card processing | Jane, SimplePractice | ✅ **Stripe Checkout at booking + /pay link** (this build) |
| Receipts/invoices for patients | Jane, Practo Ray | ✅ **Printable receipts module** (this build) |
| Intake/reason-for-visit before appointment | Zocdoc, Jane | ✅ Booking form intake (reason, type) |
| Telehealth video | All | 🟦 Module flagged `coming_soon` (Daily.co planned) |
| Patient portal (view/reschedule/cancel) | Jane, SimplePractice | ✅ `/portal` + reschedule/cancel tokens |
| Waitlist auto-fill | AI tools | ✅ Waitlist + invite |
| Analytics dashboard | All | ✅ Analytics module (trends, no-shows, revenue) |
| Calendar/queue for daily ops | Practo Ray, WaitWell | ✅ Calendar + **Queue/token module** (this build) |
| Modular pricing the provider composes | (none affordable) | ✅ **Module store with live total + Stripe** (this build) |
| Insurance claims (US) | SimplePractice | ⬜ Phase 3 (EHR/insurance integrations) |
| AI no-show prediction / AI notes | 2026 trend | ⬜ Phase 3 (AI module slot reserved) |

**Verdict:** with this build we match or beat every affordable competitor on
booking, payments, receipts, reviews, analytics, and uniquely add
queue/tokens + composable module pricing. Remaining gaps (insurance, AI,
telehealth video) are roadmap modules the schema already supports.

## 5. Sources
- https://www.zocdoc.com/provider-help/en/articles/10859404-understanding-zocdoc-pricing-and-billing
- https://emitrr.com/blog/zocdoc-pricing/
- https://www.zocdoc.com/blog/facts/transparency-and-control-for-providers/
- https://www.fiercehealthcare.com/practices/some-new-york-doctors-unhappy-about-zocdoc-s-new-pricing-model-company-says-it-was
- https://softwarefinder.com/resources/jane-app-vs-simplepractice
- https://jane.app/guide/jane-vs-simplepractice
- https://www.thetherapist.network/news/jane-vs-simple-practice-is-jane-app-worth-it-for-therapists-in-2025-full-review-comparison-guide
- https://www.capterra.com/compare/130710-178984/SimplePractice-vs-Jane-App
- https://oladoc.com/ · https://www.marham.pk/ · https://www.considracare.pk/marham-vs-oladoc/
- https://www.practo.com/en-ph/providers/clinics/ray/features
- https://pabau.com/blog/ai-patient-scheduling/
- https://www.getprosper.ai/blog/patient-self-scheduling-software-guide
- https://waitwellsoftware.com/resources/articles/best-patient-scheduling-software/
