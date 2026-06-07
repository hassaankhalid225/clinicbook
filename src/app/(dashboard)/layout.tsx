import Link from "next/link";
import { Stethoscope, ExternalLink, LogOut } from "lucide-react";
import { requireDoctor } from "@/lib/auth";
import { env } from "@/lib/env";
import { logoutAction } from "@/app/(auth)/actions";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPlan } from "@/modules/billing/plans";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const doctor = await requireDoctor();
  const bookingUrl = `${env.appUrl}/book/${doctor.slug}`;
  const plan = getPlan(doctor.plan);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <Stethoscope className="h-6 w-6 text-primary" />
            ClinicBook
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/book/${doctor.slug}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
                View booking page
              </Link>
            </Button>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r p-4 md:block">
          <SidebarNav />
          <div className="mt-6 rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">Your plan</span>
              <Badge variant="secondary">{plan.name}</Badge>
            </div>
            <p className="mt-2 break-all text-xs text-muted-foreground">
              {bookingUrl}
            </p>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
