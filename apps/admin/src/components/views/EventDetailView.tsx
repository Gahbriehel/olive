import React, { useState } from "react";
import {
  ArrowLeft,
  QrCode,
  Users,
  UserCheck,
  Shield,
  Gamepad2,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { StatsCard } from "@/components/ui/StatsCard";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { EventsForm } from "@/components/Forms/EventsForm";
import { useEvents } from "@/hooks/useEvents";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { ChurchEvent, Team, Registration, Game } from "@/types/dashboard";

interface EventDetailViewProps {
  event: ChurchEvent;
  onBack: () => void;
  teams: Team[];
  registrations: Registration[];
  games: Game[];
  onOpenQrScanner: () => void;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  event,
  onBack,
  teams,
  registrations,
  games,
  onOpenQrScanner,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { updateEvent, deleteEvent } = useEvents();

  const tabs = [
    { id: "overview", label: "Overview" },
    {
      id: "registrations",
      label: "Registrations",
      count: registrations.length,
    },
    { id: "attendance", label: "Attendance", count: event.checkedInCount },
    { id: "teams", label: "Assigned Teams", count: teams.length },
    { id: "games", label: "Games & Leaderboard", count: games.length },
    { id: "qr-status", label: "QR Status" },
  ];

  const capPct =
    event.capacity > 0
      ? Math.round((event.registeredCount / event.capacity) * 100)
      : 0;
  const checkinPct =
    event.registeredCount > 0
      ? Math.round((event.checkedInCount / event.registeredCount) * 100)
      : 0;
  const completedGames = games.filter((g) => g.status === "Completed").length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Bar */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                event.status === "PUBLISHED"
                  ? "emerald"
                  : event.status === "DRAFT"
                    ? "amber"
                    : event.status === "COMPLETED"
                      ? "indigo"
                      : "rose"
              }
              size="sm"
            >
              {event.status}
            </Badge>
            <span className="text-xs font-semibold text-slate-400">
              {event.category}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {event.name}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<Edit className="w-4 h-4 text-amber-500" />}
          >
            Edit Event
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDeleteOpen(true)}
            leftIcon={<Trash2 className="w-4 h-4 text-rose-500" />}
            className="hover:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400"
          >
            Delete Event
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Capacity Used"
              value={`${capPct}%`}
              change={`${event.registeredCount} of ${event.capacity} seats`}
              trend="neutral"
              icon={Users}
              color="indigo"
            />
            <StatsCard
              title="Checked-In Rate"
              value={`${checkinPct}%`}
              change={`${event.checkedInCount} checked in`}
              trend="up"
              icon={UserCheck}
              color="emerald"
            />
            <StatsCard
              title="Assigned Teams"
              value={`${teams.length} Teams`}
              change="Balanced allocation"
              trend="neutral"
              icon={Shield}
              color="cyan"
            />
            <StatsCard
              title="Games Tournament"
              value={`${games.length} Contests`}
              change={`${completedGames} games completed`}
              trend="up"
              icon={Gamepad2}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              {event.imageUrl && (
                <div className="relative w-full h-48 bg-slate-100 dark:bg-zinc-800 overflow-hidden border-b border-slate-100 dark:border-zinc-800">
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
              <CardContent className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Location:
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {event.location}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Event Dates:
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {new Date(event.startDate).toLocaleDateString()} –{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Registration Deadline:
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {new Date(event.registrationDeadline).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fast Actions</CardTitle>
                <CardDescription>
                  Desk and game management tools
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
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-xs">
                  <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Team Auto-Balancing
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Attendees are automatically distributed evenly across Team
                    Igniter, Tempest, Valor, and Lumin upon registration.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Content 2: Registrations */}
      {activeTab === "registrations" && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Event Registrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {registrations.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {r.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {r.email} • {r.registrationNumber}
                  </p>
                </div>
                <Badge
                  variant={r.status === "Checked-In" ? "emerald" : "indigo"}
                >
                  {r.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tab Content 3: Attendance */}
      {activeTab === "attendance" && (
        <Card>
          <CardHeader>
            <CardTitle>Live Check-in Progress</CardTitle>
            <CardDescription>
              {event.checkedInCount} of {event.registeredCount} checked in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${checkinPct}%` }}
              />
            </div>
            <Button
              variant="primary"
              onClick={onOpenQrScanner}
              leftIcon={<QrCode className="w-4 h-4" />}
            >
              Open Scanner
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tab Content 4: Teams */}
      {activeTab === "teams" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map((t) => (
            <Card key={t.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: t.colorHex }}
                >
                  {t.name}
                </span>
                <span className="text-xs font-mono font-bold">
                  {t.memberCount} Members
                </span>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p className="text-slate-500">
                  Captain:{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {t.captain}
                  </strong>
                </p>
                <p className="text-slate-500">
                  Points:{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {t.totalPoints}
                  </strong>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab Content 5: Games */}
      {activeTab === "games" && (
        <div className="space-y-3">
          {games.map((g, idx) => (
            <Card key={g.id}>
              <CardContent className="p-4 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {g.name}
                  </h4>
                  <p className="text-slate-400">Max Score: {g.maxScore} pts</p>
                </div>
                <span className="font-mono text-xs text-indigo-600 font-bold">
                  Game #{idx + 1}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab Content 6: QR Status */}
      {activeTab === "qr-status" && (
        <Card>
          <CardHeader>
            <CardTitle>QR Code Dispatch Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
              100% of registered attendees have generated digital QR codes &
              received email confirmation.
            </div>
          </CardContent>
        </Card>
      )}

      {isEditing && (
        <SidebarModal
          title="Edit Event"
          display={isEditing}
          close={() => setIsEditing(false)}
        >
          <EventsForm
            initialValues={{
              id: event.id,
              title: event.name,
              description: event.description,
              location: event.location,
              startDate: event.startDate,
              endDate: event.endDate,
              status: event.status,
              imageUrl: event.imageUrl,
              googleCalendarSync: event.googleCalendarSync,
            }}
            onCancel={() => setIsEditing(false)}
            onSubmit={async (data) => {
              await updateEvent({
                id: event.id,
                dto: {
                  title: data.title,
                  description: data.description,
                  location: data.location,
                  startDate: data.startDate,
                  endDate: data.endDate,
                  status: data.status,
                  imageUrl: data.imageUrl,
                  googleCalendarSync: data.googleCalendarSync,
                },
              });
              setIsEditing(false);
            }}
            onDelete={async () => {
              await deleteEvent(event.id);
              setIsEditing(false);
              onBack();
            }}
          />
        </SidebarModal>
      )}

      {confirmDeleteOpen && (
        <ConfirmActionModal
          display={confirmDeleteOpen}
          close={() => setConfirmDeleteOpen(false)}
          actionName="delete"
          title={`Are you sure you want to delete ${event.name}?`}
          fn={async () => {
            await deleteEvent(event.id);
            setConfirmDeleteOpen(false);
            onBack();
          }}
        />
      )}
    </div>
  );
};
