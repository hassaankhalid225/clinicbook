/**
 * Dependency-injection entry point for the data layer.
 *
 * The entire app accesses data through `repositories` (or the `get*Repository`
 * helpers). Which implementation backs them is decided HERE, once, by the
 * `DATA_SOURCE` env var. Swapping mock → Prisma is a single-line change with no
 * impact on any UI or feature code.
 *
 *   DATA_SOURCE=mock    (default) → in-memory mock data
 *   DATA_SOURCE=prisma            → Prisma / Supabase
 */
import type { Repositories } from "./interfaces";
import { mockRepositories } from "@/mock/repositories";
import { prismaRepositories } from "@/core/prisma/repositories";

export type DataSource = "mock" | "prisma";

export const DATA_SOURCE: DataSource =
  (process.env.NEXT_PUBLIC_DATA_SOURCE as DataSource) || "mock";

export const repositories: Repositories =
  DATA_SOURCE === "prisma" ? prismaRepositories : mockRepositories;

// Convenience accessors (handy for DI in services/components).
export const getDoctorRepository = () => repositories.doctors;
export const getClientRepository = () => repositories.clients;
export const getServiceRepository = () => repositories.services;
export const getAvailabilityRepository = () => repositories.availability;
export const getAppointmentRepository = () => repositories.appointments;
export const getReviewRepository = () => repositories.reviews;
export const getSubscriptionRepository = () => repositories.subscriptions;
export const getModuleRepository = () => repositories.modules;
export const getTenantRepository = () => repositories.tenants;

export * from "./interfaces";
