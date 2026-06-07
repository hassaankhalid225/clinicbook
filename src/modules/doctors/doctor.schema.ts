import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Enter your full name").max(100),
  specialty: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const updateDoctorSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  specialty: z.string().max(100).optional().nullable(),
  clinicName: z.string().max(150).optional().nullable(),
  clinicAddress: z.string().max(300).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  timezone: z.string().max(60).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),

  // Booking-page customization
  welcomeMessage: z.string().max(500).optional().nullable(),
  brandColor: z.string().regex(/^#([0-9a-fA-F]{6})$/).optional(),
  cancellationPolicy: z.string().max(500).optional().nullable(),
  currency: z.string().length(3).optional(),
  language: z.string().min(2).max(5).optional(),

  // Notifications & reminders
  smsEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  reminderHoursBefore: z.number().int().min(1).max(168).optional(),

  // No-show controls
  requireDeposit: z.boolean().optional(),
  depositAmount: z.number().min(0).max(100000).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
