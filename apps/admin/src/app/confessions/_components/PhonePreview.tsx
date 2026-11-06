import React from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/helpers/cn";
import { toParagraphs } from "./confessionUtils";

interface Props {
  title: string;
  category?: string | null;
  scriptureRef?: string | null;
  body: string;
}

/** Roughly how the confession reads in the member app (~375px wide). */
export const PhonePreview: React.FC<Props> = ({
  title,
  category,
  scriptureRef,
  body,
}) => {
  const paragraphs = toParagraphs(body);

  return (
    <div
      aria-label="Phone preview"
      className="mx-auto w-full max-w-[375px] overflow-hidden rounded-[2rem] border-4 border-fg-subtle bg-surface shadow-lg"
    >
      <div className="max-h-[560px] space-y-4 overflow-y-auto p-5">
        {category && (
          <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-2xs font-semibold text-primary-text">
            {category}
          </span>
        )}
        <h3 className="text-xl font-bold leading-snug text-fg">
          {title.trim() || "Untitled confession"}
        </h3>
        {scriptureRef && (
          <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-fg-secondary">
            {scriptureRef}
          </span>
        )}

        <div className="flex items-center gap-3 rounded-xl bg-subtle p-3">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white"
          >
            <Play className="h-4 w-4" />
          </span>
          <div className="flex gap-1 text-2xs font-semibold" aria-hidden>
            {["Female", "Male"].map((v, i) => (
              <span
                key={v}
                className={cn(
                  "rounded-full px-2.5 py-1",
                  i === 0 ? "bg-primary text-white" : "bg-muted text-fg-muted",
                )}
              >
                {v}
              </span>
            ))}
          </div>
          <Pause aria-hidden className="ml-auto h-4 w-4 text-fg-subtle" />
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-fg-secondary">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))
          ) : (
            <p className="text-fg-subtle">The confession text appears here.</p>
          )}
        </div>
      </div>
    </div>
  );
};
