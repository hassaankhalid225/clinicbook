/** Static marketing content for the landing page. */

export interface Category {
  slug: string;
  name: string;
  icon: string; // lucide icon name
  doctorCount: number;
}

export const MOCK_CATEGORIES: Category[] = [
  { slug: "general", name: "General Physician", icon: "Stethoscope", doctorCount: 124 },
  { slug: "cardiology", name: "Cardiology", icon: "HeartPulse", doctorCount: 58 },
  { slug: "dermatology", name: "Dermatology", icon: "Sparkles", doctorCount: 73 },
  { slug: "mental-health", name: "Mental Health", icon: "Brain", doctorCount: 96 },
  { slug: "pediatrics", name: "Pediatrics", icon: "Baby", doctorCount: 41 },
  { slug: "dentistry", name: "Dentistry", icon: "Smile", doctorCount: 67 },
  { slug: "orthopedics", name: "Orthopedics", icon: "Bone", doctorCount: 35 },
  { slug: "nutrition", name: "Nutrition", icon: "Apple", doctorCount: 52 },
];

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    name: "Dr. Sarah Johnson",
    role: "General Physician",
    quote:
      "I went live in 10 minutes and filled my week without a single phone call. The booking page does the work for me.",
    rating: 5,
  },
  {
    name: "Ayesha K.",
    role: "Patient",
    quote:
      "Found a dermatologist near me, read real reviews, and booked a slot the same evening. So much better than calling around.",
    rating: 5,
  },
  {
    name: "Dr. Marcus Lee",
    role: "Cardiologist",
    quote:
      "The analytics finally show me my no-show patterns. Reminders cut them in half. Worth every penny.",
    rating: 5,
  },
  {
    name: "Daniel R.",
    role: "Patient",
    quote:
      "Rescheduled from my phone in 20 seconds. No hold music, no receptionist. This is how healthcare should work.",
    rating: 4,
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const MOCK_FAQS: Faq[] = [
  {
    q: "How quickly can I start taking bookings?",
    a: "Create your profile, set your availability, publish a service — most doctors are live in under 10 minutes.",
  },
  {
    q: "Do patients need an account to book?",
    a: "No. Patients book with just their name and phone number. Zero friction means more bookings.",
  },
  {
    q: "How is pricing structured?",
    a: "Flat monthly plans — no per-booking fees. Pick Free to start, then upgrade as you grow.",
  },
  {
    q: "Is my data secure and private?",
    a: "Yes. Data is encrypted, isolated per tenant, and handled with HIPAA/GDPR-aware practices.",
  },
  {
    q: "Can I manage multiple providers?",
    a: "Business and Enterprise plans support multi-provider clinics under one account.",
  },
  {
    q: "What about telemedicine and video visits?",
    a: "Telemedicine is on our Enterprise plan and rolling out — video rooms are generated per appointment.",
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Search & discover",
    body: "Find doctors by specialty, location, rating, and availability.",
    icon: "Search",
  },
  {
    step: 2,
    title: "Pick a time",
    body: "See real, live availability and choose a slot in your timezone.",
    icon: "CalendarClock",
  },
  {
    step: 3,
    title: "Book instantly",
    body: "Confirm in seconds and get reminders. No calls, no waiting.",
    icon: "CheckCircle2",
  },
];
