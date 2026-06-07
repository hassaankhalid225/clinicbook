import Link from "next/link";
import { Stethoscope } from "lucide-react";

const COLUMNS = [
  {
    title: "Patients",
    links: [
      { label: "Find doctors", href: "/doctors" },
      { label: "Manage appointment", href: "/portal" },
      { label: "Specialties", href: "/#categories" },
    ],
  },
  {
    title: "Doctors",
    links: [
      { label: "Join as Doctor", href: "/auth/login?role=doctor" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Provider portal", href: "/provider" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Admin", href: "/admin" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Stethoscope className="h-6 w-6 text-primary" />
            MediBook
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            The marketplace where patients find great doctors and book in
            seconds — built for healthcare.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} MediBook. Built for doctors and patients.
      </div>
    </footer>
  );
}
