import { z } from "zod";

export const slotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
});

export const createBookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm"),
  patientName: z.string().min(2, "Enter your full name").max(100),
  phone: z.string().min(5, "Enter a valid phone number").max(20),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  reason: z.string().min(2, "Tell us the reason for your visit").max(500),
  isTelehealth: z.boolean().optional().default(false),
});

export const joinWaitlistSchema = z.object({
  patientName: z.string().min(2).max(100),
  phone: z.string().min(5).max(20),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;
