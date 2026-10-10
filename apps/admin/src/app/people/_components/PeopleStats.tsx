import { Calendar, Shield, UserCheck, Users } from "lucide-react";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";

interface PeopleStatsProps {
  totalPeople: number;
  totalMembers: number;
  totalWorkers: number;
  totalVisitors: number;
  loading: boolean;
}

const percentOf = (part: number, total: number) =>
  total > 0 ? ((part / total) * 100).toFixed(0) : 0;

export function PeopleStats({
  totalPeople,
  totalMembers,
  totalWorkers,
  totalVisitors,
  loading,
}: PeopleStatsProps) {
  return (
    <StatsCardGroup>
      <StatsCard
        title="Total People"
        value={totalPeople.toLocaleString()}
        change="Directory total"
        trend="neutral"
        icon={Users}
        color="indigo"
        loading={loading}
      />
      <StatsCard
        title="Church Members"
        value={totalMembers.toLocaleString()}
        change={`${percentOf(totalMembers, totalPeople)}% of total`}
        trend="up"
        icon={Shield}
        color="cyan"
        loading={loading}
      />
      <StatsCard
        title="Church Workers"
        value={totalWorkers.toLocaleString()}
        change=""
        trend="up"
        icon={Calendar}
        color="emerald"
        loading={loading}
      />
      <StatsCard
        title="Visitors & Guests"
        value={totalVisitors.toLocaleString()}
        change={`${percentOf(totalVisitors, totalPeople)}% of total`}
        trend="neutral"
        icon={UserCheck}
        color="amber"
        loading={loading}
      />
    </StatsCardGroup>
  );
}
