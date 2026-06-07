import Link from "next/link";
import { Stethoscope } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-xl font-bold"
      >
        <Stethoscope className="h-6 w-6 text-primary" />
        ClinicBook
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
