import { requireDoctor } from "@/lib/auth";
import { moduleService } from "@/modules/billing/module.service";
import { money } from "@/core/utils/format";
import { Badge } from "@/components/ui/badge";
import { ModulePicker, type PickerModule } from "@/components/billing/module-picker";
import { ManageBillingButton } from "@/components/billing/manage-billing-button";

export default async function ModulesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; welcome?: string }>;
}) {
  const doctor = await requireDoctor();
  const { status, welcome } = await searchParams;
  const summary = await moduleService.summaryForDoctor(doctor.id);
  const subActive = summary.subscription?.status === "active";

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {welcome ? "Welcome! Compose your plan" : "Modules & billing"}
        </h1>
        <p className="text-muted-foreground">
          Pick exactly the features your practice needs — the total updates live.
          Prices are monthly; change your selection anytime.
        </p>
        {status === "success" && (
          <Badge variant="success" className="mt-2">
            Payment successful — your modules are active 🎉
          </Badge>
        )}
        {status === "cancelled" && (
          <Badge variant="warning" className="mt-2">
            Checkout cancelled — your selection was not charged.
          </Badge>
        )}
        {subActive && summary.subscription && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Active subscription: <strong>{money(summary.subscription.totalMonthlyCents)}/mo</strong>
              {" · "}provider: {summary.subscription.provider}
              {summary.subscription.currentPeriodEnd &&
                ` · renews ${summary.subscription.currentPeriodEnd.toISOString().slice(0, 10)}`}
            </p>
            {summary.subscription.provider === "stripe" &&
              summary.subscription.stripeCustomerId && <ManageBillingButton />}
          </div>
        )}
      </div>

      <ModulePicker
        modules={summary.modules as PickerModule[]}
        subscriptionActive={subActive}
      />
    </div>
  );
}
