/**
 * Prisma repository implementations — the marketplace running on the REAL
 * database (same Supabase DB as the doctor app). Hybrid resolution: the repos
 * below are fully implemented; `clients` and `tenants` (demo-portal-only)
 * still fall back to mocks until client accounts ship.
 */
import type { Doctor as DbDoctor, Service as DbService } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeAvailableSlots } from "@/modules/booking/slots.service";
import { formatDateOnly, parseDateOnly } from "@/lib/datetime";
import { mockRepositories } from "@/mock/repositories";
import type { Repositories } from "@/core/repositories/interfaces";
import type {
  Appointment,
  AppointmentStatus,
  Doctor,
  DoctorSearchFilters,
  Review,
  Service,
  TimeSlot,
} from "@/core/types";

// ── mappers ──────────────────────────────────────────────────────────────────

function mapDoctor(d: DbDoctor & { doctorModules?: { active: boolean; module: { key: string } }[] }): Doctor {
  return {
    id: d.id,
    tenantId: d.tenantId ?? d.id,
    username: d.slug,
    fullName: d.fullName,
    title: d.title ?? undefined,
    specialty: d.specialty ?? "General",
    bio: d.bio ?? "",
    photoUrl: d.avatarUrl ?? undefined,
    coverUrl: d.coverUrl ?? undefined,
    qualification: d.title ?? "",
    certifications: d.certifications ?? [],
    experienceYears: d.experienceYears ?? 0,
    languages: d.languages ?? [],
    education: (d.education as unknown as Doctor["education"]) ?? [],
    awards: (d.awards as unknown as Doctor["awards"]) ?? [],
    publications: [],
    social: (d.social as Doctor["social"]) ?? {},
    expertise: {
      specialty: d.specialty ?? "General",
      subSpecialties: d.subSpecialties ?? [],
      skills: d.skills ?? [],
      procedures: d.procedures ?? [],
    },
    clinicName: d.clinicName ?? undefined,
    address: {
      line1: d.clinicAddress ?? undefined,
      city: d.city ?? "—",
      country: d.country ?? "—",
      geo:
        d.geoLat != null && d.geoLng != null
          ? { lat: d.geoLat, lng: d.geoLng }
          : undefined,
    },
    consultationType: "both",
    rating: d.rating ?? 0,
    reviewCount: d.reviewCount ?? 0,
    profileViews: d.profileViews ?? 0,
    featured: d.featured ?? false,
    verified: d.verified ?? false,
    status: d.marketplaceStatus,
    planId: "custom",
    enabledModules:
      d.doctorModules?.filter((m) => m.active).map((m) => m.module.key) ?? [],
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.createdAt.toISOString(),
  };
}

function mapService(s: DbService): Service {
  return {
    id: s.id,
    tenantId: s.doctorId,
    doctorId: s.doctorId,
    title: s.name,
    description: s.description ?? "",
    durationMin: s.durationMin,
    priceCents: s.priceCents,
    currency: "USD",
    category: "General",
    consultationType: s.isTelehealth ? "online" : "both",
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.createdAt.toISOString(),
  };
}

const STATUS_TO_MARKET: Record<string, AppointmentStatus> = {
  scheduled: "confirmed",
  completed: "completed",
  cancelled: "cancelled",
  no_show: "no_show",
};
const STATUS_TO_DB: Partial<Record<AppointmentStatus, "scheduled" | "completed" | "cancelled" | "no_show">> = {
  pending: "scheduled",
  confirmed: "scheduled",
  rescheduled: "scheduled",
  completed: "completed",
  cancelled: "cancelled",
  no_show: "no_show",
};

