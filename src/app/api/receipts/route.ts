import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { appointmentService } from "@/modules/appointments/appointment.service";
import { receiptService } from "@/modules/receipts/receipt.service";

const schema = z.object({ appointmentId: z.string().uuid() });

/** Doctor generates (or fetches) the receipt for one of their appointments. */
export const POST = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  const { appointmentId } = schema.parse(await req.json());
  await appointmentService.assertOwned(doctor.id, appointmentId);
  const receipt = await receiptService.createForAppointment(appointmentId);
  return ok({ id: receipt.id, receiptNumber: receipt.receiptNumber }, 201);
});

export const GET = handle(async () => {
  const doctor = await requireDoctorApi();
  return ok(await receiptService.listForDoctor(doctor.id));
});
