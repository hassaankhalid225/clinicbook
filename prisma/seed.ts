/**
 * Seeds a demo doctor (Dr. Sarah Johnson) with weekday availability and a few
 * sample appointments so the public booking page works out of the box.
 *
 * Note: this only creates database rows. To LOG IN as this doctor you must also
 * create a Supabase auth user with the same id (DEMO_DOCTOR_ID) — the public
 * booking page at /book/dr-sarah-johnson needs no auth and works immediately.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fixed id so re-seeding is idempotent. Replace with a real Supabase auth user
// id if you want to log in as this doctor.
const DEMO_DOCTOR_ID = "00000000-0000-4000-8000-000000000001";

function dateInDays(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function main() {
  const doctor = await prisma.doctor.upsert({
    where: { id: DEMO_DOCTOR_ID },
    update: {},
    create: {
      id: DEMO_DOCTOR_ID,
      email: "dr.sarah@clinicbook.io",
      fullName: "Dr. Sarah Johnson",
      slug: "dr-sarah-johnson",
      specialty: "General Physician",
      clinicName: "HealthFirst Clinic",
      clinicAddress: "123 Main St, Manhattan, NY",
      phone: "+1 212 555 0199",
      timezone: "America/New_York",
      bio: "Board-certified family physician with 12 years of experience. Same-week appointments available.",
      plan: "practice",
    },
  });

  // Weekday availability: Mon–Fri, 9:00–17:00, 30-min slots, lunch 13:00–14:00.
  for (let day = 1; day <= 5; day++) {
    await prisma.availabilityRule.upsert({
      where: { doctorId_dayOfWeek: { doctorId: doctor.id, dayOfWeek: day } },
      update: {},
      create: {
        doctorId: doctor.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMin: 30,
        breakStart: "13:00",
        breakEnd: "14:00",
        isActive: true,
      },
    });
  }

  // A couple of sample appointments for the dashboard demo.
  const patient = await prisma.patient.upsert({
    where: { id: "00000000-0000-4000-8000-0000000000a1" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-0000000000a1",
      fullName: "John Smith",
      phone: "+1 555 0100",
      email: "john@example.com",
    },
  });

  await prisma.appointment.upsert({
    where: {
      doctorId_appointmentDate_startTime: {
        doctorId: doctor.id,
        appointmentDate: dateInDays(1),
        startTime: "10:00",
      },
    },
    update: {},
    create: {
      doctorId: doctor.id,
      patientId: patient.id,
      appointmentDate: dateInDays(1),
      startTime: "10:00",
      endTime: "10:30",
      reason: "Annual checkup",
      status: "scheduled",
    },
  });

  console.log("Seeded demo doctor:", doctor.slug);
  console.log("Public booking page: /book/dr-sarah-johnson");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
