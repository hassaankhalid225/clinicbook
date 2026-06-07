import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

/** Standard success envelope. */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/** Standard error envelope. */
export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: { message, details } }, { status });
}

/**
 * Wraps a route handler so thrown errors (AppError, ZodError, unexpected) are
 * converted into consistent JSON responses.
 */
export function handle<Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return fail("Validation failed", 422, err.flatten());
      }
      if (err instanceof AppError) {
        return fail(err.message, err.status, (err as { details?: unknown }).details);
      }
      console.error("[api] Unhandled error:", err);
      return fail("Internal server error", 500);
    }
  };
}
