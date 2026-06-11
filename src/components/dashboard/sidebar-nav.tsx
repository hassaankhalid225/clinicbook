"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  Clock,
  Settings,
  Users,
  Briefcase,
  BarChart3,
  ListChecks,
  Rocket,
  CalendarRange,
  Activity,
  Boxes,
  ReceiptText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/getting-started", label: "Getting started", icon: Rocket },
  { href: "/dashboard/queue", label: "Queue", icon: Activity },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/services", label: "Services", icon: Briefcase },
  { href: "/dashboard/availability", label: "Availability", icon: Clock },
  { href: "/dashboard/waitlist", label: "Waitlist", icon: ListChecks },
  { href: "/dashboard/receipts", label: "Receipts", icon: ReceiptText },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/modules", label: "Modules & billing", icon: Boxes },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
