import type React from "react";
import { History, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FollowUpStatusBadge } from "@/components/ui/FollowUpStatusBadge";
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
  const isVisitor =
    person.rawMembershipStatus === "VISITOR" ||
    person.membershipStatus === "Visitor";

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

        {/* Follow-up status & touchpoint are STRICTLY for visitors */}
        {isVisitor && (
          <>
            <InfoTile label="Follow-up Status">
              <div className="mt-1.5">
                <FollowUpStatusBadge
                  status={person.followUpStatus || "PENDING"}
                  size="sm"
                />
              </div>
            </InfoTile>
            <InfoTile label="Last Contact">
              <p className="font-semibold text-fg mt-1">
                {person.lastFollowUpAt
                  ? new Date(person.lastFollowUpAt).toLocaleDateString()
                  : "Never"}
              </p>
            </InfoTile>
          </>
        )}

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
  const isVisitor =
    person.rawMembershipStatus === "VISITOR" ||
    person.membershipStatus === "Visitor";

  const noteLines = (person.followUpNotes || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-xs">
      {/* Visitor Follow-up Section - STRICTLY FOR VISITORS */}
      {isVisitor && (
        <div className="p-3.5 rounded-xl bg-subtle border border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-2xs text-fg-muted uppercase font-bold tracking-wider">
              Visitor Outreach & Follow-up
            </p>
            <FollowUpStatusBadge
              status={person.followUpStatus || "PENDING"}
              size="sm"
            />
          </div>
          {person.lastFollowUpAt && (
            <p className="text-2xs text-fg-muted">
              Last Contact: {new Date(person.lastFollowUpAt).toLocaleString()}
            </p>
          )}
          {noteLines.length > 0 ? (
            <div className="space-y-2 pt-1">
              {noteLines.map((line, idx) => {
                const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2}):?\s*(.*)$/);
                if (dateMatch) {
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-card border border-border space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-2xs font-mono font-semibold text-primary-text">
                        <Calendar className="w-3 h-3" />
                        <span>{dateMatch[1]}</span>
                      </div>
                      <p className="text-xs text-fg font-medium whitespace-pre-wrap">
                        {dateMatch[2] || "Follow-up contact recorded"}
                      </p>
                    </div>
                  );
                }
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-card border border-border text-fg font-medium whitespace-pre-wrap"
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-2xs text-fg-muted italic">
              No visitor follow-up notes recorded.
            </p>
          )}
        </div>
      )}

      {/* Member Notes / General Notes */}
      <div className="space-y-2">
        <p className="text-fg-muted text-2xs uppercase font-bold tracking-wider">
          {isVisitor ? "General Notes" : "Member Notes"}
        </p>
        {person.notes ? (
          <div className="p-3.5 rounded-xl bg-card border border-border text-fg font-medium whitespace-pre-wrap">
            {person.notes}
          </div>
        ) : (
          <div className={emptyBox}>
            {isVisitor
              ? "No general notes recorded."
              : "No notes recorded for this member."}
          </div>
        )}
      </div>
    </div>
  );
}
