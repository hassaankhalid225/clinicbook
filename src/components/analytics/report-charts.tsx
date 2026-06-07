"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_COLORS = ["#0ea5e9", "#10b981", "#94a3b8", "#ef4444"];

export interface ReportData {
  daily: { date: string; count: number }[];
  status: { name: string; value: number }[];
  weekday: { day: string; count: number }[];
  byHour: { hour: string; count: number }[];
}

export function DailyTrendChart({ data }: { data: ReportData["daily"] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip />
        <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fill="url(#g)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StatusPie({ data }: { data: ReportData["status"] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function WeekdayBars({ data }: { data: ReportData["weekday"] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip cursor={{ fill: "rgba(14,165,233,0.08)" }} />
        <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HourBars({ data }: { data: ReportData["byHour"] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <XAxis dataKey="hour" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip cursor={{ fill: "rgba(14,165,233,0.08)" }} />
        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
