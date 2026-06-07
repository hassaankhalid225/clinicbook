import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";

const schema = z.object({ doctorId: z.string() });

export const POST = handle(async (req: NextRequest) => {
  const { doctorId } = schema.parse(await req.json());
  const client = await repositories.clients.toggleFavorite(MOCK_CURRENT.clientId, doctorId);
  return ok({ favorited: client.favoriteDoctorIds.includes(doctorId) });
});
