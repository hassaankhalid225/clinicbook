import { MOCK_CURRENT } from "@/core/utils/session";
import { requireRole } from "@/core/auth/session";
import { PortalSidebar, type NavItem } from "@/components/portal/portal-sidebar";
import { PortalHeader } from "@/components/portal/portal-header";
import { NotificationBell } from "@/components/portal/notification-bell";

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  { href: "/admin/doctors", label: "Doctors", icon: "ShieldCheck" },
  { href: "/admin/clients", label: "Clients", icon: "Users" },
  { href: "/admin/modules", label: "Modules", icon: "Boxes" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "CreditCard" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin"]);
  return (
    <div className="flex min-h-screen">
      <PortalSidebar brand="MediBook Admin" items={NAV} />
      <div className="flex flex-1 flex-col">
        <PortalHeader
          roleLabel="Admin"
          userName={MOCK_CURRENT.adminName}
          brand="MediBook Admin"
          navItems={NAV}
          notifications={<NotificationBell audience="admin" />}
        />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
