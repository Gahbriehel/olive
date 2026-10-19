import type React from "react";
import { History } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { IPerson } from "@/models/person";

function InfoTile({
  label,
  children,
  className = "p-3 rounded-xl bg-subtle",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-2xs text-fg-muted font-bold uppercase">{label}</p>
      {children}
    </div>
  );
}

export function PersonInfoTab({ person }: { person: IPerson }) {
  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-2 gap-3">
        <InfoTile label="Phone Number">
          <p className="font-semibold text-fg mt-1">{person.phone}</p>
        </InfoTile>
        <InfoTile label="Email Address">
          <div className="mt-1">
            <TruncatedTextWithCopy
              text={person.email}
              maxLength={24}
              textClassName="font-semibold text-fg"
            />
          </div>
        </InfoTile>
        <InfoTile label="Gender">
          <p className="font-semibold text-fg mt-1">{person.gender}</p>
        </InfoTile>
        <InfoTile label="Date of Birth">
          <p className="font-semibold text-fg mt-1">{person.dob}</p>
        </InfoTile>
        <InfoTile label="Follow-up Status">
          <div className="mt-1.5">
            {person.followUpStatus ? (
              <StatusBadge status={person.followUpStatus} size="sm" />
            ) : (
              <span className="text-2xs text-fg-muted italic">
                No status recorded
              </span>
            )}
          </div>
        </InfoTile>
        <InfoTile label="Last Contact">
          <p className="font-semibold text-fg mt-1">
            {person.lastFollowUpAt
              ? new Date(person.lastFollowUpAt).toLocaleDateString()
              : "Never"}
          </p>
        </InfoTile>
        {person.address && (
          <InfoTile
            label="Address"
            className="col-span-2 p-3 rounded-xl bg-subtle"
          >
            <p className="font-semibold text-fg mt-1">{person.address}</p>
          </InfoTile>
        )}
      </div>

      <div className="p-3.5 rounded-xl border border-border space-y-2">
        <p className="font-bold text-fg flex items-center gap-1.5">
          <History className="w-4 h-4 text-primary-text" />
          Registration History ({person.registrationHistoryCount || 0} Events)
        </p>
        {person.registrations && person.registrations.length > 0 ? (
          <div className="space-y-2 pt-1">
            {person.registrations.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-subtle"
              >
                <div>
                  <p className="font-semibold text-fg">{reg.eventTitle}</p>
                  <p className="text-2xs text-fg-muted">
                    {reg.eventDate} • Team: {reg.teamName}
                  </p>
                </div>
                <StatusBadge status={reg.status} size="sm" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-2xs text-fg-muted italic">
            No event registrations recorded.
          </p>
        )}
      </div>
    </div>
  );
}

const emptyBox = "p-4 text-center text-fg-muted italic bg-subtle rounded-xl";

export function PersonDepartmentsTab({ person }: { person: IPerson }) {
  return (
    <div className="space-y-2 text-xs">
      <p className="text-fg-muted text-2xs">
        Church ministry department memberships:
      </p>
      {person.departments && person.departments.length > 0 ? (
        person.departments.map((dept, idx) => (
          <div
            key={dept.id || idx}
            className="p-3.5 rounded-xl bg-subtle border border-border space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-fg">{dept.name}</span>
              <StatusBadge status={dept.role || "Member"} size="sm" />
            </div>
            {dept.description && (
              <p className="text-2xs text-fg-muted">{dept.description}</p>
            )}
            {dept.joinedAt && (
              <p className="text-2xs text-fg-muted">
                Joined: {new Date(dept.joinedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))
      ) : (
        <div className={emptyBox}>No department assigned.</div>
      )}
    </div>
  );
}

export function PersonAttendanceTab({ person }: { person: IPerson }) {
  return (
    <div className="space-y-2 text-xs">
      <p className="text-fg-muted text-2xs">
        Historical event check-in log ({person.eventsAttendedCount || 0}{" "}
        Attended):
      </p>
      {person.attendanceHistory && person.attendanceHistory.length > 0 ? (
        person.attendanceHistory.map((hist) => (
          <div
            key={hist.id}
            className="p-3 rounded-xl bg-subtle flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-fg">{hist.eventName}</p>
              <p className="text-2xs text-fg-muted">{hist.date}</p>
            </div>
            <StatusBadge
              status={hist.attended ? "Checked In" : "Not Checked In"}
              size="sm"
            />
          </div>
        ))
      ) : (
        <div className={emptyBox}>No attendance records found.</div>
      )}
    </div>
  );
}

export function PersonNotesTab({ person }: { person: IPerson }) {
  return (
    <div className="space-y-4 text-xs">
      {/* Pastoral Follow-up Section */}
      <div className="p-3.5 rounded-xl bg-subtle border border-border space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-2xs text-fg-muted uppercase font-bold tracking-wider">
            Visitor & Pastoral Follow-up
          </p>
          {person.followUpStatus && (
            <StatusBadge status={person.followUpStatus} size="sm" />
          )}
        </div>
        {person.lastFollowUpAt && (
          <p className="text-2xs text-fg-muted">
            Last Contact: {new Date(person.lastFollowUpAt).toLocaleString()}
          </p>
        )}
        {person.followUpNotes ? (
          <div className="p-3 rounded-lg bg-card border border-border text-fg font-medium">
            {person.followUpNotes}
          </div>
        ) : (
          <p className="text-2xs text-fg-muted italic">
            No pastoral follow-up notes recorded.
          </p>
        )}
      </div>

      {/* General Admin Notes */}
      <div className="space-y-2">
        <p className="text-fg-muted text-2xs uppercase font-bold tracking-wider">
          General Notes
        </p>
        {person.notes ? (
          <div className="p-3.5 rounded-xl bg-subtle border border-border text-fg font-medium">
            {person.notes}
          </div>
        ) : (
          <div className={emptyBox}>No general notes recorded.</div>
        )}
      </div>
    </div>
  );
}
