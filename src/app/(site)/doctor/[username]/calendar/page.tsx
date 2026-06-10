import { redirect } from "next/navigation";

/**
 * Booking has ONE production path: the real flow at /book/[slug]
 * (live slots, patient details, payment, receipts). The marketplace
 * calendar URL stays shareable and lands there.
 */
export default async function BookingCalendarPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  redirect(`/book/${username}`);
}
