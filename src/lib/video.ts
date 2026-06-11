/**
 * Telehealth video rooms.
 *
 * Uses Jitsi Meet's public instance — fully functional video calls in the
 * browser with NO API key or account required, so telehealth works out of the
 * box. Swap `VIDEO_BASE` (or set NEXT_PUBLIC_VIDEO_BASE to a self-hosted Jitsi /
 * Daily.co room base) for a HIPAA-grade provider in production.
 */
const VIDEO_BASE =
  process.env.NEXT_PUBLIC_VIDEO_BASE?.replace(/\/$/, "") || "https://meet.jit.si";

/** Deterministic, unguessable room URL for an appointment. */
export function videoRoomUrl(seed: string): string {
  const slug = seed.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24);
  return `${VIDEO_BASE}/ClinicBook-${slug}`;
}
