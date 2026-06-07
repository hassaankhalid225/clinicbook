import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteMobileNav } from "@/components/marketplace/site-mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-1">
          <SiteMobileNav />
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Stethoscope className="h-6 w-6 text-primary" />
            MediBook
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/doctors" className="text-muted-foreground hover:text-foreground">
            Find doctors
          </Link>
          <Link href="/#categories" className="text-muted-foreground hover:text-foreground">
            Specialties
          </Link>
          <Link href="/#pricing" className="text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Link href="/#how" className="text-muted-foreground hover:text-foreground">
            How it works
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/login?role=doctor">Join as Doctor</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
