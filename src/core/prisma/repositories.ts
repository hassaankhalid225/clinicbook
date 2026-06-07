/**
 * Prisma repository implementations (Phase 2).
 *
 * These satisfy the exact same `Repositories` interface as the mock layer.
 * They are intentionally stubbed for the UI-first phase: the marketplace runs
 * on mock data today. When you're ready to go live, implement each method
 * against `prisma` (the models already exist for the core scheduling domain;
 * marketplace-only models such as Client/Review/Subscription would be added to
 * `schema.prisma`) and flip `DATA_SOURCE=prisma` — no UI changes required.
 */
import type { Repositories } from "@/core/repositories/interfaces";

function notImplemented(name: string): never {
  throw new Error(
    `[prisma] ${name} is not implemented yet. The marketplace runs on mock data ` +
      `(DATA_SOURCE=mock). Implement this method against Prisma and set ` +
      `DATA_SOURCE=prisma to switch.`,
  );
}

/** A proxy that throws a clear error for any accessed method. */
function stub<T extends object>(label: string): T {
  return new Proxy({} as T, {
    get(_t, prop) {
      return () => notImplemented(`${label}.${String(prop)}`);
    },
  });
}

export const prismaRepositories: Repositories = {
  doctors: stub("PrismaDoctorRepository"),
  clients: stub("PrismaClientRepository"),
  services: stub("PrismaServiceRepository"),
  availability: stub("PrismaAvailabilityRepository"),
  appointments: stub("PrismaAppointmentRepository"),
  reviews: stub("PrismaReviewRepository"),
  subscriptions: stub("PrismaSubscriptionRepository"),
  modules: stub("PrismaModuleRepository"),
  tenants: stub("PrismaTenantRepository"),
};
