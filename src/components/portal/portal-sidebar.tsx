"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, User, Briefcase, Sparkles, Clock, CalendarDays,
  Star, CreditCard, Users, Heart, ShieldCheck, Boxes, BarChart3,
  Stethoscope, Settings, Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, User, Briefcase, Sparkles, Clock, CalendarDays, Star,
  CreditCard, Users, Heart, ShieldCheck, Boxes, BarChart3, Settings, Store,
};

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}

export function PortalSidebar({
  brand,
  items,
}: {
  brand: string;
  items: NavItem[];
}) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-5 font-bold">
        <Stethoscope className="h-6 w-6 text-primary" />
        {brand}
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
