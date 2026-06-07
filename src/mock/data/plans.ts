import type { Plan } from "@/core/types";

export const MOCK_PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    description: "Get discovered and take your first bookings.",
    modules: ["booking", "services"],
    limits: { services: 2, monthlyBookings: 20, providers: 1 },
  },
  {
    id: "professional",
    name: "Professional",
    priceMonthly: 29,
    description: "Everything a solo doctor needs to run online.",
    modules: ["booking", "services", "calendar", "reviews", "expertise"],
    limits: { services: 10, monthlyBookings: null, providers: 1 },
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 79,
    description: "Analytics, messaging, and a richer profile.",
    modules: [
      "booking",
      "services",
      "calendar",
      "reviews",
      "expertise",
      "analytics",
      "messaging",
    ],
    limits: { services: null, monthlyBookings: null, providers: 3 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 199,
    description: "Telemedicine, multi-provider clinics, and priority support.",
    modules: [
      "booking",
      "services",
      "calendar",
      "reviews",
      "expertise",
      "analytics",
      "messaging",
      "telemedicine",
    ],
    limits: { services: null, monthlyBookings: null, providers: null },
  },
];
