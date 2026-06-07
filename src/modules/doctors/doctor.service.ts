import type { Doctor } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { generateUniqueSlug } from "@/lib/slug";
import type { UpdateDoctorInput } from "./doctor.schema";

/**
 * Doctor domain service. Owns reads/writes to the `doctors` table.
 * The `id` always equals the Supabase Auth user id.
 */
export const doctorService = {
  /** Creates the doctor profile row that mirrors a Supabase auth user. */
  async create(params: {
    id: string;
    email: string;
    fullName: string;
    specialty?: string;
  }): Promise<Doctor> {
    const slug = await generateUniqueSlug(params.fullName);
    return prisma.doctor.create({
      data: {
        id: params.id,
        email: params.email,
        fullName: params.fullName,
        specialty: params.specialty,
        slug,
      },
    });
  },

  findById(id: string) {
    return prisma.doctor.findUnique({ where: { id } });
  },

  /** Public profile lookup by booking slug. Only active doctors are returned. */
  async findPublicBySlug(slug: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { slug },
      select: {
        id: true,
        fullName: true,
        slug: true,
        specialty: true,
        clinicName: true,
        clinicAddress: true,
        timezone: true,
        avatarUrl: true,
        bio: true,
        plan: true,
        isActive: true,
      },
    });
    if (!doctor || !doctor.isActive) return null;
    return doctor;
  },

  async update(id: string, input: UpdateDoctorInput): Promise<Doctor> {
    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Doctor not found");
    return prisma.doctor.update({ where: { id }, data: input });
  },
};
