import { prisma } from "@/lib/prisma";
import { fromMinutes, toMinutes } from "@/lib/datetime";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export interface AnalyticsSummary {
  totalBookings: number;
  completed: number;
  noShows: number;
  cancellations: number;
  noShowRate: string;
  busiestDay: string | null;
  busiestHour: string | null;
  avgBookingsPerDay: number;
}

/**
 * Computes dashboard analytics for the current month from the doctor's
 * appointments. Pure aggregation in memory — fine at MVP volumes.
 */
export const analyticsService = {
  async summary(doctorId: string): Promise<AnalyticsSummary> {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

    const appointments = await prisma.appointment.findMany({
      where: { doctorId, appointmentDate: { gte: start, lte: end } },
      select: { status: true, appointmentDate: true, startTime: true },
    });

    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const noShows = appointments.filter((a) => a.status === "no_show").length;
    const cancellations = appointments.filter((a) => a.status === "cancelled").length;

    const dayCounts = new Array(7).fill(0);
    const hourCounts = new Map<number, number>();
    const distinctDays = new Set<string>();

    for (const a of appointments) {
      dayCounts[a.appointmentDate.getUTCDay()] += 1;
      const hour = Math.floor(toMinutes(a.startTime) / 60);
      hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
      distinctDays.add(a.appointmentDate.toISOString().slice(0, 10));
    }

    const busiestDayIdx = dayCounts.some((c) => c > 0)
      ? dayCounts.indexOf(Math.max(...dayCounts))
      : -1;

    let busiestHour: string | null = null;
    if (hourCounts.size > 0) {
      const topHour = [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      busiestHour = fromMinutes(topHour * 60);
    }

    const noShowRate = total > 0 ? `${((noShows / total) * 100).toFixed(1)}%` : "0%";
    const avgPerDay =
      distinctDays.size > 0
        ? Math.round((total / distinctDays.size) * 10) / 10
        : 0;

    return {
      totalBookings: total,
      completed,
      noShows,
      cancellations,
      noShowRate,
      busiestDay: busiestDayIdx >= 0 ? DAY_NAMES[busiestDayIdx] : null,
      busiestHour,
      avgBookingsPerDay: avgPerDay,
    };
  },

  /**
   * Richer dataset for the Reports screen: daily booking trend (last `days`),
   * status breakdown, bookings by weekday and by hour, and revenue from
   * completed appointments that have a priced service.
   */
  async reports(doctorId: string, days = 30) {
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    const startDate = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
    );

    const appointments = await prisma.appointment.findMany({
      where: { doctorId, appointmentDate: { gte: startDate } },
      select: {
        status: true,
        appointmentDate: true,
        startTime: true,
        service: { select: { priceCents: true } },
      },
    });

    // Daily trend buckets.
    const dailyMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setUTCDate(d.getUTCDate() + i);
      dailyMap.set(d.toISOString().slice(0, 10), 0);
    }
    const statusCounts = { scheduled: 0, completed: 0, cancelled: 0, no_show: 0 };
    const weekdayCounts = new Array(7).fill(0);
    const hourCounts: Record<string, number> = {};
    let revenueCents = 0;

    for (const a of appointments) {
      const key = a.appointmentDate.toISOString().slice(0, 10);
      if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
      statusCounts[a.status] += 1;
      weekdayCounts[a.appointmentDate.getUTCDay()] += 1;
      const hour = a.startTime.slice(0, 2) + ":00";
      hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
      if (a.status === "completed" && a.service) {
        revenueCents += a.service.priceCents;
      }
    }

    return {
      daily: [...dailyMap.entries()].map(([date, count]) => ({
        date: date.slice(5),
        count,
      })),
      status: [
        { name: "Scheduled", value: statusCounts.scheduled },
        { name: "Completed", value: statusCounts.completed },
        { name: "Cancelled", value: statusCounts.cancelled },
        { name: "No-show", value: statusCounts.no_show },
      ],
      weekday: DAY_NAMES.map((name, i) => ({
        day: name.slice(0, 3),
        count: weekdayCounts[i],
      })),
      byHour: Object.entries(hourCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([hour, count]) => ({ hour, count })),
      revenueCents,
      total: appointments.length,
    };
  },
};
