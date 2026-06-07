/**
 * Mock notification system. Derives a feed from current marketplace data per
 * audience. Future-ready: the same triggers (appointment created/cancelled,
 * reminder, new review) would fan out to email / SMS / push / WhatsApp.
 */
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { formatDate } from "@/core/utils/format";

export type NotifAudience = "doctor" | "client" | "admin";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export async function getNotifications(audience: NotifAudience): Promise<NotificationItem[]> {
  if (audience === "doctor") {
    const [appts, reviews] = await Promise.all([
      repositories.appointments.listByDoctor(MOCK_CURRENT.doctorId),
      repositories.reviews.listByDoctor(MOCK_CURRENT.doctorId),
    ]);
    const items: NotificationItem[] = [];
    appts.filter((a) => a.status === "pending").forEach((a) =>
      items.push({ id: `n-${a.id}`, title: "New booking request", body: `${a.clientName} requested ${a.serviceTitle} on ${formatDate(a.date)}`, time: "Just now", unread: true }),
    );
    reviews.filter((r) => !r.reply).slice(0, 2).forEach((r) =>
      items.push({ id: `n-${r.id}`, title: "New review", body: `${r.clientName} left you ${r.rating}★`, time: "Today", unread: true }),
    );
    return items;
  }

  if (audience === "client") {
    const appts = await repositories.appointments.listByClient(MOCK_CURRENT.clientId);
    return appts
      .filter((a) => ["confirmed", "pending"].includes(a.status))
      .slice(0, 4)
      .map((a) => ({
        id: `n-${a.id}`,
        title: a.status === "confirmed" ? "Appointment confirmed" : "Booking pending",
        body: `${a.serviceTitle} with ${a.doctorName} · ${formatDate(a.date)} at ${a.startTime}`,
        time: formatDate(a.date),
        unread: a.status === "confirmed",
      }));
  }

  // admin
  const [doctors, bookings] = await Promise.all([
    repositories.doctors.listAll(),
    repositories.appointments.countAll(),
  ]);
  const items: NotificationItem[] = [];
  doctors.filter((d) => d.status === "pending").forEach((d) =>
    items.push({ id: `n-${d.id}`, title: "Doctor awaiting approval", body: `${d.fullName} (${d.specialty})`, time: "Pending", unread: true }),
  );
  items.push({ id: "n-bookings", title: "Platform activity", body: `${bookings} total bookings across all tenants`, time: "Today", unread: false });
  return items;
}
