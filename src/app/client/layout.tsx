import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { requireRole } from "@/core/auth/session";
import { PortalSidebar, type NavItem } from "@/components/portal/portal-sidebar";
import { PortalHeader } from "@/components/portal/portal-header";
import { NotificationBell } from "@/components/portal/notification-bell";

const NAV: NavItem[] = [
  { href: "/client", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  { href: "/client/appointments", label: "Appointments", icon: "CalendarDays" },
  { href: "/client/favorites", label: "Favorite doctors", icon: "Heart" },
  { href: "/doctors", label: "Find doctors", icon: "Users" },
];

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["client"]);
  const client = await repositories.clients.getById(MOCK_CURRENT.clientId);

  return (
    <div className="flex min-h-screen">
      <PortalSidebar brand="MediBook" items={NAV} />
      <div className="flex flex-1 flex-col">
        <PortalHeader
          roleLabel="Client"
          userName={client?.fullName ?? "Client"}
          brand="MediBook"
          navItems={NAV}
          notifications={<NotificationBell audience="client" />}
        />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
