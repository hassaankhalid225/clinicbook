"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, LayoutDashboard, User, Briefcase, Sparkles, Clock, CalendarDays,
  Star, CreditCard, Users, Heart, ShieldCheck, Boxes, Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { NavItem } from "./portal-sidebar";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, User, Briefcase, Sparkles, Clock, CalendarDays, Star,
  CreditCard, Users, Heart, ShieldCheck, Boxes,
};

export function PortalMobileNav({ brand, items }: { brand: string; items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="flex h-16 items-center gap-2 border-b px-5 font-bold">
          <Stethoscope className="h-6 w-6 text-primary" /> {brand}
        </SheetTitle>
        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
