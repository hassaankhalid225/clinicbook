"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction, type ActionResult } from "@/app/(auth)/actions";
import { DEV_AUTH_BYPASS } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Log in"}
    </Button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState<ActionResult, FormData>(
    loginAction,
    {},
  );

  // TEMP dev bypass: no credentials — go straight to the dashboard.
  if (DEV_AUTH_BYPASS) {
    return (
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(redirectTo || "/dashboard");
          }}
        >
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Demo mode — login is disabled, just continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="dr.sarah@clinic.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">
              Log in
            </Button>
            <p className="text-sm text-muted-foreground">
              New to ClinicBook?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Log in to manage your appointments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo ?? "/dashboard"} />
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="dr.sarah@clinic.com"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <SubmitButton />
          <p className="text-sm text-muted-foreground">
            New to ClinicBook?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
