import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { requireRole } from "@/core/auth/session";
import { PortalSidebar, type NavItem } from "@/components/portal/portal-sidebar";
import { PortalHeader } from "@/components/portal/portal-header";
import { NotificationBell } from "@/components/portal/notification-bell";

const NAV: NavItem[] = [
  { href: "/provider", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  { href: "/provider/profile", label: "Profile", icon: "User" },
  { href: "/provider/services", label: "Services", icon: "Briefcase" },
  { href: "/provider/expertise", label: "Expertise", icon: "Sparkles" },
  { href: "/provider/availability", label: "Availability", icon: "Clock" },
  { href: "/provider/appointments", label: "Appointments", icon: "CalendarDays" },
  { href: "/provider/reviews", label: "Reviews", icon: "Star" },
  { href: "/provider/pos", label: "POS setup", icon: "Store" },
  { href: "/provider/subscription", label: "Subscription", icon: "CreditCard" },
];

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["doctor"]);
  const doctor = await repositories.doctors.getById(MOCK_CURRENT.doctorId);

  return (
    <div className="flex min-h-screen">
      <PortalSidebar brand="MediBook" items={NAV} />
      <div className="flex flex-1 flex-col">
        <PortalHeader
          roleLabel="Doctor"
          userName={doctor?.fullName ?? "Doctor"}
          brand="MediBook"
          navItems={NAV}
          notifications={<NotificationBell audience="doctor" />}
        />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
