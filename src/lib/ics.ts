/** Minimal iCalendar (.ics) generator for appointment confirmation emails. */

function fold(line: string): string {
  return line.replace(/([,;])/g, "\\$1");
}

/** Builds an .ics VEVENT. Times are floating local (clinic) time. */
export function buildIcs(params: {
  uid: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  summary: string;
  description?: string;
  location?: string;
}): string {
  const d = params.date.replace(/-/g, "");
  const s = params.startTime.replace(":", "") + "00";
  const e = params.endTime.replace(":", "") + "00";
  const stamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClinicBook//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${params.uid}@clinicbook`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${d}T${s}`,
    `DTEND:${d}T${e}`,
    `SUMMARY:${fold(params.summary)}`,
    params.description ? `DESCRIPTION:${fold(params.description)}` : "",
    params.location ? `LOCATION:${fold(params.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
