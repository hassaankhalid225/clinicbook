import type { Address, ID, TenantScoped, Timestamps } from "./common";

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Award {
  title: string;
  issuer: string;
  year: string;
}

export interface Publication {
  title: string;
  url?: string;
  year: string;
}

export interface SocialLinks {
  website?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

export interface Expertise {
  specialty: string;
  subSpecialties: string[];
  skills: string[];
  procedures: string[];
}

export type DoctorStatus = "pending" | "active" | "suspended";

export interface Doctor extends TenantScoped, Timestamps {
  id: ID;
  username: string; // public URL slug: /doctor/[username]
  fullName: string;
  title?: string; // e.g. "MD, FACC"
  specialty: string;
  bio: string;
  photoUrl?: string;
  coverUrl?: string;
  qualification: string;
  certifications: string[];
  experienceYears: number;
  languages: string[];
  education: Education[];
  awards: Award[];
  publications: Publication[];
  social: SocialLinks;
  expertise: Expertise;
  clinicName?: string;
  address: Address;
  consultationType: "online" | "offline" | "both";

  // Marketplace signals
  rating: number; // 0-5
  reviewCount: number;
  profileViews: number;
  featured: boolean;
  verified: boolean;
  status: DoctorStatus;

  // Plan / modules
  planId: string;
  enabledModules: string[];
}

/** Filters used by discovery / search. */
export interface DoctorSearchFilters {
  query?: string;
  specialty?: string;
  serviceCategory?: string;
  city?: string;
  country?: string;
  minRating?: number;
  consultationType?: "online" | "offline" | "both";
  availableOnly?: boolean;
  near?: { lat: number; lng: number; radiusKm: number };
}
