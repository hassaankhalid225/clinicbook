/**
 * Mock repository implementations — in-memory, async (to mirror real I/O).
 * These satisfy the same interfaces as the future Prisma implementations, so
 * the UI is identical regardless of data source.
 */
import type {
  AppointmentRepository,
  AvailabilityRepository,
  ClientRepository,
  DoctorRepository,
  ModuleRepository,
  Repositories,
  ReviewRepository,
  ServiceRepository,
  SubscriptionRepository,
  TenantRepository,
} from "@/core/repositories/interfaces";
import type {
  Appointment,
  CreateAppointmentInput,
  CreateReviewInput,
  Doctor,
  DoctorSearchFilters,
  Review,
  Service,
  TimeSlot,
} from "@/core/types";
import { addMinutes, rangesOverlap, toMinutes } from "@/lib/datetime";
import { MOCK_PLANS } from "./data/plans";
import { MOCK_MODULES } from "./data/modules";
import * as db from "./data/dataset";

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const delay = <T>(value: T): Promise<T> => Promise.resolve(clone(value));
const nowIso = () => new Date().toISOString();

function matches(d: Doctor, f: DoctorSearchFilters): boolean {
  if (f.query) {
    const q = f.query.toLowerCase();
    const hay = `${d.fullName} ${d.specialty} ${d.clinicName ?? ""} ${d.expertise.skills.join(" ")}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.specialty && d.specialty.toLowerCase() !== f.specialty.toLowerCase()) return false;
  if (f.city && d.address.city.toLowerCase() !== f.city.toLowerCase()) return false;
  if (f.country && d.address.country.toLowerCase() !== f.country.toLowerCase()) return false;
  if (f.minRating && d.rating < f.minRating) return false;
  if (f.consultationType && f.consultationType !== "both" && d.consultationType !== f.consultationType && d.consultationType !== "both")
    return false;
  if (f.serviceCategory) {
    const cats = db.services.filter((s) => s.doctorId === d.id).map((s) => s.category.toLowerCase());
    if (!cats.includes(f.serviceCategory.toLowerCase())) return false;
  }
  return true;
}

const mockDoctors: DoctorRepository = {
  async list(filters) {
    let res = db.doctors.filter((d) => d.status === "active");
    if (filters) res = res.filter((d) => matches(d, filters));
    return delay(res);
  },
  async listAll() {
    return delay(db.doctors);
  },
  async search(filters) {
    return delay(db.doctors.filter((d) => d.status === "active" && matches(d, filters)));
  },
  async featured(limit = 4) {
    return delay(db.doctors.filter((d) => d.featured && d.status === "active").slice(0, limit));
  },
  async getById(id) {
    return delay(db.doctors.find((d) => d.id === id) ?? null);
  },
  async getByUsername(username) {
    return delay(db.doctors.find((d) => d.username === username) ?? null);
  },
  async update(id, patch) {
    const d = db.doctors.find((x) => x.id === id);
    if (!d) throw new Error("Doctor not found");
    Object.assign(d, patch, { updatedAt: nowIso() });
    return delay(d);
  },
  async setStatus(id, status) {
    return this.update(id, { status });
  },
  async setVerified(id, verified) {
    return this.update(id, { verified });
  },
  async setModuleAccess(id, moduleKey, enabled) {
    const d = db.doctors.find((x) => x.id === id);
    if (!d) throw new Error("Doctor not found");
    const set = new Set(d.enabledModules);
    if (enabled) set.add(moduleKey);
    else set.delete(moduleKey);
    d.enabledModules = [...set];
    return delay(d);
  },
};

const mockClients: ClientRepository = {
  async getById(id) {
    return delay(db.clients.find((c) => c.id === id) ?? null);
  },
  async list() {
    return delay(db.clients);
  },
  async update(id, patch) {
    const c = db.clients.find((x) => x.id === id);
    if (!c) throw new Error("Client not found");
    Object.assign(c, patch, { updatedAt: nowIso() });
    return delay(c);
  },
  async toggleFavorite(clientId, doctorId) {
    const c = db.clients.find((x) => x.id === clientId);
    if (!c) throw new Error("Client not found");
    c.favoriteDoctorIds = c.favoriteDoctorIds.includes(doctorId)
      ? c.favoriteDoctorIds.filter((x) => x !== doctorId)
      : [...c.favoriteDoctorIds, doctorId];
    return delay(c);
  },
};

const mockServices: ServiceRepository = {
  async listByDoctor(doctorId) {
    return delay(db.services.filter((s) => s.doctorId === doctorId));
  },
  async getById(id) {
    return delay(db.services.find((s) => s.id === id) ?? null);
  },
  async create(input) {
    const s: Service = { ...input, id: `s-${Date.now()}`, createdAt: nowIso(), updatedAt: nowIso() };
    db.services.push(s);
    return delay(s);
  },
  async update(id, patch) {
    const s = db.services.find((x) => x.id === id);
    if (!s) throw new Error("Service not found");
    Object.assign(s, patch, { updatedAt: nowIso() });
    return delay(s);
  },
  async remove(id) {
    const i = db.services.findIndex((x) => x.id === id);
    if (i >= 0) db.services.splice(i, 1);
  },
};

const mockAvailability: AvailabilityRepository = {
  async rulesByDoctor(doctorId) {
    return delay(db.availabilityRules.filter((r) => r.doctorId === doctorId));
  },
  async blocksByDoctor(doctorId) {
    return delay(db.blockedDates.filter((b) => b.doctorId === doctorId));
  },
  async slotsFor(doctorId, date) {
    const dow = new Date(date + "T00:00:00Z").getUTCDay();
    const rule = db.availabilityRules.find((r) => r.doctorId === doctorId && r.dayOfWeek === dow && r.isActive);
    if (!rule) return delay<TimeSlot[]>([]);
    const block = db.blockedDates.find((b) => b.doctorId === doctorId && b.date === date && !b.startTime);
    const taken = new Set(
      db.appointments
        .filter((a) => a.doctorId === doctorId && a.date === date && ["pending", "confirmed", "completed"].includes(a.status))
        .map((a) => a.startTime),
    );
    const slots: TimeSlot[] = [];
    const start = toMinutes(rule.startTime);
    const end = toMinutes(rule.endTime);
    const bStart = rule.breakStart ? toMinutes(rule.breakStart) : null;
    const bEnd = rule.breakEnd ? toMinutes(rule.breakEnd) : null;
    for (let t = start; t + rule.slotDurationMin <= end; t += rule.slotDurationMin) {
      const time = addMinutes("00:00", t);
      const inBreak = bStart != null && bEnd != null && rangesOverlap(t, t + rule.slotDurationMin, bStart, bEnd);
      const available = !block && !inBreak && !taken.has(time);
      if (!inBreak) slots.push({ time, available });
    }
    return delay(slots);
  },
  async upsertRule(rule) {
    const existing = db.availabilityRules.find((r) => r.doctorId === rule.doctorId && r.dayOfWeek === rule.dayOfWeek);
    if (existing) {
      Object.assign(existing, rule);
      return delay(existing);
    }
    const created = { ...rule, id: `av-${Date.now()}` };
    db.availabilityRules.push(created);
    return delay(created);
  },
  async addBlock(block) {
    const created = { ...block, id: `bd-${Date.now()}` };
    db.blockedDates.push(created);
    return delay(created);
  },
  async removeBlock(id) {
    const i = db.blockedDates.findIndex((b) => b.id === id);
    if (i >= 0) db.blockedDates.splice(i, 1);
  },
};

const mockAppointments: AppointmentRepository = {
  async listByDoctor(doctorId) {
    return delay(db.appointments.filter((a) => a.doctorId === doctorId).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)));
  },
  async listByClient(clientId) {
    return delay(db.appointments.filter((a) => a.clientId === clientId).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)));
  },
  async getById(id) {
    return delay(db.appointments.find((a) => a.id === id) ?? null);
  },
  async create(input: CreateAppointmentInput) {
    const service = db.services.find((s) => s.id === input.serviceId);
    const doctor = db.doctors.find((d) => d.id === input.doctorId);
    const client = db.clients.find((c) => c.id === input.clientId);
    const dur = service?.durationMin ?? 30;
    const created: Appointment = {
      id: `a-${Date.now()}`,
      tenantId: input.tenantId,
      doctorId: input.doctorId,
      clientId: input.clientId,
      serviceId: input.serviceId,
      date: input.date,
      startTime: input.startTime,
      endTime: addMinutes(input.startTime, dur),
      status: "pending",
      consultationType: input.consultationType,
      reason: input.reason,
      priceCents: service?.priceCents ?? 0,
      doctorName: doctor?.fullName,
      clientName: client?.fullName,
      serviceTitle: service?.title,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.appointments.push(created);
    return delay(created);
  },
  async setStatus(id, status) {
    const a = db.appointments.find((x) => x.id === id);
    if (!a) throw new Error("Appointment not found");
    a.status = status;
    a.updatedAt = nowIso();
    return delay(a);
  },
  async countAll() {
    return delay(db.appointments.length);
  },
};

const mockReviews: ReviewRepository = {
  async listByDoctor(doctorId) {
    return delay(db.reviews.filter((r) => r.doctorId === doctorId));
  },
  async create(input: CreateReviewInput) {
    const created: Review = { ...input, id: `r-${Date.now()}`, createdAt: nowIso(), updatedAt: nowIso() };
    db.reviews.push(created);
    return delay(created);
  },
  async reply(id, reply) {
    const r = db.reviews.find((x) => x.id === id);
    if (!r) throw new Error("Review not found");
    r.reply = reply;
    r.repliedAt = nowIso();
    return delay(r);
  },
};

const mockSubscriptions: SubscriptionRepository = {
  async plans() {
    return delay(MOCK_PLANS);
  },
  async getForDoctor(doctorId) {
    return delay(db.subscriptions.find((s) => s.doctorId === doctorId) ?? null);
  },
  async changePlan(doctorId, planId) {
    const s = db.subscriptions.find((x) => x.doctorId === doctorId);
    if (!s) throw new Error("Subscription not found");
    s.planId = planId;
    s.updatedAt = nowIso();
    return delay(s);
  },
};

const mockModules: ModuleRepository = {
  async list() {
    return delay(MOCK_MODULES);
  },
  async accessForDoctor(doctorId) {
    const d = db.doctors.find((x) => x.id === doctorId);
    return delay(
      MOCK_MODULES.map((m) => ({
        doctorId,
        moduleKey: m.key,
        enabled: d?.enabledModules.includes(m.key) ?? false,
      })),
    );
  },
};

const mockTenants: TenantRepository = {
  async getById(id) {
    return delay(db.tenants.find((t) => t.id === id) ?? null);
  },
  async list() {
    return delay(db.tenants);
  },
};

export const mockRepositories: Repositories = {
  doctors: mockDoctors,
  clients: mockClients,
  services: mockServices,
  availability: mockAvailability,
  appointments: mockAppointments,
  reviews: mockReviews,
  subscriptions: mockSubscriptions,
  modules: mockModules,
  tenants: mockTenants,
};
