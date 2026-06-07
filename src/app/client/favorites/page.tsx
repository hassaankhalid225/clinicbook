import Link from "next/link";
import { Heart } from "lucide-react";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { Button } from "@/components/ui/button";
import { DoctorCard } from "@/components/marketplace/doctor-card";

export default async function ClientFavoritesPage() {
  const client = await repositories.clients.getById(MOCK_CURRENT.clientId);
  const ids = [...new Set([...(client?.favoriteDoctorIds ?? []), ...(client?.savedDoctorIds ?? [])])];
  const doctors = (await Promise.all(ids.map((id) => repositories.doctors.getById(id)))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Favorite &amp; saved doctors</h1>
        <p className="text-muted-foreground">Quick access to the doctors you love.</p>
      </div>

      {doctors.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Heart className="h-10 w-10 opacity-40" />
          <p>No favorites yet.</p>
          <Button asChild><Link href="/doctors">Browse doctors</Link></Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => d && <DoctorCard key={d.id} doctor={d} />)}
        </div>
      )}
    </div>
  );
}
