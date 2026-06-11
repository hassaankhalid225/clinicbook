import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { PortalMobileNav } from "@/components/portal/portal-mobile-nav";
import { LogoutButton } from "@/components/portal/logout-button";
import type { NavItem } from "@/components/portal/portal-sidebar";

export function PortalHeader({
  roleLabel,
  userName,
  brand,
  navItems,
  notifications,
}: {
  roleLabel: string;
  userName: string;
  brand: string;
  navItems: NavItem[];
  notifications?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <PortalMobileNav brand={brand} items={navItems} />
        <Badge variant="secondary" className="capitalize">{roleLabel}</Badge>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">{userName}</span>
        {notifications}
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
