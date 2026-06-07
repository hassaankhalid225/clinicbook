"use client";

import Link from "next/link";
import { Menu, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const LINKS = [
  { href: "/doctors", label: "Find doctors" },
  { href: "/#categories", label: "Specialties" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#how", label: "How it works" },
  { href: "/portal", label: "Manage appointment" },
];

export function SiteMobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetTitle className="flex items-center gap-2 font-bold">
          <Stethoscope className="h-6 w-6 text-primary" /> MediBook
        </SheetTitle>
        <nav className="mt-6 flex flex-col gap-1">
          {LINKS.map((l) => (
            <SheetClose asChild key={l.href}>
              <Link href={l.href} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                {l.label}
              </Link>
            </SheetClose>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <SheetClose asChild>
              <Button variant="outline" asChild><Link href="/auth/login">Log in</Link></Button>
            </SheetClose>
            <SheetClose asChild>
              <Button asChild><Link href="/auth/login?role=doctor">Join as Doctor</Link></Button>
            </SheetClose>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
