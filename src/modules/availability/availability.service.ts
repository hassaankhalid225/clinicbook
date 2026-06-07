import { prisma } from "@/lib/prisma";
import { parseDateOnly } from "@/lib/datetime";
import type {
  UpsertAvailabilityInput,
  BlockSlotInput,
} from "./availability.schema";

/**
 * Availability domain service. Manages weekly recurring availability rules and
 * one-off blocked slots for a doctor.
 */
export const availabilityService = {
  listRules(doctorId: string) {
    return prisma.availabilityRule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: "asc" },
    });
  },

  /** Creates or updates the rule for a given weekday (one rule per day). */
  upsertRule(doctorId: string, input: UpsertAvailabilityInput) {
    const { dayOfWeek, ...rest } = input;
    return prisma.availabilityRule.upsert({
      where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } },
      create: { doctorId, dayOfWeek, ...rest },
      update: rest,
    });
  },

  async deleteRule(doctorId: string, dayOfWeek: number) {
    await prisma.availabilityRule.deleteMany({ where: { doctorId, dayOfWeek } });
  },

  listBlocks(doctorId: string) {
    return prisma.blockedSlot.findMany({
      where: { doctorId },
      orderBy: { blockedDate: "asc" },
    });
  },

  addBlock(doctorId: string, input: BlockSlotInput) {
    return prisma.blockedSlot.create({
      data: {
        doctorId,
        blockedDate: parseDateOnly(input.blockedDate),
        startTime: input.startTime ?? null,
        endTime: input.endTime ?? null,
        reason: input.reason ?? null,
      },
    });
  },

  async removeBlock(doctorId: string, blockId: string) {
    await prisma.blockedSlot.deleteMany({ where: { id: blockId, doctorId } });
  },
};
