import { requireDoctor } from "@/lib/auth";
import { serviceService } from "@/modules/services/service.service";
import {
  ServicesManager,
  type ServiceItem,
} from "@/components/services/services-manager";

export default async function ServicesPage() {
  const doctor = await requireDoctor();
  const services = (await serviceService.list(doctor.id)) as ServiceItem[];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">
          Define the appointment types patients can book — each with its own
          duration and price.
        </p>
      </div>
      <ServicesManager initial={services} currency={doctor.currency || "USD"} />
    </div>
  );
}
