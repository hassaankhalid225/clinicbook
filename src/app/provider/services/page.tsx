import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { ServiceManager, type ServiceItem } from "@/components/marketplace/service-manager";

export default async function ProviderServicesPage() {
  const services = await repositories.services.listByDoctor(MOCK_CURRENT.doctorId);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">Appointment types patients can book — add, edit, or remove.</p>
      </div>
      <ServiceManager
        initial={services.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          durationMin: s.durationMin,
          priceCents: s.priceCents,
          currency: s.currency,
          category: s.category,
          consultationType: s.consultationType,
          isActive: s.isActive,
        })) as ServiceItem[]}
      />
    </div>
  );
}
