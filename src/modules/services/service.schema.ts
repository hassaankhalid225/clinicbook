import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  durationMin: z.number().int().min(5).max(480),
  priceCents: z.number().int().min(0).max(100_000_00),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Use a hex color like #0ea5e9")
    .optional(),
  isTelehealth: z.boolean().optional(),
  intakeNote: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
