import React from "react";
import { BellRing } from "lucide-react";
import { calculateNotificationSchedule, formatClock } from "./nightPrayerUtils";

interface Props {
  timeOfDay: string;
  reminderOffsetsMin: number[];
  isActive: boolean;
}

/** Live summary of the pushes members receive under the current settings. */
export const NotificationPreview: React.FC<Props> = ({
  timeOfDay,
  reminderOffsetsMin,
  isActive,
}) => {
  const alerts = calculateNotificationSchedule(timeOfDay, reminderOffsetsMin);
  return (
    <div className="rounded-2xl border border-primary-border bg-primary-soft p-4">
      <p className="flex items-center gap-2 text-xs font-bold text-primary-text">
        <BellRing className="h-4 w-4" aria-hidden /> Scheduled Member Alerts
      </p>
      {alerts.length === 0 ? (
        <p className="mt-2 text-xs text-fg-muted">
          Enter a valid start time to see the alerts.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-xs text-fg">
          {alerts.map((a) => (
            <li key={`${a.kind}-${a.time}-${a.text}`}>
              <span className="font-bold">{a.time}</span> —{" "}
              {a.kind === "reminder" ? "Reminder push" : "On-time push"} (
              <em>&ldquo;{a.text}&rdquo;</em>)
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-2xs text-fg-muted">
        Times are Africa/Lagos
        {timeOfDay ? `; the session starts at ${formatClock(timeOfDay)}` : ""}.
        {!isActive && " Nothing is sent while Night Prayer is inactive."}
      </p>
    </div>
  );
};
