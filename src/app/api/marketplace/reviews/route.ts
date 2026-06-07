import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, fail } from "@/lib/api";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";

const schema = z.object({
  doctorId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(500),
});

export const POST = handle(async (req: NextRequest) => {
  const input = schema.parse(await req.json());
  const [doctor, client] = await Promise.all([
    repositories.doctors.getById(input.doctorId),
    repositories.clients.getById(MOCK_CURRENT.clientId),
  ]);
  if (!doctor || !client) return fail("Not found", 404);

  const review = await repositories.reviews.create({
    tenantId: doctor.tenantId,
    doctorId: input.doctorId,
    clientId: client.id,
    clientName: client.fullName,
    rating: input.rating,
    comment: input.comment,
  });
  return ok(review, 201);
});
