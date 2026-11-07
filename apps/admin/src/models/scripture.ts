export type ScriptureKind = "WEEK" | "YEAR";
export type ScriptureStatus = "DRAFT" | "PUBLISHED";

export const SCRIPTURE_KINDS: ScriptureKind[] = ["WEEK", "YEAR"];

export const SCRIPTURE_KIND_LABEL: Record<ScriptureKind, string> = {
  WEEK: "This week",
  YEAR: "This year",
};

export interface Scripture {
  id: string;
  kind: ScriptureKind;
  /** Plain text. The UI adds the quotation marks. */
  text: string;
  /** e.g. "Exodus 33:19" */
  reference: string;
  translation: string | null;
  givenBy: string | null;
  /** "YYYY-MM-DD" in Africa/Lagos. */
  startsOn: string;
  status: ScriptureStatus;
  createdAt: string;
  updatedAt: string;
  /** True when this is the record the public /scriptures/current returns. */
  isCurrent: boolean;
}

export interface CreateScripturePayload {
  kind: ScriptureKind;
  text: string;
  reference: string;
  translation: string | null;
  givenBy: string | null;
  startsOn: string;
  status: ScriptureStatus;
}

/** `kind` is fixed once a scripture exists. */
export type UpdateScripturePayload = Partial<
  Omit<CreateScripturePayload, "kind">
>;
