/**
 * Seed v2 — module catalog (with prices), tenants, enriched marketplace
 * doctors with availability + services, reviews, and demo module selections.
 * Idempotent: fixed UUIDs + upserts, safe to re-run.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const D = (n: number) => `00000000-0000-4000-8000-00000000000${n}`; // doctor ids
const T = (n: number) => `00000000-0000-4000-9000-00000000000${n}`; // tenant ids

// ── Module catalog (admin-editable prices; cents) ────────────────────────────
const MODULES = [
  { key: "appointments", name: "Appointments", description: "Core scheduling: slots, calendar, statuses.", priceMonthlyCents: 0, isCore: true, sortOrder: 1, status: "active" },
  { key: "booking-page", name: "Public booking page", description: "Your shareable page where patients book in 60 seconds.", priceMonthlyCents: 0, isCore: true, sortOrder: 2, status: "active" },
  { key: "payments", name: "Online payments", description: "Patients pay at booking via Stripe; track paid/unpaid.", priceMonthlyCents: 1500, isCore: false, sortOrder: 3, status: "active" },
  { key: "receipts", name: "Printable receipts", description: "Numbered, print-ready receipts for every visit.", priceMonthlyCents: 700, isCore: false, sortOrder: 4, status: "active" },
  { key: "queue", name: "Queue & tokens", description: "Daily rush board: tokens, walk-ins, wait estimates.", priceMonthlyCents: 1000, isCore: false, sortOrder: 5, status: "active" },
  { key: "reminders", name: "SMS & email reminders", description: "Automatic confirmations and 24h reminders.", priceMonthlyCents: 1200, isCore: false, sortOrder: 6, status: "active" },
  { key: "analytics", name: "Analytics", description: "Trends, no-show rates, revenue and peak hours.", priceMonthlyCents: 1500, isCore: false, sortOrder: 7, status: "active" },
  { key: "reviews", name: "Reviews & ratings", description: "Collect patient reviews and reply publicly.", priceMonthlyCents: 800, isCore: false, sortOrder: 8, status: "active" },
  { key: "telehealth", name: "Telehealth video", description: "Built-in video consultations — a room link per visit, no app needed.", priceMonthlyCents: 2500, isCore: false, sortOrder: 9, status: "active" },
  { key: "pos", name: "POS / Hospital billing", description: "Point-of-sale terminal for the clinic: products, cart checkout, invoices.", priceMonthlyCents: 2000, isCore: false, sortOrder: 10, status: "active" },
] as const;

// POS catalog for the demo doctor (name, category, price in cents).
const POS_PRODUCTS = [
  { name: "General Consultation", category: "Consultation", priceCents: 6000 },
  { name: "Follow-up Visit", category: "Consultation", priceCents: 3500 },
  { name: "Blood Test (CBC)", category: "Lab", priceCents: 2500 },
  { name: "ECG", category: "Procedure", priceCents: 4000 },
  { name: "Dressing & Bandage", category: "Procedure", priceCents: 1500 },
  { name: "Paracetamol (strip)", category: "Pharmacy", priceCents: 300 },
  { name: "Amoxicillin (course)", category: "Pharmacy", priceCents: 1200 },
  { name: "Vitamin D Injection", category: "Pharmacy", priceCents: 800 },
];

interface DocSeed {
  n: number;
  email: string;
  fullName: string;
  slug: string;
  title: string;
  specialty: string;
  clinicName: string;
  clinicAddress: string;
  city: string;
  country: string;
  geoLat: number;
  geoLng: number;
  bio: string;
  experienceYears: number;
  languages: string[];
  certifications: string[];
  subSpecialties: string[];
  skills: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  verified: boolean;
  services: { name: string; durationMin: number; priceCents: number }[];
}

const DOCTORS: DocSeed[] = [
  {
    n: 1, email: "dr.sarah@clinicbook.io", fullName: "Dr. Sarah Johnson", slug: "dr-sarah-johnson",
    title: "MD, FAAFP", specialty: "General Physician", clinicName: "HealthFirst Clinic",
    clinicAddress: "123 Main St, Manhattan, NY", city: "Manhattan", country: "USA",
    geoLat: 40.7831, geoLng: -73.9712,
    bio: "Board-certified family physician with 12 years of experience. Same-week appointments available.",
    experienceYears: 12, languages: ["English", "Spanish"],
    certifications: ["Board Certified Family Medicine", "ACLS"],
    subSpecialties: ["Preventive Care", "Chronic Disease"], skills: ["Diagnosis", "Wellness Plans"],
    rating: 4.9, reviewCount: 3, featured: true, verified: true,
    services: [
      { name: "General Consultation", durationMin: 30, priceCents: 6000 },
      { name: "Follow-up Visit", durationMin: 15, priceCents: 3500 },
    ],
  },
  {
    n: 2, email: "dr.marcus@clinicbook.io", fullName: "Dr. Marcus Lee", slug: "dr-marcus-lee",
    title: "MD, FACC", specialty: "Cardiology", clinicName: "Lee Heart Center",
    clinicAddress: "9 Cardiac Ave, San Francisco, CA", city: "San Francisco", country: "USA",
    geoLat: 37.7749, geoLng: -122.4194,
    bio: "Interventional cardiologist focused on preventive heart health and minimally invasive procedures.",
    experienceYears: 18, languages: ["English", "Mandarin"],
    certifications: ["Board Certified Cardiology"], subSpecialties: ["Interventional", "Preventive"],
    skills: ["Echocardiography", "Stress Testing"],
    rating: 4.8, reviewCount: 1, featured: true, verified: true,
    services: [
      { name: "Cardiac Assessment", durationMin: 45, priceCents: 18000 },
      { name: "Echo Review", durationMin: 30, priceCents: 12000 },
    ],
  },
  {
    n: 3, email: "dr.amara@clinicbook.io", fullName: "Dr. Amara Okafor", slug: "dr-amara-okafor",
    title: "MD", specialty: "Dermatology", clinicName: "Glow Dermatology",
    clinicAddress: "44 Skin Blvd, Los Angeles, CA", city: "Los Angeles", country: "USA",
    geoLat: 34.0522, geoLng: -118.2437,
    bio: "Dermatologist specializing in medical and cosmetic skin care, acne, and skin cancer screening.",
    experienceYears: 9, languages: ["English", "French"],
    certifications: ["Board Certified Dermatology"], subSpecialties: ["Cosmetic", "Medical"],
    skills: ["Skin Analysis", "Laser"],
    rating: 4.7, reviewCount: 1, featured: true, verified: true,
    services: [{ name: "Skin Consultation", durationMin: 30, priceCents: 9000 }],
  },
  {
    n: 4, email: "dr.noah@clinicbook.io", fullName: "Dr. Noah Patel", slug: "dr-noah-patel",
    title: "PsyD", specialty: "Mental Health", clinicName: "MindWell Clinic",
    clinicAddress: "Austin, TX", city: "Austin", country: "USA",
    geoLat: 30.2672, geoLng: -97.7431,
    bio: "Clinical psychologist offering CBT and mindfulness-based therapy for anxiety, depression, and stress.",
    experienceYears: 11, languages: ["English", "Hindi"],
    certifications: ["Licensed Clinical Psychologist"], subSpecialties: ["Anxiety", "Depression"],
    skills: ["CBT", "Mindfulness"],
    rating: 5.0, reviewCount: 1, featured: true, verified: true,
    services: [{ name: "Therapy Session", durationMin: 60, priceCents: 13000 }],
  },
  {
    n: 5, email: "dr.omar@clinicbook.io", fullName: "Dr. Omar Farouk", slug: "dr-omar-farouk",
    title: "DDS", specialty: "Dentistry", clinicName: "BrightSmile Dental",
    clinicAddress: "77 Smile St, London", city: "London", country: "UK",
    geoLat: 51.5074, geoLng: -0.1278,
    bio: "Cosmetic and general dentist creating bright, healthy smiles with painless modern techniques.",
    experienceYears: 14, languages: ["English", "Arabic"],
    certifications: ["Licensed Dentist", "Invisalign Provider"], subSpecialties: ["Cosmetic", "Orthodontics"],
    skills: ["Whitening", "Aligners"],
    rating: 4.85, reviewCount: 1, featured: false, verified: true,
    services: [
      { name: "Dental Cleaning", durationMin: 45, priceCents: 9500 },
      { name: "Teeth Whitening", durationMin: 60, priceCents: 25000 },
    ],
  },
];

const REVIEWS = [
  { doctorN: 1, patientName: "Ayesha Khan", rating: 5, comment: "Dr. Johnson was thorough and kind. Booking was effortless.", reply: "Thank you, Ayesha! See you at your follow-up." },
  { doctorN: 1, patientName: "Daniel Rivera", rating: 5, comment: "Same-week appointment and zero wait. Highly recommend." },
  { doctorN: 1, patientName: "Mei Wong", rating: 4, comment: "Great care, slightly busy lobby." },
  { doctorN: 2, patientName: "Mei Wong", rating: 5, comment: "Explained everything clearly. Felt in great hands." },
  { doctorN: 3, patientName: "Ayesha Khan", rating: 4, comment: "Great skin advice and a clear treatment plan." },
  { doctorN: 4, patientName: "Daniel Rivera", rating: 5, comment: "The CBT sessions genuinely helped my anxiety." },
  { doctorN: 5, patientName: "Sara Ali", rating: 5, comment: "Painless cleaning, friendly staff, spotless clinic." },
];

async function main() {
  // 1. Module catalog.
  for (const m of MODULES) {
    await prisma.platformModule.upsert({
      where: { key: m.key },
      update: { name: m.name, description: m.description, sortOrder: m.sortOrder, status: m.status, isCore: m.isCore },
      create: m,
    });
  }
  console.log(`Modules: ${MODULES.length}`);

  // 2. Tenants + doctors + availability + services.
  for (const d of DOCTORS) {
    await prisma.tenant.upsert({
      where: { id: T(d.n) },
      update: {},
      create: { id: T(d.n), name: d.clinicName, slug: d.slug },
    });
    await prisma.doctor.upsert({
      where: { id: D(d.n) },
      update: {
        tenantId: T(d.n), title: d.title, city: d.city, country: d.country,
        geoLat: d.geoLat, geoLng: d.geoLng, experienceYears: d.experienceYears,
        languages: d.languages, certifications: d.certifications,
        subSpecialties: d.subSpecialties, skills: d.skills,
        rating: d.rating, reviewCount: d.reviewCount,
        featured: d.featured, verified: d.verified, marketplaceStatus: "active",
      },
      create: {
        id: D(d.n), email: d.email, fullName: d.fullName, slug: d.slug,
        specialty: d.specialty, clinicName: d.clinicName, clinicAddress: d.clinicAddress,
        timezone: "America/New_York", bio: d.bio, plan: "practice",
        tenantId: T(d.n), title: d.title, city: d.city, country: d.country,
        geoLat: d.geoLat, geoLng: d.geoLng, experienceYears: d.experienceYears,
        languages: d.languages, certifications: d.certifications,
        subSpecialties: d.subSpecialties, skills: d.skills,
        rating: d.rating, reviewCount: d.reviewCount,
        featured: d.featured, verified: d.verified, marketplaceStatus: "active",
      },
    });

    for (let day = 1; day <= 5; day++) {
      await prisma.availabilityRule.upsert({
        where: { doctorId_dayOfWeek: { doctorId: D(d.n), dayOfWeek: day } },
        update: {},
        create: {
          doctorId: D(d.n), dayOfWeek: day, startTime: "09:00", endTime: "17:00",
          slotDurationMin: 30, breakStart: "13:00", breakEnd: "14:00", isActive: true,
        },
      });
    }

    for (const s of d.services) {
      const existing = await prisma.service.findFirst({
        where: { doctorId: D(d.n), name: s.name },
      });
      if (!existing) {
        await prisma.service.create({
          data: { doctorId: D(d.n), name: s.name, durationMin: s.durationMin, priceCents: s.priceCents },
        });
      }
    }
  }
  console.log(`Doctors: ${DOCTORS.length} (with availability + services)`);

  // 3. Reviews (skip if already seeded).
  const reviewCount = await prisma.doctorReview.count();
  if (reviewCount === 0) {
    for (const r of REVIEWS) {
      await prisma.doctorReview.create({
        data: { doctorId: D(r.doctorN), patientName: r.patientName, rating: r.rating, comment: r.comment, reply: r.reply, repliedAt: r.reply ? new Date() : null },
      });
    }
    console.log(`Reviews: ${REVIEWS.length}`);
  }

  // 4. Demo doctor (Sarah): all paid modules active + an active mock subscription.
  const allModules = await prisma.platformModule.findMany({ where: { status: { not: "coming_soon" } } });
  for (const m of allModules) {
    await prisma.doctorModule.upsert({
      where: { doctorId_moduleId: { doctorId: D(1), moduleId: m.id } },
      update: { active: true },
      create: { doctorId: D(1), moduleId: m.id, active: true },
    });
  }
  const total = allModules.filter((m) => !m.isCore).reduce((s, m) => s + m.priceMonthlyCents, 0);
  await prisma.tenantSubscription.upsert({
    where: { doctorId: D(1) },
    update: { status: "active", totalMonthlyCents: total },
    create: { doctorId: D(1), tenantId: T(1), status: "active", provider: "mock", totalMonthlyCents: total, currentPeriodEnd: new Date(Date.now() + 30 * 86400000) },
  });
  console.log(`Demo subscription for ${DOCTORS[0].fullName}: $${(total / 100).toFixed(2)}/mo`);

  // 5. POS products for the demo doctor (skip if already seeded).
  const posCount = await prisma.posProduct.count({ where: { doctorId: D(1) } });
  if (posCount === 0) {
    await prisma.posProduct.createMany({
      data: POS_PRODUCTS.map((p) => ({ ...p, doctorId: D(1) })),
    });
    console.log(`POS products: ${POS_PRODUCTS.length}`);
  }

  console.log("\nSeed complete.");
  console.log("Marketplace: /doctors · Booking: /book/dr-sarah-johnson");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
