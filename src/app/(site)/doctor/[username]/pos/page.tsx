import { notFound } from "next/navigation";
import { Lock, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { moduleService } from "@/modules/billing/module.service";
import { posService } from "@/modules/pos/pos.service";
import { Card, CardContent } from "@/components/ui/card";
import { PosTerminal } from "@/components/pos/pos-terminal";

export const metadata = { title: "POS — ClinicBook" };

export default async function PosTerminalPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const doctor = await prisma.doctor.findUnique({
    where: { slug: username },
    select: { id: true, fullName: true, clinicName: true },
  });
  if (!doctor) notFound();

  const hasPos = await moduleService.hasModule(doctor.id, "pos");
  if (!hasPos) {
    return (
      <div className="container max-w-lg py-20">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Lock className="h-12 w-12 text-muted-foreground/40" />
            <h1 className="text-xl font-bold">POS not enabled</h1>
            <p className="text-muted-foreground">
              This clinic hasn&apos;t activated the POS module yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const products = await posService.listProducts(doctor.id, true);

  return (
    <div className="container py-6">
      <div className="mb-5 flex items-center gap-2">
        <Store className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold leading-tight">
            {doctor.clinicName ?? doctor.fullName} — POS
          </h1>
          <p className="text-sm text-muted-foreground">Front-desk billing terminal</p>
        </div>
      </div>
      <PosTerminal
        slug={username}
        clinicName={doctor.clinicName ?? doctor.fullName}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          priceCents: p.priceCents,
        }))}
      />
    </div>
  );
}
