import { prisma } from "@/lib/prisma";

/** Platform-wide billing stats for the admin, all from real DB tables. */
export const adminBillingService = {
  async overview() {
    const [subs, modules, doctorModules] = await Promise.all([
      prisma.tenantSubscription.findMany({
        include: { doctor: { select: { fullName: true, slug: true, marketplaceStatus: true } } },
        orderBy: { totalMonthlyCents: "desc" },
      }),
      prisma.platformModule.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.doctorModule.findMany({ where: { active: true } }),
    ]);

    const activeSubs = subs.filter((s) => s.status === "active");
    const mrrCents = activeSubs.reduce((sum, s) => sum + s.totalMonthlyCents, 0);

    // Per-module adoption + recurring revenue.
    const countByModule = new Map<string, number>();
    for (const dm of doctorModules) {
      countByModule.set(dm.moduleId, (countByModule.get(dm.moduleId) ?? 0) + 1);
    }
    const moduleStats = modules.map((m) => {
      const doctors = countByModule.get(m.id) ?? 0;
      return {
        key: m.key,
        name: m.name,
        isCore: m.isCore,
        priceMonthlyCents: m.priceMonthlyCents,
        doctors,
        monthlyRevenueCents: m.isCore ? 0 : doctors * m.priceMonthlyCents,
      };
    });

    const statusCounts = subs.reduce<Record<string, number>>((acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    }, {});

    return { subs, activeCount: activeSubs.length, mrrCents, moduleStats, statusCounts };
  },
};
