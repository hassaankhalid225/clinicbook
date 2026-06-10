import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { queueService } from "@/modules/queue/queue.service";

export const GET = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  const date = req.nextUrl.searchParams.get("date") ?? undefined;
  return ok(await queueService.board(doctor.id, date));
});

const checkInSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  patientName: z.string().min(2).max(100).optional(),
});

export const POST = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  const input = checkInSchema.parse(await req.json());
  return ok(await queueService.checkIn(doctor.id, input), 201);
});
