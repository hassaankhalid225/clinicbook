/**
 * Time helpers for slot math. Times are stored as "HH:mm" strings; dates as
 * "YYYY-MM-DD" strings at the boundary, converted to Date for Prisma `@db.Date`.
 */

/** "HH:mm" → minutes since midnight. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** minutes since midnight → "HH:mm". */
export function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Adds `min` minutes to a "HH:mm" time, returning "HH:mm". */
export function addMinutes(time: string, min: number): string {
  return fromMinutes(toMinutes(time) + min);
}

/** True when two [start,end) minute ranges overlap. */
export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Parses "YYYY-MM-DD" into a UTC Date at midnight (safe for `@db.Date`). */
export function parseDateOnly(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Formats a Date as "YYYY-MM-DD" (UTC). */
export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** JS getUTCDay()-style day of week for a "YYYY-MM-DD" string. 0=Sun…6=Sat. */
export function dayOfWeek(date: string): number {
  return parseDateOnly(date).getUTCDay();
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isValidDate = (s: string) => DATE_RE.test(s);
export const isValidTime = (s: string) => TIME_RE.test(s);
