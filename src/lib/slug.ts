import { prisma } from "@/lib/prisma";

/** Converts a name into a URL-safe slug, e.g. "Dr. Ali Khan" → "dr-ali-khan". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

/**
 * Generates a slug that is unique across doctors, appending -2, -3, … on
 * collision. Falls back to a random suffix if the base is empty.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  let base = slugify(name);
  if (!base) base = "doctor";

  let candidate = base;
  let n = 1;
  // Bounded loop — in practice resolves in 1-2 iterations.
  while (await prisma.doctor.findUnique({ where: { slug: candidate } })) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}
