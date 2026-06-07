import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";

const schema = z.object({
  doctorId: z.string(),
  serviceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  consultationType: z.enum(["online", "offline"]),
  reason: z.string().max(500).optional(),
});

export const POST = handle(async (req: NextRequest) => {
  const input = schema.parse(await req.json());
  const doctor = await repositories.doctors.getById(input.doctorId);
  if (!doctor) return ok({ error: "Doctor not found" }, 404);

  // In the mock phase the booking patient is the pinned demo client.
  const appointment = await repositories.appointments.create({
    tenantId: doctor.tenantId,
    doctorId: input.doctorId,
    clientId: MOCK_CURRENT.clientId,
    serviceId: input.serviceId,
    date: input.date,
    startTime: input.startTime,
    consultationType: input.consultationType,
    reason: input.reason,
  });
  return ok(appointment, 201);
});
