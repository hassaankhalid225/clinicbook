import { z } from "zod";

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm (e.g. 09:00)");

export const upsertAvailabilitySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: timeString,
    endTime: timeString,
    slotDurationMin: z.union([
      z.literal(15),
      z.literal(20),
      z.literal(30),
      z.literal(60),
    ]),
    breakStart: timeString.optional().nullable(),
    breakEnd: timeString.optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.startTime < v.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine(
    (v) =>
      (v.breakStart == null && v.breakEnd == null) ||
      (v.breakStart != null && v.breakEnd != null && v.breakStart < v.breakEnd),
    { message: "Break end must be after break start", path: ["breakEnd"] },
  );

export const blockSlotSchema = z
  .object({
    blockedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
    startTime: timeString.optional().nullable(),
    endTime: timeString.optional().nullable(),
    reason: z.string().max(300).optional().nullable(),
  })
  .refine(
    (v) =>
      (v.startTime == null && v.endTime == null) ||
      (v.startTime != null && v.endTime != null && v.startTime < v.endTime),
    { message: "End time must be after start time", path: ["endTime"] },
  );

export type UpsertAvailabilityInput = z.infer<typeof upsertAvailabilitySchema>;
export type BlockSlotInput = z.infer<typeof blockSlotSchema>;
