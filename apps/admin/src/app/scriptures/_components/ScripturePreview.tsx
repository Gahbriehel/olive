import React from "react";

interface Props {
  text: string;
  reference: string;
  translation?: string | null;
  givenBy?: string | null;
}

/** Roughly how the scripture card reads at the top of the member app home. */
export const ScripturePreview: React.FC<Props> = ({
  text,
  reference,
  translation,
  givenBy,
}) => {
  const ref = reference.trim();
  const trans = translation?.trim();
  const giver = givenBy?.trim();

  return (
    <figure
      aria-label="Scripture preview"
      className="rounded-2xl border border-border bg-subtle p-5"
    >
      <blockquote className="whitespace-pre-line font-serif text-base italic leading-relaxed text-fg">
        {text.trim() ? `“${text.trim()}”` : "Your scripture appears here."}
      </blockquote>
      <figcaption className="mt-3 space-y-0.5">
        <p className="text-xs font-semibold text-primary-text">
          {ref || "Reference"}
          {trans ? ` (${trans})` : ""}
        </p>
        {giver && <p className="text-xs text-fg-muted">{giver}</p>}
      </figcaption>
    </figure>
  );
};
