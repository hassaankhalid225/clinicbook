import type { Plan } from "@prisma/client";

export interface PlanConfig {
  id: Plan;
  name: string;
  priceMonthly: number;
  /** Max bookings allowed per day. null = unlimited. */
  dailyBookingLimit: number | null;
  features: string[];
  branded: boolean;
}

export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    dailyBookingLimit: 3,
    branded: true,
    features: ["3 bookings/day", "Public booking link", "ClinicBook branding"],
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    dailyBookingLimit: null,
    branded: false,
    features: ["Unlimited bookings", "Custom link", "SMS reminders", "No-show tracking"],
  },
  practice: {
    id: "practice",
    name: "Practice",
    priceMonthly: 79,
    dailyBookingLimit: null,
    branded: false,
    features: ["Everything in Starter", "Analytics", "Telehealth", "Up to 3 providers"],
  },
  pro: {
    id: "pro",
    name: "Clinic Pro",
    priceMonthly: 149,
    dailyBookingLimit: null,
    branded: false,
    features: ["Everything in Practice", "Waitlist auto-fill", "AI no-show prediction", "Priority support"],
  },
};

export const PUBLIC_PLANS: PlanConfig[] = [
  PLANS.free,
  PLANS.starter,
  PLANS.practice,
  PLANS.pro,
];

export function getPlan(plan: Plan): PlanConfig {
  return PLANS[plan];
}
