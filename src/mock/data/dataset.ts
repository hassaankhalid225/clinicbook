/**
 * In-memory marketplace dataset. Mutable arrays so mock repositories can
 * create/update during a session (resets on server restart). Shapes match the
 * domain types exactly, so swapping to Prisma is a 1:1 mapping.
 */
import type {
  Appointment,
  AvailabilityRule,
  BlockedDate,
  Client,
  Doctor,
  Review,
  Service,
  Subscription,
  Tenant,
} from "@/core/types";

const now = new Date();
const iso = (d: Date) => d.toISOString();
function daysFromNow(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
const ts = { createdAt: iso(now), updatedAt: iso(now) };

// ── Tenants (one per doctor) ───────────────────────────────────────────────
export const tenants: Tenant[] = [
  { id: "t-1", name: "Johnson Family Practice", slug: "johnson", ownerDoctorId: "d-1", planId: "business", status: "active", ...ts },
  { id: "t-2", name: "Lee Cardiology", slug: "lee-cardio", ownerDoctorId: "d-2", planId: "enterprise", status: "active", ...ts },
  { id: "t-3", name: "Glow Dermatology", slug: "glow-derm", ownerDoctorId: "d-3", planId: "professional", status: "active", ...ts },
  { id: "t-4", name: "MindWell Clinic", slug: "mindwell", ownerDoctorId: "d-4", planId: "professional", status: "active", ...ts },
  { id: "t-5", name: "Little Steps Pediatrics", slug: "little-steps", ownerDoctorId: "d-5", planId: "free", status: "trial", ...ts },
  { id: "t-6", name: "BrightSmile Dental", slug: "brightsmile", ownerDoctorId: "d-6", planId: "business", status: "active", ...ts },
];

function mkExpertise(specialty: string, subs: string[], skills: string[], procs: string[]) {
  return { specialty, subSpecialties: subs, skills, procedures: procs };
}

// ── Doctors ────────────────────────────────────────────────────────────────
export const doctors: Doctor[] = [
  {
    id: "d-1", tenantId: "t-1", username: "dr-sarah-johnson", fullName: "Dr. Sarah Johnson",
    title: "MD, FAAFP", specialty: "General Physician",
    bio: "Board-certified family physician with 12 years of experience helping families stay healthy with same-week appointments and a patient-first approach.",
    qualification: "MD — Johns Hopkins", certifications: ["Board Certified Family Medicine", "ACLS", "BLS"],
    experienceYears: 12, languages: ["English", "Spanish"],
    education: [{ degree: "MD", institution: "Johns Hopkins", year: "2011" }, { degree: "Residency, Family Medicine", institution: "Mayo Clinic", year: "2014" }],
    awards: [{ title: "Top Doctor", issuer: "City Health Awards", year: "2023" }],
    publications: [{ title: "Preventive Care in Primary Practice", year: "2020" }],
    social: { website: "https://example.com", linkedin: "https://linkedin.com" },
    expertise: mkExpertise("General Medicine", ["Preventive Care", "Chronic Disease"], ["Diagnosis", "Wellness Plans"], ["Health Screening", "Vaccinations"]),
    clinicName: "HealthFirst Clinic", address: { line1: "123 Main St", city: "Manhattan", state: "NY", country: "USA", geo: { lat: 40.7831, lng: -73.9712 } },
    consultationType: "both", rating: 4.9, reviewCount: 132, profileViews: 4210, featured: true, verified: true, status: "active",
    planId: "business", enabledModules: ["booking", "services", "calendar", "reviews", "expertise", "analytics"], ...ts,
  },
  {
    id: "d-2", tenantId: "t-2", username: "dr-marcus-lee", fullName: "Dr. Marcus Lee",
    title: "MD, FACC", specialty: "Cardiology",
    bio: "Interventional cardiologist focused on preventive heart health and minimally invasive procedures.",
    qualification: "MD — Stanford", certifications: ["Board Certified Cardiology", "Interventional Cardiology"],
    experienceYears: 18, languages: ["English", "Mandarin"],
    education: [{ degree: "MD", institution: "Stanford", year: "2005" }], awards: [{ title: "Excellence in Cardiology", issuer: "AHA", year: "2022" }],
    publications: [{ title: "Outcomes in Minimally Invasive PCI", year: "2019" }],
    social: { linkedin: "https://linkedin.com" },
    expertise: mkExpertise("Cardiology", ["Interventional", "Preventive"], ["Echocardiography", "Stress Testing"], ["Angioplasty", "Stent Placement"]),
    clinicName: "Lee Heart Center", address: { line1: "9 Cardiac Ave", city: "San Francisco", state: "CA", country: "USA", geo: { lat: 37.7749, lng: -122.4194 } },
    consultationType: "offline", rating: 4.8, reviewCount: 87, profileViews: 3120, featured: true, verified: true, status: "active",
    planId: "enterprise", enabledModules: ["booking", "services", "calendar", "reviews", "expertise", "analytics", "messaging", "telemedicine"], ...ts,
  },
  {
    id: "d-3", tenantId: "t-3", username: "dr-amara-okafor", fullName: "Dr. Amara Okafor",
    title: "MD", specialty: "Dermatology",
    bio: "Dermatologist specializing in medical and cosmetic skin care, acne, and skin cancer screening.",
    qualification: "MD — UCLA", certifications: ["Board Certified Dermatology"],
    experienceYears: 9, languages: ["English", "French"],
    education: [{ degree: "MD", institution: "UCLA", year: "2014" }], awards: [],
    publications: [], social: { instagram: "https://instagram.com" },
    expertise: mkExpertise("Dermatology", ["Cosmetic", "Medical"], ["Skin Analysis", "Laser"], ["Biopsy", "Mole Removal"]),
    clinicName: "Glow Dermatology", address: { line1: "44 Skin Blvd", city: "Los Angeles", state: "CA", country: "USA", geo: { lat: 34.0522, lng: -118.2437 } },
    consultationType: "both", rating: 4.7, reviewCount: 64, profileViews: 2740, featured: true, verified: true, status: "active",
    planId: "professional", enabledModules: ["booking", "services", "calendar", "reviews", "expertise"], ...ts,
  },
  {
    id: "d-4", tenantId: "t-4", username: "dr-noah-patel", fullName: "Dr. Noah Patel",
    title: "PsyD", specialty: "Mental Health",
    bio: "Clinical psychologist offering CBT and mindfulness-based therapy for anxiety, depression, and stress.",
    qualification: "PsyD — Columbia", certifications: ["Licensed Clinical Psychologist"],
    experienceYears: 11, languages: ["English", "Hindi"],
    education: [{ degree: "PsyD", institution: "Columbia", year: "2013" }], awards: [],
    publications: [{ title: "Digital CBT Efficacy", year: "2021" }], social: {},
    expertise: mkExpertise("Mental Health", ["Anxiety", "Depression"], ["CBT", "Mindfulness"], ["Therapy Sessions"]),
    clinicName: "MindWell Clinic", address: { city: "Austin", state: "TX", country: "USA", geo: { lat: 30.2672, lng: -97.7431 } },
    consultationType: "online", rating: 4.95, reviewCount: 158, profileViews: 5300, featured: true, verified: true, status: "active",
    planId: "professional", enabledModules: ["booking", "services", "calendar", "reviews", "expertise"], ...ts,
  },
  {
    id: "d-5", tenantId: "t-5", username: "dr-emily-chen", fullName: "Dr. Emily Chen",
    title: "MD", specialty: "Pediatrics",
    bio: "Pediatrician dedicated to gentle, family-centered care from newborns to teens.",
    qualification: "MD — Toronto", certifications: ["Board Certified Pediatrics"],
    experienceYears: 7, languages: ["English", "Cantonese"],
    education: [{ degree: "MD", institution: "University of Toronto", year: "2016" }], awards: [],
    publications: [], social: {},
    expertise: mkExpertise("Pediatrics", ["Newborn", "Adolescent"], ["Growth Monitoring", "Immunization"], ["Well-child Visits"]),
    clinicName: "Little Steps Pediatrics", address: { city: "Toronto", country: "Canada", geo: { lat: 43.6532, lng: -79.3832 } },
    consultationType: "both", rating: 4.6, reviewCount: 29, profileViews: 980, featured: false, verified: false, status: "pending",
    planId: "free", enabledModules: ["booking", "services"], ...ts,
  },
  {
    id: "d-6", tenantId: "t-6", username: "dr-omar-farouk", fullName: "Dr. Omar Farouk",
    title: "DDS", specialty: "Dentistry",
    bio: "Cosmetic and general dentist creating bright, healthy smiles with painless modern techniques.",
    qualification: "DDS — NYU", certifications: ["Licensed Dentist", "Invisalign Provider"],
    experienceYears: 14, languages: ["English", "Arabic"],
    education: [{ degree: "DDS", institution: "NYU", year: "2009" }], awards: [{ title: "Best Dentist", issuer: "City Choice", year: "2021" }],
    publications: [], social: { website: "https://example.com" },
    expertise: mkExpertise("Dentistry", ["Cosmetic", "Orthodontics"], ["Whitening", "Aligners"], ["Cleaning", "Fillings", "Crowns"]),
    clinicName: "BrightSmile Dental", address: { line1: "77 Smile St", city: "London", country: "UK", geo: { lat: 51.5074, lng: -0.1278 } },
    consultationType: "offline", rating: 4.85, reviewCount: 102, profileViews: 3650, featured: false, verified: true, status: "active",
    planId: "business", enabledModules: ["booking", "services", "calendar", "reviews", "expertise", "analytics", "messaging"], ...ts,
  },
];

// ── Services ─────────────────────────────────────────────────────────────────
let sId = 0;
const svc = (doctorId: string, tenantId: string, title: string, desc: string, durationMin: number, price: number, category: string, type: Service["consultationType"]): Service => ({
  id: `s-${++sId}`, doctorId, tenantId, title, description: desc, durationMin, priceCents: price * 100, currency: "USD", category, consultationType: type, isActive: true, ...ts,
});
export const services: Service[] = [
  svc("d-1", "t-1", "General Consultation", "Comprehensive check-up and diagnosis.", 30, 60, "General", "both"),
  svc("d-1", "t-1", "Follow-up Visit", "Review progress and adjust treatment.", 15, 35, "General", "both"),
  svc("d-2", "t-2", "Cardiac Assessment", "Full cardiovascular evaluation.", 45, 180, "Cardiology", "offline"),
  svc("d-2", "t-2", "Echocardiogram Review", "Discuss imaging results.", 30, 120, "Cardiology", "offline"),
  svc("d-3", "t-3", "Skin Consultation", "Diagnosis and treatment plan.", 30, 90, "Dermatology", "both"),
  svc("d-3", "t-3", "Cosmetic Consult", "Aesthetic options and planning.", 30, 110, "Dermatology", "offline"),
  svc("d-4", "t-4", "Therapy Session", "50-minute CBT session.", 50, 130, "Mental Health", "online"),
  svc("d-4", "t-4", "Intake Assessment", "Initial evaluation and goals.", 60, 150, "Mental Health", "online"),
  svc("d-5", "t-5", "Well-child Visit", "Routine pediatric check-up.", 30, 70, "Pediatrics", "both"),
  svc("d-6", "t-6", "Dental Cleaning", "Professional cleaning and exam.", 45, 95, "Dentistry", "offline"),
  svc("d-6", "t-6", "Teeth Whitening", "In-office whitening session.", 60, 250, "Dentistry", "offline"),
];

// ── Availability (Mon–Fri 9–17, 30-min, lunch 13–14 for all doctors) ─────────
export const availabilityRules: AvailabilityRule[] = doctors.flatMap((d) =>
  [1, 2, 3, 4, 5].map((day) => ({
    id: `av-${d.id}-${day}`, tenantId: d.tenantId, doctorId: d.id, dayOfWeek: day,
    startTime: "09:00", endTime: "17:00", slotDurationMin: 30, breakStart: "13:00", breakEnd: "14:00", isActive: true,
  })),
);
export const blockedDates: BlockedDate[] = [
  { id: "bd-1", tenantId: "t-1", doctorId: "d-1", date: daysFromNow(10), reason: "Conference", isHoliday: false },
];

// ── Clients ──────────────────────────────────────────────────────────────────
export const clients: Client[] = [
  { id: "c-1", tenantId: "t-1", fullName: "Ayesha Khan", email: "ayesha@example.com", phone: "+1 555 0100", city: "Manhattan", country: "USA", favoriteDoctorIds: ["d-1", "d-3"], savedDoctorIds: ["d-4"], ...ts },
  { id: "c-2", tenantId: "t-1", fullName: "Daniel Rivera", email: "daniel@example.com", phone: "+1 555 0102", city: "Austin", country: "USA", favoriteDoctorIds: ["d-4"], savedDoctorIds: [], ...ts },
  { id: "c-3", tenantId: "t-2", fullName: "Mei Wong", email: "mei@example.com", phone: "+1 555 0103", city: "San Francisco", country: "USA", favoriteDoctorIds: ["d-2"], savedDoctorIds: ["d-1"], ...ts },
];

// ── Appointments ─────────────────────────────────────────────────────────────
let aId = 0;
const appt = (doctorId: string, tenantId: string, clientId: string, clientName: string, serviceId: string, serviceTitle: string, date: string, startTime: string, endTime: string, status: Appointment["status"], price: number, type: "online" | "offline", doctorName: string): Appointment => ({
  id: `a-${++aId}`, tenantId, doctorId, clientId, serviceId, date, startTime, endTime, status, consultationType: type, priceCents: price * 100, doctorName, clientName, serviceTitle, ...ts,
});
export const appointments: Appointment[] = [
  appt("d-1", "t-1", "c-1", "Ayesha Khan", "s-1", "General Consultation", daysFromNow(1), "10:00", "10:30", "confirmed", 60, "offline", "Dr. Sarah Johnson"),
  appt("d-1", "t-1", "c-2", "Daniel Rivera", "s-2", "Follow-up Visit", daysFromNow(2), "11:00", "11:15", "pending", 35, "online", "Dr. Sarah Johnson"),
  appt("d-1", "t-1", "c-1", "Ayesha Khan", "s-1", "General Consultation", daysFromNow(-5), "09:30", "10:00", "completed", 60, "offline", "Dr. Sarah Johnson"),
  appt("d-1", "t-1", "c-2", "Daniel Rivera", "s-2", "Follow-up Visit", daysFromNow(-12), "14:00", "14:15", "no_show", 35, "offline", "Dr. Sarah Johnson"),
  appt("d-2", "t-2", "c-3", "Mei Wong", "s-3", "Cardiac Assessment", daysFromNow(3), "09:00", "09:45", "confirmed", 180, "offline", "Dr. Marcus Lee"),
  appt("d-4", "t-4", "c-2", "Daniel Rivera", "s-7", "Therapy Session", daysFromNow(1), "15:00", "15:50", "confirmed", 130, "online", "Dr. Noah Patel"),
];

// ── Reviews ──────────────────────────────────────────────────────────────────
let rId = 0;
const rev = (doctorId: string, tenantId: string, clientId: string, clientName: string, rating: number, comment: string, reply?: string): Review => ({
  id: `r-${++rId}`, tenantId, doctorId, clientId, clientName, rating, comment, reply, repliedAt: reply ? iso(now) : undefined, ...ts,
});
export const reviews: Review[] = [
  rev("d-1", "t-1", "c-1", "Ayesha Khan", 5, "Dr. Johnson was thorough and kind. Booking was effortless.", "Thank you, Ayesha! See you at your follow-up."),
  rev("d-1", "t-1", "c-2", "Daniel Rivera", 5, "Same-week appointment and zero wait. Highly recommend."),
  rev("d-2", "t-2", "c-3", "Mei Wong", 5, "Explained everything clearly. Felt in great hands."),
  rev("d-4", "t-4", "c-2", "Daniel Rivera", 5, "The CBT sessions genuinely helped my anxiety."),
  rev("d-3", "t-3", "c-1", "Ayesha Khan", 4, "Great skin advice, slightly long wait in the lobby."),
];

// ── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions: Subscription[] = doctors.map((d, i) => ({
  id: `sub-${i + 1}`, tenantId: d.tenantId, doctorId: d.id, planId: d.planId as Subscription["planId"],
  status: d.planId === "free" ? "trialing" : "active", renewsAt: daysFromNow(30), ...ts,
}));
