import { z } from "zod";

export const updateStatusSchema = z.object({
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]),
});

export const listAppointmentsSchema = z.object({
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const updateNotesSchema = z.object({
  notes: z.string().max(2000),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListAppointmentsInput = z.infer<typeof listAppointmentsSchema>;
