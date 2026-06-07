import { prisma } from "@/lib/prisma";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { ServiceInput } from "./service.schema";

/** Appointment-type / service catalog per doctor. */
export const serviceService = {
  list(doctorId: string, activeOnly = false) {
    return prisma.service.findMany({
      where: { doctorId, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  },

  create(doctorId: string, input: ServiceInput) {
    return prisma.service.create({ data: { doctorId, ...input } });
  },

  async update(doctorId: string, id: string, input: Partial<ServiceInput>) {
    await this.assertOwned(doctorId, id);
    return prisma.service.update({ where: { id }, data: input });
  },

  async remove(doctorId: string, id: string) {
    await this.assertOwned(doctorId, id);
    await prisma.service.delete({ where: { id } });
  },

  async assertOwned(doctorId: string, id: string) {
    const svc = await prisma.service.findUnique({
      where: { id },
      select: { doctorId: true },
    });
    if (!svc) throw new NotFoundError("Service not found");
    if (svc.doctorId !== doctorId) throw new ForbiddenError();
  },
};
