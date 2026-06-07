import Link from "next/link";
import { Stethoscope } from "lucide-react";
import type { Role } from "@/core/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginTabs } from "@/components/marketplace/login-tabs";

export const metadata = { title: "Sign in — MediBook" };

export default async function MarketplaceLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const defaultRole: Role =
    role === "doctor" || role === "admin" ? role : "client";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold">
        <Stethoscope className="h-6 w-6 text-primary" />
        MediBook
      </Link>
      <div className="w-full max-w-md">
        <LoginTabs defaultRole={defaultRole} />
      </div>
    </div>
  );
}
