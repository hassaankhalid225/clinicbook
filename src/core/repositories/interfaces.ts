/**
 * Repository interfaces — the data-access contract the UI depends on.
 *
 * The UI never imports a concrete data source. It calls these interfaces,
 * resolved at runtime by the DI factory (./index.ts). Today they resolve to
 * in-memory Mock implementations; flipping `DATA_SOURCE=prisma` resolves them
 * to Prisma implementations with zero UI changes.
 */
import type {
  Appointment,
  AvailabilityRule,
  BlockedDate,
  Client,
  CreateAppointmentInput,
  CreateReviewInput,
  Doctor,
  DoctorModuleAccess,
  DoctorSearchFilters,
  ID,
  ModuleDefinition,
  Plan,
  Review,
  Service,
  Subscription,
  Tenant,
  TimeSlot,
} from "@/core/types";

export interface DoctorRepository {
  /** Public listing — active doctors only, optionally filtered. */
  list(filters?: DoctorSearchFilters): Promise<Doctor[]>;
  /** Admin listing — every doctor regardless of status. */
  listAll(): Promise<Doctor[]>;
  search(filters: DoctorSearchFilters): Promise<Doctor[]>;
  featured(limit?: number): Promise<Doctor[]>;
  getById(id: ID): Promise<Doctor | null>;
  getByUsername(username: string): Promise<Doctor | null>;
  update(id: ID, patch: Partial<Doctor>): Promise<Doctor>;
  setStatus(id: ID, status: Doctor["status"]): Promise<Doctor>;
  setVerified(id: ID, verified: boolean): Promise<Doctor>;
  setModuleAccess(id: ID, moduleKey: string, enabled: boolean): Promise<Doctor>;
}

export interface ClientRepository {
  getById(id: ID): Promise<Client | null>;
  list(): Promise<Client[]>;
  update(id: ID, patch: Partial<Client>): Promise<Client>;
  toggleFavorite(clientId: ID, doctorId: ID): Promise<Client>;
}

export interface ServiceRepository {
  listByDoctor(doctorId: ID): Promise<Service[]>;
  getById(id: ID): Promise<Service | null>;
  create(input: Omit<Service, "id" | "createdAt" | "updatedAt">): Promise<Service>;
  update(id: ID, patch: Partial<Service>): Promise<Service>;
  remove(id: ID): Promise<void>;
}

export interface AvailabilityRepository {
  rulesByDoctor(doctorId: ID): Promise<AvailabilityRule[]>;
  blocksByDoctor(doctorId: ID): Promise<BlockedDate[]>;
  slotsFor(doctorId: ID, date: string): Promise<TimeSlot[]>;
  upsertRule(rule: Omit<AvailabilityRule, "id">): Promise<AvailabilityRule>;
  addBlock(block: Omit<BlockedDate, "id">): Promise<BlockedDate>;
  removeBlock(id: ID): Promise<void>;
}

export interface AppointmentRepository {
  listByDoctor(doctorId: ID): Promise<Appointment[]>;
  listByClient(clientId: ID): Promise<Appointment[]>;
  getById(id: ID): Promise<Appointment | null>;
  create(input: CreateAppointmentInput): Promise<Appointment>;
  setStatus(id: ID, status: Appointment["status"]): Promise<Appointment>;
  countAll(): Promise<number>;
}

export interface ReviewRepository {
  listByDoctor(doctorId: ID): Promise<Review[]>;
  create(input: CreateReviewInput): Promise<Review>;
  reply(id: ID, reply: string): Promise<Review>;
}

export interface SubscriptionRepository {
  plans(): Promise<Plan[]>;
  getForDoctor(doctorId: ID): Promise<Subscription | null>;
  changePlan(doctorId: ID, planId: Plan["id"]): Promise<Subscription>;
}

export interface ModuleRepository {
  list(): Promise<ModuleDefinition[]>;
  accessForDoctor(doctorId: ID): Promise<DoctorModuleAccess[]>;
}

export interface TenantRepository {
  getById(id: ID): Promise<Tenant | null>;
  list(): Promise<Tenant[]>;
}

/** The full repository set resolved by the DI container. */
export interface Repositories {
  doctors: DoctorRepository;
  clients: ClientRepository;
  services: ServiceRepository;
  availability: AvailabilityRepository;
  appointments: AppointmentRepository;
  reviews: ReviewRepository;
  subscriptions: SubscriptionRepository;
  modules: ModuleRepository;
  tenants: TenantRepository;
}
