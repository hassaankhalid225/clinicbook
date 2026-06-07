import { requireDoctor } from "@/lib/auth";
import { availabilityService } from "@/modules/availability/availability.service";
import { formatDateOnly } from "@/lib/datetime";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AvailabilityEditor,
  type RuleState,
} from "@/components/availability/availability-editor";
import {
  BlockedDates,
  type BlockItem,
} from "@/components/availability/blocked-dates";

const DEFAULTS = {
  startTime: "09:00",
  endTime: "17:00",
  slotDurationMin: 30,
  breakStart: "",
  breakEnd: "",
};

export default async function AvailabilityPage() {
  const doctor = await requireDoctor();
  const [rules, blocks] = await Promise.all([
    availabilityService.listRules(doctor.id),
    availabilityService.listBlocks(doctor.id),
  ]);

  const byDay = new Map(rules.map((r) => [r.dayOfWeek, r]));
  const initial: RuleState[] = Array.from({ length: 7 }, (_, day) => {
    const r = byDay.get(day);
    return {
      dayOfWeek: day,
      enabled: Boolean(r?.isActive),
      startTime: r?.startTime ?? DEFAULTS.startTime,
      endTime: r?.endTime ?? DEFAULTS.endTime,
      slotDurationMin: r?.slotDurationMin ?? DEFAULTS.slotDurationMin,
      breakStart: r?.breakStart ?? DEFAULTS.breakStart,
      breakEnd: r?.breakEnd ?? DEFAULTS.breakEnd,
    };
  });

  const blockItems: BlockItem[] = blocks.map((b) => ({
    id: b.id,
    blockedDate: formatDateOnly(b.blockedDate),
    startTime: b.startTime,
    endTime: b.endTime,
    reason: b.reason,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">
          Set your weekly working hours and block one-off dates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly hours</CardTitle>
          <CardDescription>
            Toggle a day on, set hours, slot length, and an optional break. Save
            each day separately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvailabilityEditor initial={initial} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked dates</CardTitle>
          <CardDescription>
            Block holidays or days off. These are hidden from your booking page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlockedDates initial={blockItems} />
        </CardContent>
      </Card>
    </div>
  );
}
