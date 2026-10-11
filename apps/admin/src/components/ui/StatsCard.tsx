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
    iconBg: "bg-primary-soft",
    iconText: "text-primary-text",
    trendText: "text-primary-text",
  },
  emerald: {
    iconBg: "bg-success-soft",
    iconText: "text-success-text",
    trendText: "text-success-text",
  },
  amber: {
    iconBg: "bg-warning-soft",
    iconText: "text-warning-text",
    trendText: "text-warning-text",
  },
  rose: {
    iconBg: "bg-danger-soft",
    iconText: "text-danger-text",
    trendText: "text-danger-text",
  },
  cyan: {
    iconBg: "bg-info-soft",
    iconText: "text-info-text",
    trendText: "text-info-text",
  },
  /* eslint-disable no-restricted-syntax -- categorical colours with no semantic token */
  purple: {
    iconBg: "bg-purple-50 dark:bg-purple-950/60",
    iconText: "text-purple-600 dark:text-purple-400",
    trendText: "text-purple-600 dark:text-purple-400",
  },
  /* eslint-enable no-restricted-syntax */
  slate: {
    iconBg: "bg-muted",
    iconText: "text-fg-secondary",
    trendText: "text-fg-secondary",
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
  const styles = colorVariants[color] || colorVariants.indigo;

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card
      className={cn(
        "min-w-0 hover:shadow-md transition-all duration-200",
        className,
      )}
    >
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex items-center gap-2 min-w-0">
          {Icon &&
            (loading ? (
              <Skeleton className="h-6 w-6 rounded-md shrink-0" />
            ) : (
              <div
                className={cn(
                  "p-1 rounded-md shrink-0",
                  styles.iconBg,
                  styles.iconText,
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            ))}
          <span
            className="text-xs font-semibold text-fg-muted truncate"
            title={title}
          >
            {title}
          </span>
        </div>

        {loading ? (
          <Skeleton className="h-7 w-24 mt-2" />
        ) : (
          <h3
            className="mt-1.5 truncate text-lg lg:text-xl font-bold text-fg tabular-nums tracking-tight"
            title={String(value)}
          >
            {value}
          </h3>
        )}

        {change &&
          (loading ? (
            <Skeleton className="h-3 w-20 mt-1.5" />
          ) : (
            <p
              className={cn(
                "mt-0.5 flex items-center gap-1 min-w-0 text-2xs font-semibold",
                trend === "up"
                  ? "text-success-text"
                  : trend === "down"
                    ? "text-danger-text"
                    : styles.trendText,
              )}
              title={change}
            >
              {trend !== "neutral" && (
                <TrendIcon className="w-3 h-3 shrink-0" />
              )}
              <span className="truncate">{change}</span>
            </p>
          ))}

        {description &&
          (loading ? (
            <Skeleton className="h-3 w-28 mt-1.5" />
          ) : (
            <p
              className="mt-0.5 truncate text-2xs text-fg-subtle"
              title={description}
            >
              {description}
            </p>
          ))}
      </CardContent>
    </Card>
  );
};

export type StatsCardGroupProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Horizontal, snap-scrolling strip of fixed-width cards. On narrow screens
 * the partially visible last card signals that the row can be swiped.
 */
export const StatsCardGroup: React.FC<StatsCardGroupProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "-mx-1 flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-1 pb-2",
      "[&>*]:w-56 [&>*]:shrink-0 [&>*]:snap-start",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export type StatsCardComponent = React.FC<StatsCardProps> & {
  Group: React.FC<StatsCardGroupProps>;
};

(StatsCard as StatsCardComponent).Group = StatsCardGroup;
