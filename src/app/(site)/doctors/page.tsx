import { Search, SlidersHorizontal } from "lucide-react";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { distanceKm as distKm } from "@/core/utils/format";
import type { Doctor, DoctorSearchFilters } from "@/core/types";
import { MOCK_CATEGORIES } from "@/mock/data/content";
import { NearMeButton } from "@/components/marketplace/near-me-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DoctorCard } from "@/components/marketplace/doctor-card";

export const metadata = { title: "Find doctors — MediBook" };

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters: DoctorSearchFilters = {
    query: sp.q || undefined,
    specialty: sp.specialty || undefined,
    city: sp.city || undefined,
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
    consultationType: (sp.type as DoctorSearchFilters["consultationType"]) || undefined,
  };
  const [doctorsRaw, client] = await Promise.all([
    repositories.doctors.list(filters),
    repositories.clients.getById(MOCK_CURRENT.clientId),
  ]);
  const favSet = new Set(client?.favoriteDoctorIds ?? []);
  const specialties = [...new Set(MOCK_CATEGORIES.map((c) => c.name))];

  // Location-aware: when lat/lng are present, compute distance + sort nearest.
  const origin =
    sp.lat && sp.lng ? { lat: Number(sp.lat), lng: Number(sp.lng) } : null;
  let doctors: (Doctor & { _dist?: number })[] = doctorsRaw;
  if (origin) {
    doctors = doctorsRaw
      .map((d) => ({
        ...d,
        _dist: d.address.geo ? distKm(origin, d.address.geo) : undefined,
      }))
      .sort((a, b) => (a._dist ?? 1e9) - (b._dist ?? 1e9));
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Find your doctor</h1>
        <p className="text-muted-foreground">
          {doctors.length} doctor{doctors.length === 1 ? "" : "s"} available
          {filters.query ? ` for “${filters.query}”` : ""}.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action="/doctors">
                <div className="space-y-2">
                  <Label htmlFor="q">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="q" name="q" defaultValue={sp.q} placeholder="Name or specialty" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <select
                    id="specialty"
                    name="specialty"
                    defaultValue={sp.specialty ?? ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">All specialties</option>
                    {specialties.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={sp.city} placeholder="e.g. Manhattan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Consultation</Label>
                  <select
                    id="type"
                    name="type"
                    defaultValue={sp.type ?? ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Any</option>
                    <option value="online">Online</option>
                    <option value="offline">In-person</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minRating">Min rating</Label>
                  <select
                    id="minRating"
                    name="minRating"
                    defaultValue={sp.minRating ?? ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Any</option>
                    <option value="4">4.0+</option>
                    <option value="4.5">4.5+</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">Apply filters</Button>
                <NearMeButton />
                <Button type="button" variant="ghost" className="w-full" asChild>
                  <a href="/doctors">Reset</a>
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>

        {/* Results */}
        <div>
          {doctors.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                No doctors match your filters. Try widening your search.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {doctors.map((d) => (
                <DoctorCard key={d.id} doctor={d} favorited={favSet.has(d.id)} distanceKm={d._dist} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
