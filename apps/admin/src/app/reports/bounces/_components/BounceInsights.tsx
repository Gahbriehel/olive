import { Globe, Tag } from "lucide-react";
import type { ReactNode } from "react";
import { EmailBounceAnalyticsResponse } from "@/models/emailBounce";

const chipClass =
  "inline-flex items-center gap-1 text-2xs font-medium px-2 py-0.5 rounded-lg bg-muted text-fg-secondary border border-border-control";

function InsightCard({
  icon,
  title,
  caption,
  children,
}: {
  icon: ReactNode;
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <div className="p-3.5 rounded-2xl bg-surface/90 border border-border shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-fg-secondary flex items-center gap-1.5">
          {icon}
          {title}
        </span>
        <span className="text-2xs text-fg-muted">{caption}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

/** Top failing domains and failures by email type. Renders nothing when empty. */
export function BounceInsights({
  analytics,
}: {
  analytics?: EmailBounceAnalyticsResponse | null;
}) {
  if (
    !analytics ||
    !(
      analytics.topFailingDomains?.length > 0 ||
      analytics.byEmailType?.length > 0
    )
  ) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {analytics.topFailingDomains?.length > 0 && (
        <InsightCard
          icon={<Globe className="w-3.5 h-3.5 text-primary-text" />}
          title="Top Failing Domains"
          caption="High bounce rate clusters"
        >
          {analytics.topFailingDomains.map((dom) => (
            <span key={dom.domain} className={`${chipClass} font-mono`}>
              @{dom.domain}
              <span className="text-danger-text font-bold">({dom.count})</span>
            </span>
          ))}
        </InsightCard>
      )}

      {analytics.byEmailType?.length > 0 && (
        <InsightCard
          icon={<Tag className="w-3.5 h-3.5 text-info-text" />}
          title="Failures by Email Type"
          caption="Distribution by campaign"
        >
          {analytics.byEmailType.map((em) => (
            <span key={em.category} className={chipClass}>
              {em.category}
              <span className="text-primary-text font-bold">
                {em.percentage}%
              </span>
            </span>
          ))}
        </InsightCard>
      )}
    </div>
  );
}
