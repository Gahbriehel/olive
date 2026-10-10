import {
  DoorOpen,
  Gamepad2,
  QrCode,
  Shield,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { IChurchEvent } from "@/types/dashboard";

interface EventOverviewTabProps {
  event: IChurchEvent;
  totalRegistrations: number;
  registrationsLoading: boolean;
  teamCount: number;
  teamsLoading: boolean;
  gameCount: number;
  completedGames: number;
  gamesLoading: boolean;
  onOpenQrScanner: () => void;
}

export function EventOverviewTab({
  event,
  totalRegistrations: totalCount,
  registrationsLoading,
  teamCount,
  teamsLoading,
  gameCount,
  completedGames,
  gamesLoading,
  onOpenQrScanner,
}: EventOverviewTabProps) {
  const capPct =
    event.capacity && event.capacity > 0
      ? Math.round((totalCount / event.capacity) * 100)
      : 0;

  const checkinPct =
    totalCount > 0 ? Math.round((event.checkedInCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <StatsCardGroup>
        <StatsCard
          title={
            event.requiresRegistration ? "Capacity Used" : "Admission Mode"
          }
          value={event.requiresRegistration ? `${capPct}%` : "Open Admission"}
          change={
            event.requiresRegistration
              ? `${totalCount} of ${event.capacity ?? "∞"} seats`
              : "No registration required"
          }
          trend="neutral"
          icon={event.requiresRegistration ? Users : DoorOpen}
          color="indigo"
          loading={registrationsLoading}
        />
        <StatsCard
          title="Checked-In Count"
          value={`${event.checkedInCount}`}
          change={
            event.requiresRegistration
              ? `${checkinPct}% check-in rate`
              : "Walk-in check-ins"
          }
          trend="up"
          icon={UserCheck}
          color="emerald"
        />
        <StatsCard
          title="Assigned Teams"
          value={`${teamCount} Teams`}
          change="Balanced allocation"
          trend="neutral"
          icon={Shield}
          color="cyan"
          loading={teamsLoading}
        />
        <StatsCard
          title="Games Tournament"
          value={`${gameCount} Contests`}
          change={`${completedGames} games completed`}
          trend="up"
          icon={Gamepad2}
          color="amber"
          loading={gamesLoading}
        />
      </StatsCardGroup>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          {event.imageUrl && (
            <div className="relative w-full h-48 bg-muted overflow-hidden border-b border-border-subtle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle>Event Details & Schedule</CardTitle>
            <CardDescription>
              Main venue and registration deadlines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-fg-secondary">
            <div className="p-3 rounded-xl bg-subtle space-y-1.5">
              <p className="font-semibold text-fg">Location:</p>
              <p className="text-fg-muted">
                {event.location || "Main Sanctuary"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-subtle space-y-1.5">
              <p className="font-semibold text-fg">Event Dates:</p>
              <p className="text-fg-muted">
                {new Date(event.startDate).toLocaleString()} –{" "}
                {new Date(event.endDate).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-subtle space-y-1.5">
              <p className="font-semibold text-fg">Admission Type:</p>
              <p className="text-fg-muted">
                {event.requiresRegistration
                  ? `Registration Required (Capacity: ${event.capacity ?? "Unlimited"})`
                  : "Open Admission (No pre-registration required)"}
              </p>
            </div>

            {/* Program Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div className="p-3 rounded-xl bg-warning-soft space-y-2">
                <p className="font-bold text-warning-text flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-warning" />
                  Program Highlights:
                </p>
                <ul className="space-y-1 pl-1">
                  {event.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="text-xs text-fg-secondary flex items-start gap-1.5"
                    >
                      <span className="text-warning font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance & Desk Tools</CardTitle>
            <CardDescription>
              QR scanner and live participant tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={onOpenQrScanner}
              leftIcon={<QrCode className="w-4 h-4" />}
            >
              Launch QR Check-in Terminal
            </Button>
            <div className="p-4 rounded-xl border border-border bg-subtle text-xs">
              <p className="font-bold text-fg mb-1">Team Auto-Balancing</p>
              <p className="text-fg-muted">
                Attendees are automatically distributed evenly across House
                Teams upon registration checkout.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
