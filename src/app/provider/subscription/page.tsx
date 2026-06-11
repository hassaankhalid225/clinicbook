import Link from "next/link";
import { Check, Zap, ArrowRight } from "lucide-react";
import { moduleService } from "@/modules/billing/module.service";
import { MOCK_CURRENT } from "@/core/utils/session";
import { money } from "@/core/utils/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ProviderSubscriptionPage() {
  const summary = await moduleService.summaryForDoctor(MOCK_CURRENT.doctorId);
  const active = summary.subscription?.status === "active";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground">
            Your plan is composed of modules — pay only for what you use.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/modules">
            Manage modules <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current plan</span>
            <Badge variant={active ? "success" : "warning"} className="capitalize">
              {summary.subscription?.status ?? "not set up"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {summary.subscription
              ? `${money(summary.subscription.totalMonthlyCents)}/month · billed via ${summary.subscription.provider}`
              : "Choose your modules to activate billing."}
          </CardDescription>
        </CardHeader>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Your modules</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {summary.modules.map((m) => (
            <Card key={m.id} className={m.selected ? "border-primary/40" : "opacity-70"}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <p className="font-medium">{m.name}</p>
                    {m.isCore && <Badge variant="secondary">Core</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                  <p className="mt-1 text-sm font-medium">
                    {m.priceMonthlyCents === 0 ? "Free" : `${money(m.priceMonthlyCents)}/mo`}
                  </p>
                </div>
                {m.selected ? (
                  <Badge variant="success" className="gap-1"><Check className="h-3 w-3" /> Active</Badge>
                ) : (
                  <Badge variant="muted">Off</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
