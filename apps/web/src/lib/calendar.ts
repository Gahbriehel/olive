import { IEventResponse } from "@olive/types";

export function generateGoogleCalendarLink(event: IEventResponse): string {
  const startTime = new Date(event.startDate)
    .toISOString()
    .replace(/-|:|\..\d\d/g, "");
  const endTime = new Date(event.endDate)
    .toISOString()
    .replace(/-|:|\..\d\d/g, "");
  const title = encodeURIComponent(event.title);
  const location = encodeURIComponent(event.location || "");
  const details = encodeURIComponent(event.description || "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
}

export function generateIcsFile(event: IEventResponse): string {
  const formatDate = (date: string) =>
    new Date(date).toISOString().replace(/-|:|\..\d\d/g, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Olive//Event//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(event: IEventResponse): void {
  const ics = generateIcsFile(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
