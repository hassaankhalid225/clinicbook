import { Check, Zap } from "lucide-react";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ProviderSubscriptionPage() {
  const doctorId = MOCK_CURRENT.doctorId;
  const [sub, plans, modules, access] = await Promise.all([
    repositories.subscriptions.getForDoctor(doctorId),
    repositories.subscriptions.plans(),
    repositories.modules.list(),
    repositories.modules.accessForDoctor(doctorId),
  ]);
  const enabled = new Set(access.filter((a) => a.enabled).map((a) => a.moduleKey));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">
          Current plan:{" "}
          <Badge variant="secondary" className="ml-1 capitalize">{sub?.planId ?? "free"}</Badge>
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const current = p.id === sub?.planId;
            return (
              <Card key={p.id} className={current ? "border-primary" : p.highlighted ? "border-primary/40" : ""}>
                <CardHeader>
                  {p.highlighted && !current && <Badge className="mb-2 w-fit">Popular</Badge>}
                  {current && <Badge variant="success" className="mb-2 w-fit">Current</Badge>}
                  <CardTitle>{p.name}</CardTitle>
                  <div className="text-2xl font-bold">${p.priceMonthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1 text-xs capitalize text-muted-foreground">
                    {p.modules.map((m) => (
                      <li key={m} className="flex gap-1"><Check className="h-3.5 w-3.5 text-primary" />{m}</li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={current ? "outline" : "default"} disabled={current}>
                    {current ? "Current plan" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Modules</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Card key={m.key}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <p className="font-medium">{m.name}</p>
                    {m.status !== "active" && (
                      <Badge variant="warning" className="capitalize">{m.status.replace("_", " ")}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                </div>
                <Badge variant={enabled.has(m.key) ? "success" : "muted"}>
                  {enabled.has(m.key) ? "On" : "Off"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