function doctorWhere(f?: DoctorSearchFilters) {
  if (!f) return {};
  return {
    ...(f.query
      ? {
          OR: [
            { fullName: { contains: f.query, mode: "insensitive" as const } },
            { specialty: { contains: f.query, mode: "insensitive" as const } },
            { clinicName: { contains: f.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(f.specialty ? { specialty: { equals: f.specialty, mode: "insensitive" as const } } : {}),
    ...(f.city ? { city: { equals: f.city, mode: "insensitive" as const } } : {}),
    ...(f.country ? { country: { equals: f.country, mode: "insensitive" as const } } : {}),
    ...(f.minRating ? { rating: { gte: f.minRating } } : {}),
  };
}

const include = { doctorModules: { include: { module: { select: { key: true } } } } };

// ── repositories ─────────────────────────────────────────────────────────────

export const prismaRepositories: Repositories = {
  ...mockRepositories, // clients + tenants fall back to mock (demo portal only)

  doctors: {
    async list(filters) {
      const rows = await prisma.doctor.findMany({
        where: { marketplaceStatus: "active", isActive: true, ...doctorWhere(filters) },
        include,
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
      });
      return rows.map(mapDoctor);
    },
    async listAll() {
      const rows = await prisma.doctor.findMany({ include, orderBy: { createdAt: "asc" } });
      return rows.map(mapDoctor);
    },
    async search(filters) {
      return this.list(filters);
    },
    async featured(limit = 4) {
      const rows = await prisma.doctor.findMany({
        where: { featured: true, marketplaceStatus: "active" },
        include,
        take: limit,
        orderBy: { rating: "desc" },
      });
      return rows.map(mapDoctor);
    },
    async getById(id) {
      // Guard non-uuid ids (e.g. mock favorites like "d-1") — Postgres uuid
      // columns reject them with an error rather than returning null.
      if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
      const row = await prisma.doctor.findUnique({ where: { id }, include });
      return row ? mapDoctor(row) : null;
    },
    async getByUsername(username) {
      const row = await prisma.doctor.findUnique({ where: { slug: username }, include });
      return row ? mapDoctor(row) : null;
    },
    async update(id, patch) {
      const row = await prisma.doctor.update({
        where: { id },
        data: {
          ...(patch.fullName ? { fullName: patch.fullName } : {}),
          ...(patch.bio != null ? { bio: patch.bio } : {}),
          ...(patch.specialty ? { specialty: patch.specialty } : {}),
        },
        include,
      });
      return mapDoctor(row);
    },
    async setStatus(id, status) {
      const row = await prisma.doctor.update({
        where: { id },
        data: { marketplaceStatus: status },
        include,
      });
      return mapDoctor(row);
    },
    async setVerified(id, verified) {
      const row = await prisma.doctor.update({ where: { id }, data: { verified }, include });
      return mapDoctor(row);
    },
    async setModuleAccess(id, moduleKey, enabled) {
      const module = await prisma.platformModule.findUnique({ where: { key: moduleKey } });
      if (module) {
        await prisma.doctorModule.upsert({
          where: { doctorId_moduleId: { doctorId: id, moduleId: module.id } },
          create: { doctorId: id, moduleId: module.id, active: enabled },
          update: { active: enabled },
        });
      }
      const row = await prisma.doctor.findUniqueOrThrow({ where: { id }, include });
      return mapDoctor(row);
    },
  },

  services: {
    async listByDoctor(doctorId) {
      const rows = await prisma.service.findMany({
        where: { doctorId, isActive: true },
        orderBy: { sortOrder: "asc" },
      });
      return rows.map(mapService);
    },
    async getById(id) {
      const row = await prisma.service.findUnique({ where: { id } });
      return row ? mapService(row) : null;
    },
    async create(input) {
      const row = await prisma.service.create({
        data: {
          doctorId: input.doctorId,
          name: input.title,
          description: input.description,
          durationMin: input.durationMin,
          priceCents: input.priceCents,
          isTelehealth: input.consultationType === "online",
          isActive: input.isActive,
        },
      });
      return mapService(row);
    },
    async update(id, patch) {
      const row = await prisma.service.update({
        where: { id },
        data: {
          ...(patch.title ? { name: patch.title } : {}),
          ...(patch.description != null ? { description: patch.description } : {}),
          ...(patch.durationMin ? { durationMin: patch.durationMin } : {}),
          ...(patch.priceCents != null ? { priceCents: patch.priceCents } : {}),
          ...(patch.isActive != null ? { isActive: patch.isActive } : {}),
        },
      });
      return mapService(row);
    },
    async remove(id) {
      await prisma.service.delete({ where: { id } }).catch(() => {});
    },
  },

  availability: {
    async rulesByDoctor(doctorId) {
      const rows = await prisma.availabilityRule.findMany({ where: { doctorId } });
      return rows.map((r) => ({
        id: r.id,
        tenantId: doctorId,
        doctorId,
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
        slotDurationMin: r.slotDurationMin,
        breakStart: r.breakStart ?? undefined,
        breakEnd: r.breakEnd ?? undefined,
        isActive: r.isActive,
      }));
    },
    async blocksByDoctor(doctorId) {
      const rows = await prisma.blockedSlot.findMany({ where: { doctorId } });
      return rows.map((b) => ({
        id: b.id,
        tenantId: doctorId,
        doctorId,
        date: formatDateOnly(b.blockedDate),
        startTime: b.startTime ?? undefined,
        endTime: b.endTime ?? undefined,
        reason: b.reason ?? undefined,
        isHoliday: false,
      }));
    },
    async slotsFor(doctorId, date): Promise<TimeSlot[]> {
      const { slots } = await computeAvailableSlots(doctorId, date);
      return slots.map((time) => ({ time, available: true }));
    },
    async upsertRule(rule) {
      const row = await prisma.availabilityRule.upsert({
        where: { doctorId_dayOfWeek: { doctorId: rule.doctorId, dayOfWeek: rule.dayOfWeek } },
        create: {
          doctorId: rule.doctorId,
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
          slotDurationMin: rule.slotDurationMin,
          breakStart: rule.breakStart,
          breakEnd: rule.breakEnd,
          isActive: rule.isActive,
        },
        update: { startTime: rule.startTime, endTime: rule.endTime, isActive: rule.isActive },
      });
      return { ...rule, id: row.id };
    },
    async addBlock(block) {
      const row = await prisma.blockedSlot.create({
        data: {
          doctorId: block.doctorId,
          blockedDate: parseDateOnly(block.date),
          startTime: block.startTime,
          endTime: block.endTime,
          reason: block.reason,
        },
      });
      return { ...block, id: row.id };
    },
    async removeBlock(id) {
      await prisma.blockedSlot.delete({ where: { id } }).catch(() => {});
    },
  },

  appointments: {
    async listByDoctor(doctorId): Promise<Appointment[]> {
      const rows = await prisma.appointment.findMany({
        where: { doctorId },
        include: { patient: true, service: true, doctor: { select: { fullName: true } } },
        orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
        take: 200,
      });
      return rows.map((a) => ({
        id: a.id,
        tenantId: doctorId,
        doctorId,
        clientId: a.patientId,
        serviceId: a.serviceId ?? "",
        date: formatDateOnly(a.appointmentDate),
        startTime: a.startTime,
        endTime: a.endTime,
        status: STATUS_TO_MARKET[a.status] ?? "confirmed",
        consultationType: a.isTelehealth ? "online" : "offline",
        reason: a.reason ?? undefined,
        priceCents: a.service?.priceCents ?? 0,
        doctorName: a.doctor.fullName,
        clientName: a.patient.fullName,
        serviceTitle: a.service?.name ?? "Consultation",
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.createdAt.toISOString(),
      }));
    },
    async listByClient() {
      return []; // marketplace client portal is demo-only until client accounts ship
    },
    async getById(id) {
      const rows = await prisma.appointment.findMany({
        where: { id },
        include: { patient: true, service: true, doctor: { select: { fullName: true } } },
      });
      if (rows.length === 0) return null;
      const list = await this.listByDoctor(rows[0].doctorId);
      return list.find((a) => a.id === id) ?? null;
    },
    async create() {
      throw new Error("Use the public booking flow at /book/[slug] (real bookings)");
    },
    async setStatus(id, status) {
      const dbStatus = STATUS_TO_DB[status] ?? "scheduled";
      await prisma.appointment.update({ where: { id }, data: { status: dbStatus } });
      const appt = await this.getById(id);
      if (!appt) throw new Error("Appointment not found");
      return appt;
    },
    async countAll() {
      return prisma.appointment.count();
    },
  },

  reviews: {
    async listByDoctor(doctorId): Promise<Review[]> {
      const rows = await prisma.doctorReview.findMany({
        where: { doctorId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map((r) => ({
        id: r.id,
        tenantId: doctorId,
        doctorId,
        clientId: "",
        clientName: r.patientName,
        rating: r.rating,
        comment: r.comment,
        reply: r.reply ?? undefined,
        repliedAt: r.repliedAt?.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.createdAt.toISOString(),
      }));
    },
    async create(input) {
      const row = await prisma.doctorReview.create({
        data: {
          doctorId: input.doctorId,
          patientName: input.clientName,
          rating: input.rating,
          comment: input.comment,
        },
      });
      // Keep the doctor's aggregate rating in sync.
      const agg = await prisma.doctorReview.aggregate({
        where: { doctorId: input.doctorId },
        _avg: { rating: true },
        _count: true,
      });
      await prisma.doctor.update({
        where: { id: input.doctorId },
        data: {
          rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
          reviewCount: agg._count,
        },
      });
      return {
        id: row.id,
        tenantId: input.doctorId,
        doctorId: input.doctorId,
        clientId: input.clientId,
        clientName: input.clientName,
        rating: input.rating,
        comment: input.comment,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.createdAt.toISOString(),
      };
    },
    async reply(id, reply) {
      const row = await prisma.doctorReview.update({
        where: { id },
        data: { reply, repliedAt: new Date() },
      });
      return {
        id: row.id,
        tenantId: row.doctorId,
        doctorId: row.doctorId,
        clientId: "",
        clientName: row.patientName,
        rating: row.rating,
        comment: row.comment,
        reply: row.reply ?? undefined,
        repliedAt: row.repliedAt?.toISOString(),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.createdAt.toISOString(),
      };
    },
  },

  modules: {
    async list() {
      const rows = await prisma.platformModule.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((m) => ({
        key: m.key as never,
        name: m.name,
        description: m.description,
        priceMonthly: Math.round(m.priceMonthlyCents / 100),
        status: m.status,
        includedInPlans: m.isCore ? ["free", "professional", "business", "enterprise"] : [],
      }));
    },
    async accessForDoctor(doctorId) {
      const [modules, selections] = await Promise.all([
        prisma.platformModule.findMany({ orderBy: { sortOrder: "asc" } }),
        prisma.doctorModule.findMany({ where: { doctorId, active: true } }),
      ]);
      const active = new Set(selections.map((s) => s.moduleId));
      return modules.map((m) => ({
        doctorId,
        moduleKey: m.key as never,
        enabled: m.isCore || active.has(m.id),
      }));
    },
  },
};
