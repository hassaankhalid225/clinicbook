import { prisma } from "@/lib/prisma";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

/** Doctor-facing waitlist management. */
export const waitlistService = {
  list(doctorId: string) {
    return prisma.waitlist.findMany({
      where: { doctorId, status: { in: ["waiting", "invited"] } },
      include: { patient: { select: { fullName: true, phone: true } } },
      orderBy: { createdAt: "asc" },
    });
  },

  /** Manually invite a waiting patient (marks invited, sets a 2h expiry). */
  async invite(doctorId: string, id: string) {
    await this.assertOwned(doctorId, id);
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    return prisma.waitlist.update({
      where: { id },
      data: { status: "invited", notifiedAt: new Date(), inviteExpiresAt: expires },
    });
  },

  async remove(doctorId: string, id: string) {
    await this.assertOwned(doctorId, id);
    await prisma.waitlist.delete({ where: { id } });
  },

  async assertOwned(doctorId: string, id: string) {
    const row = await prisma.waitlist.findUnique({
      where: { id },
      select: { doctorId: true },
    });
    if (!row) throw new NotFoundError("Waitlist entry not found");
    if (row.doctorId !== doctorId) throw new ForbiddenError();
  },
};
