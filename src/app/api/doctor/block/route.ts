import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { availabilityService } from "@/modules/availability/availability.service";
import { blockSlotSchema } from "@/modules/availability/availability.schema";

export const GET = handle(async () => {
  const doctor = await requireDoctorApi();
  return ok(await availabilityService.listBlocks(doctor.id));
});

export const POST = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  const input = blockSlotSchema.parse(await req.json());
  const block = await availabilityService.addBlock(doctor.id, input);
  return ok(block, 201);
});
