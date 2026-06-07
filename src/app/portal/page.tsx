import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { PortalLookup } from "@/components/booking/portal-lookup";

export const metadata = {
  title: "Manage your appointments — ClinicBook",
};

export default function PortalPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Stethoscope className="h-6 w-6 text-primary" />
            ClinicBook
          </Link>
        </div>
      </header>
      <main className="container flex-1 py-10">
        <div className="mx-auto max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight">
            Manage your appointments
          </h1>
          <p className="mt-1 text-muted-foreground">
            Enter the phone number you booked with to view, reschedule, or cancel.
          </p>
          <div className="mt-6">
            <PortalLookup />
          </div>
        </div>
      </main>
    </div>
  );
}
