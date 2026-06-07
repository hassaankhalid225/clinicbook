# ClinicBook — Complete Project Document

> **Calendly for Doctors** — Doctor appointment scheduling SaaS for US/UK market  
> *Prepared by: Hassaan Ahmed | Version: 1.0 | June 2026*

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Market Research & Opportunity](#2-market-research--opportunity)
3. [Competitor Analysis](#3-competitor-analysis)
4. [Product Description](#4-product-description)
5. [User Types & Roles](#5-user-types--roles)
6. [Patient Experience — Full Flow](#6-patient-experience--full-flow)
7. [Doctor Experience — Full Flow](#7-doctor-experience--full-flow)
8. [Core Features — Phase 1 MVP](#8-core-features--phase-1-mvp)
9. [Core Features — Phase 2](#9-core-features--phase-2)
10. [Pricing Plans](#10-pricing-plans)
11. [Revenue Projections](#11-revenue-projections)
12. [Database Schema](#12-database-schema)
13. [API Design](#13-api-design)
14. [Tech Stack](#14-tech-stack)
15. [8-Week Build Plan](#15-8-week-build-plan)
16. [Go-To-Market Strategy](#16-go-to-market-strategy)
17. [Competitive Advantages](#17-competitive-advantages)

---

## 1. Project Overview

**Product Name:** ClinicBook  
**Tagline:** The simplest way for doctors to let patients book appointments online  
**Category:** Healthcare SaaS / Appointment Scheduling  
**Target Market:** US & UK (International first)  
**Copy Model:** Calendly — but built specifically for healthcare providers

### One-Line Description
> ClinicBook gives every doctor a shareable booking link — patients click it, pick a slot, fill a form, and they are booked. No back-and-forth calls, no receptionist needed, no app download.

### The Core Problem Being Solved
- Patients wait on hold to book appointments with doctors
- Doctors lose revenue to no-shows with no reminder system
- Small clinics have no affordable digital scheduling tool
- Zocdoc charges $30–$140 per new patient booking — unpredictable cost
- Existing tools are too complex and enterprise-focused for solo doctors

### Why Now
- Medical appointment scheduling market projected at **$258M in 2025**, growing at 9.4% CAGR
- Only **11% of medical groups** have majority of patients self-scheduling — adoption gap is massive
- New UK laws (Awaab's Law, Renters Rights) pushing clinics toward digital accountability
- Post-COVID patient expectation: book online, just like hotels and restaurants

---

## 2. Market Research & Opportunity

### Market Size
| Metric | Value |
|---|---|
| Global medical scheduling software market (2025) | $258.2 million |
| Projected market size (2030) | $749.9 million |
| CAGR 2025–2030 | 13% |
| Appointment scheduling software market (2025) | $546.59 million |
| Projected market size (2033) | $1.8 billion |
| CAGR 2026–2033 | 16.1% |

### Key Demand Signals
- Electronic reminders make patients **23% more likely** to attend appointments
- Automated reminders reduce no-shows by up to **50%**
- Only **25% of patients** in most practices currently self-schedule online
- A large healthcare provider reported a **25% increase** in appointments after cloud scheduling adoption
- SMS/email reminders reduce no-shows — directly saving doctors money

### Target Geographies
1. **United States** — Largest market, lawsuit culture drives need for documentation, 1M+ doctors
2. **United Kingdom** — NHS + private clinics, new digital mandates, strong SaaS adoption
3. **Pakistan/South Asia** (Phase 2) — 200,000+ registered doctors, zero affordable tools

---

## 3. Competitor Analysis

### Zocdoc (Main Competitor)
- **Valuation:** $1.8 billion
- **Revenue:** $150.2 million (2026)
- **Employees:** 1,098
- **Model:** Pay-per-booking — $30 to $140 per new patient
- **Problem:** Unpredictable cost, not transparent pricing, shifting to enterprise

**Zocdoc Weakness ClinicBook Exploits:**
- A doctor getting 215 new patients/year pays up to **$30,100** annually to Zocdoc
- Pricing not shown until late in sign-up process
- No standardized pricing — same specialty, different cities pay different rates
- Patients can cancel last-minute with no penalty to them

### Other Competitors
| Tool | Problem |
|---|---|
| Calendly | Not built for healthcare — no HIPAA, no medical forms, no telehealth |
| Practo | India-focused, limited US/UK presence |
| Mend | No-show focused only, not full scheduling suite |
| Emitrr | $99/month starting — expensive for solo doctors |
| YouCanBook.me | Generic, not healthcare-specific |

### ClinicBook vs Zocdoc
| Feature | Zocdoc | ClinicBook |
|---|---|---|
| Pricing model | $30–140 per booking | Flat $29–149/month |
| Pricing transparency | Hidden until sign-up | Clear upfront |
| Target user | Large hospitals | Solo doctors + small clinics |
| Setup time | Complex onboarding | 10 minutes |
| No-show protection | Limited | Reminders + deposits |
| Telehealth | Yes | Yes (built-in) |

---

## 4. Product Description

ClinicBook is a **doctor appointment scheduling SaaS** that works exactly like Calendly — but built for healthcare.

**How it works in 3 steps:**

1. **Doctor signs up** → sets working hours → gets a unique link: `clinicbook.io/dr-ali`
2. **Doctor shares the link** on their website, WhatsApp, Google listing, Instagram bio
3. **Patient opens the link** → sees available slots → books in under 60 seconds → gets SMS confirmation

No phone tag. No receptionist needed. No app download for the patient.

### What Makes It Different from General Schedulers
- Medical intake form at booking (reason for visit, insurance type)
- HIPAA-compliant data handling
- Telehealth video call integration (Daily.co)
- No-show prediction using AI
- Waitlist auto-fill when a slot is cancelled
- Healthcare-specific reminder messaging ("Your checkup is tomorrow at 9 AM")

---

## 5. User Types & Roles

### User Type 1: Doctor / Provider
- Creates account and sets up their profile
- Configures availability (days, hours, slot duration, breaks)
- Shares booking link with patients
- Views dashboard — upcoming appointments, analytics, patient history
- Manages cancellations, blocks dates, enables telehealth per appointment

### User Type 2: Patient
- No account needed — zero friction
- Opens doctor's public link in any browser
- Books appointment, gets SMS confirmation
- Receives reminders automatically
- Cancels via one-click link in SMS

### User Type 3: Clinic Admin
- Manages multiple doctors under one clinic account
- Views aggregate reports across all providers
- Handles subscription and billing
- Sets clinic-wide availability templates

---

## 6. Patient Experience — Full Flow

This is the complete step-by-step journey of a patient using ClinicBook. The patient never downloads an app or creates an account.

---

### Step 1 — Opening the Booking Page

**Trigger:** Doctor shares link: `clinicbook.io/dr-sarah`  
**Where:** WhatsApp, website, Google Maps listing, Instagram bio, text message

**What patient sees:**
- Doctor's name, photo, specialty
- Clinic name and address
- Working hours
- Slot duration (e.g., 30 min appointments)
- Telehealth availability badge
- One clear button: **"Book appointment"**

**Key principle:** Zero login. Zero app download. Just a clean webpage.

---

### Step 2 — Selecting a Date and Time

**What patient sees:**
- A calendar showing the current month
- Green dates = available, grey dates = unavailable/blocked
- Patient taps a green date
- Available time slots appear instantly (pulled live from doctor's availability)
- Slots already taken by other patients are hidden automatically

**Example slots shown:**
```
9:00 AM   9:30 AM   10:00 AM
10:30 AM  11:00 AM  2:00 PM
```

**Behind the scenes:**
- API checks `availability_rules` table for the doctor
- Removes slots that already have appointments in `appointments` table
- Removes blocked times from `blocked_slots` table
- Returns only truly available slots in real time

---

### Step 3 — Filling Patient Details

**Form fields:**
- Full name (required)
- Phone number (required — for SMS)
- Email address (optional)
- Reason for visit (required)
- Appointment type toggle: **In-person** or **Telehealth**

**Form takes:** Under 30 seconds to fill

**Data saved to:** `patients` table in the database

---

### Step 4 — Booking Confirmation

**What happens on submit:**
1. Slot is locked in `appointments` table with status: `scheduled`
2. Unique `cancel_token` is generated for this appointment
3. Patient sees confirmation screen with:
   - Doctor name
   - Date and time
   - Clinic address (or video link if telehealth)
4. Doctor receives in-app notification: "New booking — Hassaan Ahmed, July 10, 9:30 AM"

---

### Step 5 — SMS Notifications

**Confirmation SMS (sent immediately):**
```
Hi Hassaan! Your appointment with Dr. Sarah Johnson is confirmed 
for Thu Jul 10 at 9:30 AM. HealthFirst Clinic, Manhattan NY.
Need to cancel? clinicbook.io/cancel/xxxx
```

**Reminder SMS (sent 24 hours before):**
```
Reminder: You have an appointment tomorrow with Dr. Sarah Johnson 
at 9:30 AM. Reply CANCEL to cancel.
```

**Email confirmation (if email provided):**
- Sent via SendGrid / Resend
- Includes appointment details + calendar invite (.ics file attachment)

---

### Step 6 — Cancellation Flow

**If patient wants to cancel:**
1. Click the link in their SMS
2. One-click confirmation page: "Cancel your appointment with Dr. Sarah on Jul 10?"
3. Confirm — appointment status changes to `cancelled`
4. Doctor is notified via in-app + email
5. If waitlist exists — first waitlisted patient gets automatic SMS invite

**No phone call needed. No hold music. 10 seconds total.**

---

### Step 7 — Waitlist (if slot was full)

**If patient's preferred date is full:**
- They see a "Join waitlist" option
- Enter name, phone, preferred date
- Saved to `waitlist` table

**When a cancellation happens:**
- System detects the open slot
- First matching waitlist patient gets SMS: "A slot opened up for your preferred date — book now: [link]"
- Link expires in 2 hours if not acted on
- Next waitlist patient is invited if first doesn't respond

---

## 7. Doctor Experience — Full Flow

### Onboarding (Week 1, Day 1)

1. Sign up with email or Google OAuth
2. Fill profile: name, specialty, clinic name, phone, timezone
3. Upload photo (stored in Cloudflare R2)
4. Set availability:
   - Working days (e.g., Mon–Fri)
   - Start and end time per day
   - Slot duration (15 / 20 / 30 / 60 minutes)
   - Break times (e.g., 1 PM–2 PM lunch)
5. Get unique booking link: `clinicbook.io/dr-[slug]`
6. Share link — done. Live in 10 minutes.

### Daily Dashboard

**Today's view:**
- List of today's appointments (name, time, reason, type)
- Mark as: Completed / No-show / Rescheduled
- Quick patient notes field per appointment

**Upcoming view:**
- Next 7 days of appointments
- Colour coded: scheduled (blue), telehealth (purple), cancelled (grey)

**Analytics panel:**
- Total bookings this month
- No-show rate
- Cancellation rate
- Busiest day of week
- Busiest hour of day
- Revenue (if deposit collection is enabled)

### Blocking Dates

Doctor can manually block any time:
- Full day block (holiday, conference)
- Partial block (e.g., 2 PM–4 PM for a procedure)
- Recurring block (every Friday afternoon)

Blocked slots are immediately hidden from the public booking page.

### Telehealth Setup

- Toggle telehealth on per appointment type
- When patient books a telehealth slot, Daily.co API generates a video room
- Video link is sent to patient via SMS and email
- Doctor opens same link from their dashboard at appointment time

---

## 8. Core Features — Phase 1 MVP

These are the features to build in the first 8 weeks.

| Feature | Description |
|---|---|
| Doctor sign up / login | Supabase Auth — email + Google OAuth |
| Doctor profile | Name, specialty, clinic, photo, timezone |
| Availability builder | Working days, hours, slot duration, breaks |
| Public booking page | `clinicbook.io/dr-[slug]` — no login required |
| Real-time slot availability | Live check against existing appointments + blocks |
| Patient booking form | Name, phone, email, reason, appointment type |
| Booking confirmation | In-app + SMS + email |
| Auto SMS reminders | 24-hour reminder via Twilio |
| Doctor dashboard | Today's appointments, status management |
| Cancellation flow | One-click cancel via SMS link |
| Date blocking | Manual block for dates and times |
| Stripe subscription | Free / Starter / Practice / Pro plans |
| Feature gating | Free plan limited to 3 bookings/day |

---

## 9. Core Features — Phase 2

These are added after first 100 paying customers.

| Feature | Description |
|---|---|
| Waitlist system | Auto-invite when cancellation occurs |
| Telehealth video | Daily.co integration — video room per appointment |
| AI no-show prediction | Flag high-risk patients, send extra reminder |
| Patient deposit | Stripe payment required at booking — reduces no-shows |
| Multi-provider clinic | One admin manages many doctors |
| Patient portal | Patients can view/manage their own bookings |
| Follow-up reminders | "Book your 3-month checkup" auto-message |
| Review requests | Post-visit SMS asking for Google review |
| EHR integration | Connect to existing medical records systems |
| White-label | Agencies can resell ClinicBook under their brand |
| Flutter mobile app | Native iOS/Android for doctors on the go |

---

## 10. Pricing Plans

| Plan | Price | Who It's For | Key Limits |
|---|---|---|---|
| Free | $0/month | Testing the product | 3 bookings/day, ClinicBook branding on page |
| Starter | $29/month | Solo doctor | Unlimited bookings, custom link, reminders, tracking |
| Practice | $79/month | Small clinic (up to 3 providers) | + Analytics, telehealth, multi-provider |
| Clinic Pro | $149/month | Medium clinic (unlimited providers) | + Waitlist, AI no-show prediction, priority support |
| Enterprise | Custom | Hospital groups, chains | Custom SLA, white-label, EHR integration, dedicated support |

### Pricing Logic vs Zocdoc
Zocdoc charges $30–$140 per new patient booking.  
A doctor getting just 2 new patients per month from ClinicBook breaks even on the $29 Starter plan.  
Every additional patient is pure savings vs Zocdoc's model.

---

## 11. Revenue Projections

### Monthly Recurring Revenue (MRR) Milestones

| Milestone | Timeline | Customers | Avg Plan | MRR |
|---|---|---|---|---|
| Beta launch | Month 2 | 10 (free) | $0 | $0 |
| First revenue | Month 3 | 10 paying | $29 avg | $290 |
| Early growth | Month 6 | 50 paying | $45 avg | $2,250 |
| Momentum | Month 9 | 150 paying | $55 avg | $8,250 |
| Scale | Month 12 | 300 paying | $65 avg | $19,500 |
| Established | Month 18 | 700 paying | $75 avg | $52,500 |

### High-Ticket Client Potential
- One enterprise hospital chain = $500–$2,000/month
- 10 enterprise clients = $5,000–$20,000/month additional
- Agency/white-label resellers add recurring revenue without direct sales effort

### Revenue Model Breakdown
- 70% — SaaS subscriptions (main revenue)
- 15% — Transaction fee on patient deposits (2% per deposit)
- 10% — Enterprise/custom plans
- 5% — White-label licensing

---

## 12. Database Schema

### Table: `doctors`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK — Supabase auth UID |
| email | varchar(255) | NOT NULL, unique |
| full_name | varchar(100) | NOT NULL |
| slug | varchar(60) | Unique booking URL slug, e.g. dr-ali-khan |
| specialty | varchar(100) | General, Cardiology, Dermatology, etc. |
| clinic_name | varchar(150) | |
| phone | varchar(20) | For Twilio notifications |
| timezone | varchar(60) | e.g. America/New_York |
| avatar_url | text | Cloudflare R2 path |
| plan | enum | free \| starter \| practice \| pro |
| stripe_customer_id | varchar(60) | Stripe cus_xxx |
| stripe_subscription_id | varchar(60) | Stripe sub_xxx |
| is_active | boolean | Default true |
| created_at | timestamptz | Default now() |

---

### Table: `availability_rules`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| doctor_id | uuid | FK → doctors.id |
| day_of_week | smallint | 0=Sunday … 6=Saturday |
| start_time | time | e.g. 09:00 |
| end_time | time | e.g. 17:00 |
| slot_duration_min | smallint | 15 \| 20 \| 30 \| 60 |
| is_active | boolean | Toggle day on/off |

---

### Table: `blocked_slots`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| doctor_id | uuid | FK → doctors.id |
| blocked_date | date | e.g. 2026-07-04 |
| start_time | time | NULL = full day block |
| end_time | time | NULL = full day block |
| reason | text | Optional internal note |

---

### Table: `patients`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| full_name | varchar(100) | NOT NULL |
| email | varchar(255) | Optional |
| phone | varchar(20) | NOT NULL — required for SMS |
| date_of_birth | date | Optional |
| created_at | timestamptz | |

---

### Table: `appointments`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| doctor_id | uuid | FK → doctors.id |
| patient_id | uuid | FK → patients.id |
| appointment_date | date | NOT NULL |
| start_time | timetz | NOT NULL |
| end_time | timetz | Calculated: start_time + slot_duration |
| status | enum | scheduled \| completed \| cancelled \| no_show |
| reason | text | Patient's stated reason for visit |
| is_telehealth | boolean | Default false |
| video_room_url | text | Daily.co room link — generated at booking |
| cancel_token | uuid | One-click cancel link token — unique per appointment |
| deposit_paid | numeric(10,2) | Stripe deposit amount |
| stripe_payment_id | varchar(60) | Stripe pi_xxx |
| notes | text | Doctor's internal notes — not visible to patient |
| created_at | timestamptz | |

---

### Table: `waitlist`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| doctor_id | uuid | FK → doctors.id |
| patient_id | uuid | FK → patients.id |
| preferred_date | date | Patient's preferred date |
| notified_at | timestamptz | When invite SMS was sent |
| invite_expires_at | timestamptz | 2 hours after invite sent |
| status | enum | waiting \| invited \| booked \| expired |
| created_at | timestamptz | |

---

### Table: `notifications_log`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| appointment_id | uuid | FK → appointments.id |
| channel | enum | sms \| email |
| type | enum | confirmation \| reminder \| cancellation \| waitlist_invite |
| sent_at | timestamptz | |
| status | enum | sent \| failed \| delivered |
| provider_msg_id | varchar(80) | Twilio SID or SendGrid message ID |

---

### Table Relationships Summary

```
doctors (1) ──────────── (many) availability_rules
doctors (1) ──────────── (many) blocked_slots
doctors (1) ──────────── (many) appointments
patients (1) ─────────── (many) appointments
appointments (1) ──────── (many) notifications_log
doctors (1) ──────────── (many) waitlist
patients (1) ─────────── (many) waitlist
```

---

## 13. API Design

Base URL: `https://api.clinicbook.io/api`  
Authentication: JWT Bearer token (Supabase Auth)  
Format: JSON  
HIPAA: All endpoints use HTTPS, data encrypted at rest

---

### Auth Endpoints

#### POST `/auth/register`
Doctor signs up.

**Request body:**
```json
{
  "email": "dr.ali@clinic.com",
  "password": "••••••••",
  "full_name": "Dr. Ali Khan",
  "specialty": "General Physician"
}
```

**Response:**
```json
{
  "id": "uuid-xxx",
  "email": "dr.ali@clinic.com",
  "token": "eyJhbGci..."
}
```

---

#### POST `/auth/login`
Doctor logs in.

**Request body:**
```json
{
  "email": "dr.ali@clinic.com",
  "password": "••••••••"
}
```

**Response:**
```json
{
  "token": "eyJhbGci...",
  "doctor": { "id": "...", "plan": "free", "slug": "dr-ali-khan" }
}
```

---

### Doctor Profile Endpoints

#### GET `/doctor/me` 🔒
Get own profile.

**Response:**
```json
{
  "id": "uuid",
  "full_name": "Dr. Ali Khan",
  "slug": "dr-ali-khan",
  "specialty": "General Physician",
  "clinic_name": "HealthFirst Clinic",
  "plan": "starter",
  "timezone": "America/New_York"
}
```

---

#### PUT `/doctor/me` 🔒
Update profile.

**Request body:**
```json
{
  "clinic_name": "HealthFirst Clinic",
  "phone": "+1-212-555-0199",
  "timezone": "America/Chicago"
}
```

**Response:**
```json
{ "updated": true }
```

---

### Availability Endpoints

#### GET `/doctor/availability` 🔒
Get all availability rules.

**Response:**
```json
[
  {
    "id": "uuid",
    "day_of_week": 1,
    "start_time": "09:00",
    "end_time": "17:00",
    "slot_duration_min": 30,
    "is_active": true
  }
]
```

---

#### POST `/doctor/availability` 🔒
Set or update a day's availability.

**Request body:**
```json
{
  "day_of_week": 1,
  "start_time": "09:00",
  "end_time": "17:00",
  "slot_duration_min": 30
}
```

---

#### POST `/doctor/block` 🔒
Block a specific date or time range.

**Request body:**
```json
{
  "blocked_date": "2026-07-04",
  "start_time": null,
  "end_time": null,
  "reason": "Public holiday"
}
```

---

### Public Booking Endpoints (No Auth Required)

#### GET `/book/{slug}/slots?date=2026-07-10`
Get available time slots for a specific date.

**Response:**
```json
{
  "date": "2026-07-10",
  "doctor": "Dr. Sarah Johnson",
  "slots": ["09:00", "09:30", "10:00", "11:00", "14:00"]
}
```

---

#### POST `/book/{slug}`
Patient books a slot.

**Request body:**
```json
{
  "date": "2026-07-10",
  "time": "09:30",
  "patient_name": "Hassaan Ahmed",
  "phone": "+923001234567",
  "email": "h@email.com",
  "reason": "Fever since 3 days",
  "is_telehealth": false
}
```

**Response:**
```json
{
  "appointment_id": "uuid",
  "status": "scheduled",
  "cancel_token": "uuid-cancel",
  "video_url": null
}
```

---

#### POST `/book/cancel/{cancel_token}`
Patient cancels via SMS link (no auth needed).

**Response:**
```json
{
  "cancelled": true,
  "waitlist_notified": true
}
```

---

### Appointment Endpoints

#### GET `/appointments` 🔒
List all appointments (filterable by status, date range).

**Query params:** `?status=scheduled&from=2026-07-01&to=2026-07-31`

**Response:**
```json
[
  {
    "id": "uuid",
    "patient_name": "John Smith",
    "patient_phone": "+1-555-0199",
    "date": "2026-07-10",
    "time": "09:30",
    "status": "scheduled",
    "is_telehealth": false,
    "reason": "Annual checkup"
  }
]
```

---

#### GET `/appointments/today` 🔒
Today's appointments only.

**Response:**
```json
{
  "date": "2026-07-10",
  "count": 8,
  "appointments": [...]
}
```

---

#### PUT `/appointments/{id}/status` 🔒
Doctor marks appointment as completed or no-show.

**Request body:**
```json
{ "status": "completed" }
```

---

### Waitlist Endpoints

#### POST `/waitlist/{slug}`
Patient joins the waitlist (no auth).

**Request body:**
```json
{
  "patient_name": "Sara Ali",
  "phone": "+923009876543",
  "preferred_date": "2026-07-12"
}
```

**Response:**
```json
{
  "waitlist_id": "uuid",
  "position": 3
}
```

---

#### GET `/doctor/waitlist` 🔒
Doctor views current waitlist.

**Response:**
```json
[
  {
    "patient_name": "Sara Ali",
    "preferred_date": "2026-07-12",
    "status": "waiting",
    "created_at": "2026-07-08T10:30:00Z"
  }
]
```

---

### Analytics Endpoint

#### GET `/analytics/summary` 🔒
Dashboard summary stats.

**Query params:** `?period=this_month`

**Response:**
```json
{
  "total_bookings": 142,
  "completed": 123,
  "no_shows": 8,
  "cancellations": 11,
  "no_show_rate": "5.6%",
  "busiest_day": "Monday",
  "busiest_hour": "10:00 AM",
  "avg_bookings_per_day": 6.7
}
```

---

## 14. Tech Stack

### Frontend — Web Dashboard (Doctor Portal)
| Tool | Purpose |
|---|---|
| Next.js 14 | Doctor dashboard — pages router |
| Tailwind CSS | Styling |
| React Query | Data fetching + caching |
| Recharts | Analytics charts |
| Vercel | Hosting |

### Mobile — Patient Booking + Doctor App
| Tool | Purpose |
|---|---|
| Flutter | Cross-platform mobile app (Phase 2) |
| Dart | Programming language |
| flutter_secure_storage | Token storage |

### Backend
| Tool | Purpose |
|---|---|
| FastAPI | REST API — Python |
| PostgreSQL | Primary database |
| Supabase | Auth + database hosting + real-time |
| Redis | Caching + session store (Phase 2) |
| Railway | Backend hosting |

### Integrations
| Service | Purpose | Cost |
|---|---|---|
| Twilio | SMS reminders and confirmations | Pay-per-SMS ~$0.0079/SMS |
| SendGrid / Resend | Email confirmations | Free tier: 100/day |
| Daily.co | Telehealth video rooms | Free tier: 10,000 min/month |
| Stripe | Subscription billing + patient deposits | 2.9% + 30¢ per transaction |
| Cloudflare R2 | Doctor photo storage | $0.015/GB/month |

### Security
| Concern | Solution |
|---|---|
| Auth | Supabase JWT — access + refresh tokens |
| API protection | Rate limiting via FastAPI middleware |
| Data encryption | AES-256 at rest (Supabase handles this) |
| HTTPS | Enforced on all endpoints |
| HIPAA compliance | Encrypted storage, no data sold, audit logs |
| Cancel tokens | UUID v4 — unguessable, single-use |

---

## 15. 8-Week Build Plan

### Phase 1: Foundation (Weeks 1–3)

---

**Week 1 — Auth + Project Setup**

Goal: Working authentication and project scaffolding.

Tasks:
- GitHub repo setup — branching strategy: `main` / `dev` / `feature/*`
- FastAPI project scaffold — folder structure, `.env` config, CORS setup
- PostgreSQL + Supabase project creation and connection
- Next.js dashboard init — pages router, Tailwind CSS, ESLint
- Supabase Auth — email/password + Google OAuth flow
- JWT middleware for FastAPI route protection

Deliverable: Doctor can sign up, log in, and land on an empty dashboard.

---

**Week 2 — Doctor Profile + Availability**

Goal: Doctor can fully configure their schedule.

Tasks:
- Doctor profile form — name, specialty, clinic name, timezone, photo upload
- Photo upload to Cloudflare R2 — presigned URL flow
- Availability builder — working days, start/end time, slot duration
- Break time slots — lunch break, custom blocks
- Timezone handling — store in UTC, display in local time
- Save + update availability via API

Deliverable: Doctor can fully configure their schedule and breaks.

---

**Week 3 — Public Booking Page**

Goal: A patient can open the link and book — no login needed.

Tasks:
- Generate unique booking URL: `clinicbook.io/dr-[slug]`
- Public calendar view — show available slots in real time
- Slot availability API — cross-reference `availability_rules`, `appointments`, `blocked_slots`
- Patient booking form — name, phone, email, reason, appointment type
- Slot conflict prevention — atomic write to prevent double bookings
- Booking confirmation page + success state
- In-app notification to doctor on new booking

Deliverable: A patient can open the link and book in under 60 seconds.

---

### Phase 2: Features (Weeks 4–6)

---

**Week 4 — SMS + Email Reminders**

Goal: Auto-notifications working end to end.

Tasks:
- Twilio SMS integration — confirmation sent immediately on booking
- Email confirmation via SendGrid or Resend — with .ics calendar invite
- 24-hour reminder cron job via FastAPI `BackgroundTasks` or APScheduler
- Cancellation flow — patient cancels via token link → doctor notified
- Reschedule flow — patient picks new slot (Phase 2 polish)
- Notification logging to `notifications_log` table

Deliverable: Auto SMS + email on booking, reminder 24 hours before appointment.

---

**Week 5 — Doctor Dashboard**

Goal: Doctor has full visibility of their schedule and patient history.

Tasks:
- Appointments list — Today / Upcoming / Past tabs
- Status management — mark as Completed / No-show per appointment
- Basic analytics panel — total bookings, no-show count, busiest hours
- Patient mini-profiles — visit history per patient
- Manual date blocking UI — block specific dates or time ranges
- In-app notification bell — new booking alerts

Deliverable: Doctor dashboard fully functional for daily use.

---

**Week 6 — Waitlist + Telehealth**

Goal: Waitlist working + video call option available.

Tasks:
- Waitlist system — patient joins waitlist when slot is full
- Cancellation trigger — auto-detect cancellation, find matching waitlist entry
- Auto-invite SMS — first matching patient gets invite, link expires in 2 hours
- Daily.co API integration — generate unique video room per telehealth appointment
- Video link sent to patient via SMS before appointment
- Doctor can toggle telehealth on/off per appointment type from dashboard

Deliverable: Waitlist auto-fills cancelled slots, telehealth video calls work.

---

### Phase 3: Launch (Weeks 7–8)

---

**Week 7 — Stripe Payments + Subscription**

Goal: Stripe subscription live — free users can upgrade.

Tasks:
- Stripe Checkout — Starter $29, Practice $79, Pro $149/month
- Webhook handler — `customer.subscription.created`, `invoice.paid`, `subscription.cancelled`
- Feature gating middleware — free plan enforces 3 bookings/day limit
- Optional patient deposit — Stripe Payment Intent at booking time
- Upgrade prompt UI — shown when free user hits daily limit
- Billing portal link — doctor can manage subscription from dashboard

Deliverable: End-to-end payments working. Free users can upgrade to paid.

---

**Week 8 — Polish + Beta Launch**

Goal: Public launch with first paying customers.

Tasks:
- Full QA — test every flow: signup → set availability → book → reminder → cancel → waitlist
- Mobile responsiveness audit — booking page must look perfect on phone
- ProductHunt draft — tagline, screenshots, GIF demo of booking flow
- Onboard 10 beta clinics free — collect feedback, fix critical bugs
- Twitter/LinkedIn launch post — show real booking link demo
- Basic error monitoring — Sentry integration
- Rate limiting on all public endpoints — prevent abuse

Deliverable: Public launch. First 10 free clinics onboarded. Ready for paying customers.

---

## 16. Go-To-Market Strategy

### Getting First 10 Customers

1. **Reddit communities:**  
   Post in r/medicine, r/physicianassistant, r/Noctor  
   Message: "I built a simple Calendly for doctors — free for 3 months, want to try it?"

2. **Facebook Groups:**  
   "Private Practice Doctors", "UK GP Locums", "Physician Entrepreneurs"  
   Direct outreach, not spammy ads

3. **Cold email campaign:**  
   Google "family clinic [city]" → find contact email  
   Send 50 personalised emails per day  
   Offer: 90 days free + personal onboarding call

4. **Founder's own use:**  
   Use ClinicBook for real — share screenshots of a real booking being made  
   Post the booking link on LinkedIn, ask network to test it

5. **LinkedIn content:**  
   Post: "I sent 200 cold emails to doctors. Here's what they said about appointment scheduling..."  
   Build audience before hard selling

### Scaling to 100 Customers

- **ProductHunt launch** — international early adopters, tech-savvy doctors
- **AppSumo lifetime deal** — 300–500 customers in one drop
- **YouTube tutorials** — "How to set up online booking for your clinic in 10 minutes"
- **SEO content** — "Best Zocdoc alternative", "Free appointment scheduling for doctors"
- **Referral program** — "Give 1 month free, get 1 month free"

### Scaling to 500+ Customers

- **Partnerships** with medical billing companies — bundle ClinicBook into their offer
- **White-label** for healthcare staffing agencies
- **Google Ads** targeting: "doctor appointment scheduling software"
- **Conference presence** — AMA, AAFP annual meetings (US family physician conferences)

---

## 17. Competitive Advantages

### Tera Unfair Advantage

| Advantage | Why It Matters |
|---|---|
| Flat monthly pricing | Doctors hate unpredictable costs — Zocdoc's per-booking model causes anxiety |
| 10-minute setup | Solo doctor can go live without IT help or onboarding call |
| Built for small clinics | Enterprise tools ignore the 90% of doctors who are solo or small group |
| HIPAA-aware design | Healthcare-specific — Calendly is not built for medical use |
| Telehealth built-in | No need for separate Zoom subscription |
| Waitlist automation | Revenue recovery on cancellations — no competitor does this affordably |
| Cancel-by-SMS | Patients don't need an account or app — zero friction |
| Pakistan-based founder | Low cost of operation = sustainable lower prices than US competitors |

### Long-Term Moat
Once a doctor has used ClinicBook for 6 months, they have:
- Patient booking history
- Analytics data
- Customised availability rules
- A branded booking link their patients know

**Switching cost is high.** This creates natural retention.

---

## Appendix A — Key Metrics to Track

| Metric | Target (Month 6) |
|---|---|
| Monthly Active Doctors | 100+ |
| Paying Customers | 50+ |
| MRR | $2,000+ |
| Average bookings per doctor/day | 5+ |
| No-show rate (platform average) | Below 10% |
| Churn rate | Below 5%/month |
| NPS Score | Above 50 |

---

## Appendix B — Tech Decisions Explained

**Why FastAPI over Django/Node?**  
FastAPI is async-first, fast to write, auto-generates API docs (Swagger UI), and Python ecosystem works well with data/ML for Phase 2 AI features.

**Why Supabase over raw PostgreSQL?**  
Supabase gives auth, database, real-time subscriptions, and storage in one — reduces infrastructure complexity for a solo founder.

**Why Twilio for SMS?**  
Industry standard for healthcare messaging. Reliable delivery, HIPAA Business Associate Agreement available, programmable SMS with delivery receipts.

**Why Daily.co for video?**  
Pre-built HIPAA-compliant video SDK. No need to build your own WebRTC infrastructure. Free tier covers early-stage usage. Simple API — generate a room, share a link.

**Why not build a mobile app first?**  
Patient side works perfectly in a mobile browser — no app needed. Doctor side can be mobile-responsive web. Native app adds months of development. Ship web first, add Flutter in Phase 2 when there is revenue to justify it.

---

## Appendix C — Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Zocdoc copies the flat-rate model | Low — they are VC-backed, optimised for per-booking revenue | First-mover in the solo clinic niche |
| HIPAA violation | Medium — if data is mishandled | Use Supabase (SOC 2 compliant), enable encryption at rest, sign BAA with Twilio |
| No-show rates remain high | Medium | Deposit feature + AI prediction in Phase 2 |
| Slow adoption in US market | Medium | Start with cold email outreach, offer 90 days free to build testimonials |
| Payment fraud | Low | Stripe handles fraud detection |
| Solo founder burnout | High — realistic risk | Follow 8-week plan strictly, launch MVP before adding features |

---

*Document end. Version 1.0 — June 2026*  
*Project: ClinicBook | Author: Hassaan Ahmed*
