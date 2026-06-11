import { requireDoctor } from "@/lib/auth";
import { env } from "@/lib/env";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";

export default async function SettingsPage() {
  const doctor = await requireDoctor();
  const bookingUrl = `${env.appUrl}/book/${doctor.slug}`;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, booking page, notifications, and plan.
        </p>
      </div>

      <SettingsTabs
        bookingUrl={bookingUrl}
        settings={{
          fullName: doctor.fullName,
          specialty: doctor.specialty,
          clinicName: doctor.clinicName,
          clinicAddress: doctor.clinicAddress,
          phone: doctor.phone,
          timezone: doctor.timezone,
          bio: doctor.bio,
          welcomeMessage: doctor.welcomeMessage,
          brandColor: doctor.brandColor,
          cancellationPolicy: doctor.cancellationPolicy,
          currency: doctor.currency,
          language: doctor.language,
          smsEnabled: doctor.smsEnabled,
          emailEnabled: doctor.emailEnabled,
          reminderHoursBefore: doctor.reminderHoursBefore,
          plan: doctor.plan,
        }}
      />
    </div>
  );
}
