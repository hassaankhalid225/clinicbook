import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { queueService } from "@/modules/queue/queue.service";

const schema = z.object({ action: z.enum(["start", "complete", "skip", "cancel"]) });

export const PUT = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const doctor = await requireDoctorApi();
    const { id } = await ctx.params;
    const { action } = schema.parse(await req.json());
    return ok(await queueService.transition(doctor.id, id, action));
  },
);
