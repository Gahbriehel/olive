import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/helpers/cn";
import { Skeleton } from "@/components/ui/Skeleton";

export type StatsCardColor =
  "indigo" | "emerald" | "amber" | "rose" | "cyan" | "purple" | "slate";

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  color?: StatsCardColor;
  description?: string;
  className?: string;
  loading?: boolean;
}

const colorVariants: Record<
  StatsCardColor,
  {
    iconBg: string;
    iconText: string;
    trendText: string;
  }
> = {
  indigo: {
    iconBg: "bg-indigo-50 dark:bg-indigo-950/60",
    iconText: "text-indigo-600 dark:text-indigo-400",
    trendText: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
    iconText: "text-emerald-600 dark:text-emerald-400",
    trendText: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-950/60",
    iconText: "text-amber-600 dark:text-amber-400",
    trendText: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    iconBg: "bg-rose-50 dark:bg-rose-950/60",
    iconText: "text-rose-600 dark:text-rose-400",
    trendText: "text-rose-600 dark:text-rose-400",
  },
  cyan: {
    iconBg: "bg-cyan-50 dark:bg-cyan-950/60",
    iconText: "text-cyan-600 dark:text-cyan-400",
    trendText: "text-cyan-600 dark:text-cyan-400",
  },
  purple: {
    iconBg: "bg-purple-50 dark:bg-purple-950/60",
    iconText: "text-purple-600 dark:text-purple-400",
    trendText: "text-purple-600 dark:text-purple-400",
  },
  slate: {
    iconBg: "bg-slate-100 dark:bg-zinc-800",
    iconText: "text-slate-600 dark:text-slate-300",
    trendText: "text-slate-600 dark:text-slate-400",
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  color = "indigo",
  description,
  className,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card
        className={cn(
          "hover:shadow-md transition-all duration-200 w-full max-w-[280px]",
          className,
        )}
      >
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-3.5 w-10" />
          </div>
          {description && <Skeleton className="h-3 w-28 mt-1.5" />}
        </CardContent>
      </Card>
    );
  }

  const styles = colorVariants[color] || colorVariants.indigo;

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-200 w-full max-w-[280px]",
        className,
      )}
    >
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate pr-2"
            title={title}
          >
            {title}
          </span>
          {Icon && (
            <div
              className={cn(
                "p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-105",
                styles.iconBg,
                styles.iconText,
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
          {change && (
            <span
              className={cn(
                "text-[11px] font-semibold flex items-center gap-1 shrink-0",
                trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trend === "down"
                    ? "text-rose-600 dark:text-rose-400"
                    : styles.trendText,
              )}
            >
              {trend !== "neutral" && <TrendIcon className="w-3 h-3 inline" />}
              {change}
            </span>
          )}
        </div>

        {description && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export type StatsCardGroupProps = React.HTMLAttributes<HTMLDivElement>;

export const StatsCardGroup: React.FC<StatsCardGroupProps> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn("flex flex-wrap gap-2", className)} {...props}>
    {children}
  </div>
);

export type StatsCardComponent = React.FC<StatsCardProps> & {
  Group: React.FC<StatsCardGroupProps>;
};

(StatsCard as StatsCardComponent).Group = StatsCardGroup;
