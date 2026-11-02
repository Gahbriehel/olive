import { useState } from "react";
import { History, Calendar, Mail, MessageSquare, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { FollowUpStatusBadge } from "@/components/ui/FollowUpStatusBadge";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { usePersonMessages, useConfirmOutreach } from "@/hooks/useOutreach";
import { IPerson } from "@/models/person";
import { PersonMessageTimelineItem } from "@/models/outreach";

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
          <div className="flex items-center justify-between gap-2 mt-1">
            <p className="font-semibold text-fg">{person.phone}</p>
            {person.phone && person.phone !== "N/A" && (
              <WhatsAppButton
                personId={person.id}
                purpose={isVisitor ? "VISITOR_FOLLOW_UP" : "PASTORAL_CHECK_IN"}
                size="sm"
                variant="outline"
                label="WhatsApp"
              />
            )}
          </div>
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

export function PersonMessagesTab({ person }: { person: IPerson }) {
  const { data, isLoading, isError, refetch } = usePersonMessages(person.id);
  const confirmMutation = useConfirmOutreach();
  const [confirmingRefId, setConfirmingRefId] = useState<string | null>(null);

  const messages: PersonMessageTimelineItem[] = data?.items || [];

  const handleConfirm = (refId: string, sent: boolean) => {
    confirmMutation.mutate(
      { id: refId, sent, personId: person.id },
      {
        onSettled: () => {
          setConfirmingRefId(null);
          refetch();
        },
      },
    );
  };

  const isVisitor =
    person.rawMembershipStatus === "VISITOR" ||
    person.membershipStatus === "Visitor";

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-xs text-fg-muted space-y-2">
        <p>Failed to load message history.</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-fg-muted space-y-3 bg-subtle rounded-2xl border border-border-subtle">
        <MessageSquare className="w-8 h-8 text-fg-subtle mx-auto" />
        <div className="space-y-1">
          <p className="font-semibold text-fg">No message history</p>
          <p className="text-2xs text-fg-muted max-w-xs mx-auto">
            No email or WhatsApp messages recorded for {person.name}.
          </p>
        </div>
        {person.phone && person.phone !== "N/A" && (
          <div className="pt-1">
            <WhatsAppButton
              personId={person.id}
              purpose={isVisitor ? "VISITOR_FOLLOW_UP" : "PASTORAL_CHECK_IN"}
              label="Send WhatsApp Message"
              variant="outline"
              size="sm"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <p className="text-2xs font-semibold text-fg-muted uppercase tracking-wider">
          Message Timeline ({messages.length})
        </p>
        {person.phone && person.phone !== "N/A" && (
          <WhatsAppButton
            personId={person.id}
            purpose={isVisitor ? "VISITOR_FOLLOW_UP" : "PASTORAL_CHECK_IN"}
            label="Send WhatsApp"
            variant="outline"
            size="sm"
          />
        )}
      </div>

      {messages.map((msg, idx) => {
        const isWhatsApp = msg.type === "WHATSAPP";
        const isOpened = msg.status === "OPENED";
        const isSent = msg.status === "CONFIRMED_SENT";
        const isConfirming = confirmingRefId === msg.refId;

        const purposeLabel = msg.purpose
          ? msg.purpose.toLowerCase().replace(/_/g, " ")
          : "Message";

        return (
          <div
            key={msg.refId || idx}
            className="p-3.5 rounded-xl border border-border bg-surface space-y-2 transition-all"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isWhatsApp
                      ? "bg-success-soft text-success-text"
                      : "bg-primary-soft text-primary-text"
                  }`}
                >
                  {isWhatsApp ? (
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <span className="font-semibold text-fg capitalize">
                    {purposeLabel}
                  </span>
                  <span className="text-2xs text-fg-muted ml-2">
                    by {msg.by}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xs text-fg-muted font-mono">
                  {new Date(msg.at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {isSent ? (
                  <Badge variant="emerald" size="sm">
                    Sent
                  </Badge>
                ) : isOpened ? (
                  <Badge variant="amber" size="sm">
                    Opened
                  </Badge>
                ) : (
                  <Badge variant="slate" size="sm">
                    {msg.status.toLowerCase().replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
            </div>

            {/* Preview text (capped at 140 chars) */}
            <p className="text-xs text-fg-muted leading-relaxed line-clamp-2">
              {msg.preview?.slice(0, 140)}
            </p>

            {/* Confirm action for OPENED messages */}
            {isOpened && (
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
                <span className="text-2xs text-warning-text flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Waiting for send confirmation
                </span>

                {isConfirming ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xs text-fg-muted">Sent?</span>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={confirmMutation.isPending}
                      loading={confirmMutation.isPending}
                      onClick={() => handleConfirm(msg.refId, true)}
                    >
                      Yes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={confirmMutation.isPending}
                      onClick={() => handleConfirm(msg.refId, false)}
                    >
                      No
                    </Button>
                    <button
                      type="button"
                      onClick={() => setConfirmingRefId(null)}
                      className="text-2xs text-fg-muted hover:underline ml-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingRefId(msg.refId)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Confirm status
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
