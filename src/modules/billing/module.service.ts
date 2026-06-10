import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { AppError, NotFoundError } from "@/lib/errors";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/**
 * Module billing service — the composable-plan engine.
 * Doctors select modules; the subscription total is always derived from the
 * CURRENT module prices in the DB (admin-editable with audit history).
 */
export const moduleService = {
  catalog() {
    return prisma.platformModule.findMany({ orderBy: { sortOrder: "asc" } });
  },

  /** Catalog + this doctor's active selection + live monthly total. */
  async summaryForDoctor(doctorId: string) {
    const [modules, selections, subscription] = await Promise.all([
      this.catalog(),
      prisma.doctorModule.findMany({ where: { doctorId, active: true } }),
      prisma.tenantSubscription.findUnique({ where: { doctorId } }),
    ]);
    const selectedIds = new Set(selections.map((s) => s.moduleId));
    const totalMonthlyCents = modules
      .filter((m) => selectedIds.has(m.id) && !m.isCore)
      .reduce((sum, m) => sum + m.priceMonthlyCents, 0);
    return {
      modules: modules.map((m) => ({
        id: m.id,
        key: m.key,
        name: m.name,
        description: m.description,
        priceMonthlyCents: m.priceMonthlyCents,
        isCore: m.isCore,
        status: m.status,
        selected: m.isCore || selectedIds.has(m.id),
      })),
      totalMonthlyCents,
      subscription,
    };
  },

  /** True when the doctor has an active selection of the given module key. */
  async hasModule(doctorId: string, key: string): Promise<boolean> {
    const row = await prisma.doctorModule.findFirst({
      where: { doctorId, active: true, module: { key } },
      select: { id: true },
    });
    if (row) return true;
    const core = await prisma.platformModule.findUnique({ where: { key } });
    return Boolean(core?.isCore);
  },

  /**
   * Applies a module selection and activates the subscription.
   * With Stripe configured this is called by the webhook after payment;
   * in mock mode it is called directly by checkout.
   */
  async activateSelection(
    doctorId: string,
    moduleIds: string[],
    opts: {
      provider: "stripe" | "mock";
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
    },
  ) {
    const modules = await prisma.platformModule.findMany({
      where: { id: { in: moduleIds } },
    });
    const core = await prisma.platformModule.findMany({ where: { isCore: true } });
    const all = [...new Map([...modules, ...core].map((m) => [m.id, m])).values()];
    const total = all
      .filter((m) => !m.isCore)
      .reduce((s, m) => s + m.priceMonthlyCents, 0);

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundError("Doctor not found");

    await prisma.$transaction(async (tx) => {
      // Deactivate modules no longer selected, upsert the selected set.
      await tx.doctorModule.updateMany({
        where: { doctorId, moduleId: { notIn: all.map((m) => m.id) } },
        data: { active: false },
      });
      for (const m of all) {
        await tx.doctorModule.upsert({
          where: { doctorId_moduleId: { doctorId, moduleId: m.id } },
          create: { doctorId, moduleId: m.id, active: true },
          update: { active: true, activatedAt: new Date() },
        });
      }
      await tx.tenantSubscription.upsert({
        where: { doctorId },
        create: {
          doctorId,
          tenantId: doctor.tenantId,
          status: "active",
          provider: opts.provider,
          stripeCustomerId: opts.stripeCustomerId,
          stripeSubscriptionId: opts.stripeSubscriptionId,
          totalMonthlyCents: total,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
        update: {
          status: "active",
          provider: opts.provider,
          stripeCustomerId: opts.stripeCustomerId ?? undefined,
          stripeSubscriptionId: opts.stripeSubscriptionId ?? undefined,
          totalMonthlyCents: total,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
      });
    });
    return { totalMonthlyCents: total };
  },

  /**
   * Starts checkout for a module selection. Returns a URL to send the doctor
   * to: Stripe Checkout when configured, otherwise instant mock activation.
   */
  async startCheckout(doctorId: string, doctorEmail: string, moduleIds: string[]) {
    const modules = await prisma.platformModule.findMany({
      where: { id: { in: moduleIds }, status: { not: "coming_soon" } },
    });
    if (modules.length === 0 && moduleIds.length > 0) {
      throw new AppError("No valid modules selected", 400);
    }
    const paid = modules.filter((m) => !m.isCore && m.priceMonthlyCents > 0);

    // Free selection (core/free modules only) — activate immediately.
    if (paid.length === 0) {
      await this.activateSelection(doctorId, modules.map((m) => m.id), {
        provider: "mock",
      });
      return { url: `${env.appUrl}/dashboard/modules?status=success&mode=free` };
    }

    if (!isStripeConfigured) {
      await this.activateSelection(doctorId, modules.map((m) => m.id), {
        provider: "mock",
      });
      await prisma.payment.create({
        data: {
          doctorId,
          kind: "module_subscription",
          status: "succeeded",
          provider: "mock",
          amountCents: paid.reduce((s, m) => s + m.priceMonthlyCents, 0),
        },
      });
      return { url: `${env.appUrl}/dashboard/modules?status=success&mode=test` };
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: doctorEmail,
      line_items: paid.map((m) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          recurring: { interval: "month" },
          unit_amount: m.priceMonthlyCents,
          product_data: { name: `ClinicBook module: ${m.name}` },
        },
      })),
      metadata: {
        kind: "module_subscription",
        doctorId,
        moduleIds: modules.map((m) => m.id).join(","),
      },
      success_url: `${env.appUrl}/dashboard/modules?status=success`,
      cancel_url: `${env.appUrl}/dashboard/modules?status=cancelled`,
    });
    await prisma.payment.create({
      data: {
        doctorId,
        kind: "module_subscription",
        status: "pending",
        provider: "stripe",
        amountCents: paid.reduce((s, m) => s + m.priceMonthlyCents, 0),
        stripeSessionId: session.id,
      },
    });
    return { url: session.url! };
  },

  /** Toggle a single module on/off after initial setup. */
  async toggleModule(doctorId: string, moduleKey: string, active: boolean) {
    const module = await prisma.platformModule.findUnique({ where: { key: moduleKey } });
    if (!module) throw new NotFoundError("Module not found");
    if (module.isCore && !active) {
      throw new AppError("Core modules cannot be disabled", 400);
    }
    await prisma.doctorModule.upsert({
      where: { doctorId_moduleId: { doctorId, moduleId: module.id } },
      create: { doctorId, moduleId: module.id, active },
      update: { active },
    });
    // Recompute the subscription total from current selections.
    const { totalMonthlyCents } = await this.summaryForDoctor(doctorId);
    await prisma.tenantSubscription.updateMany({
      where: { doctorId },
      data: { totalMonthlyCents },
    });
    return { totalMonthlyCents };
  },

  /** Admin: edit a module's price (audited). */
  async updatePrice(moduleId: string, newPriceCents: number, changedBy?: string) {
    const module = await prisma.platformModule.findUnique({ where: { id: moduleId } });
    if (!module) throw new NotFoundError("Module not found");
    const [updated] = await prisma.$transaction([
      prisma.platformModule.update({
        where: { id: moduleId },
        data: { priceMonthlyCents: newPriceCents },
      }),
      prisma.modulePriceHistory.create({
        data: {
          moduleId,
          oldPriceCents: module.priceMonthlyCents,
          newPriceCents,
          changedBy,
        },
      }),
    ]);
    return updated;
  },
};
