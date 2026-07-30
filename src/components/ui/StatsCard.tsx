import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { clsx } from "clsx";

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
}) => {
  const styles = colorVariants[color] || colorVariants.indigo;

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card
      className={clsx("hover:shadow-md transition-all duration-200", className)}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </span>
          {Icon && (
            <div
              className={clsx(
                "p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105",
                styles.iconBg,
                styles.iconText,
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
          {change && (
            <span
              className={clsx(
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
