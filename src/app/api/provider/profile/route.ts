import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/core/auth/session";
import { MOCK_CURRENT } from "@/core/utils/session";

const csv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) =>
    v == null
      ? undefined
      : Array.isArray(v)
        ? v
        : v.split(",").map((s) => s.trim()).filter(Boolean),
  );

const schema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  title: z.string().max(60).optional(),
  specialty: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  clinicName: z.string().max(150).optional(),
  clinicAddress: z.string().max(300).optional(),
  city: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  experienceYears: z.coerce.number().int().min(0).max(80).optional(),
  languages: csv,
  certifications: csv,
  subSpecialties: csv,
  skills: csv,
  procedures: csv,
});

/** Doctor edits their own marketplace profile + expertise (persists to DB). */
export const PUT = handle(async (req: NextRequest) => {
  await requireRole(["doctor"]);
  const data = schema.parse(await req.json());
  const doctor = await prisma.doctor.update({
    where: { id: MOCK_CURRENT.doctorId },
    data,
  });
  return ok({ id: doctor.id });
});
