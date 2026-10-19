import { yup, optionalText } from "@/models/validation";
import type { FollowUpStatus } from "@/models/person";

export const FOLLOW_UP_STATUSES: FollowUpStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "CONVERTED",
  "INACTIVE",
];

export const followUpSchema = yup.object({
  followUpStatus: yup
    .mixed<FollowUpStatus>()
    .oneOf(FOLLOW_UP_STATUSES, "Select a follow-up status")
    .required("Follow-up status is required"),
  followUpNotes: optionalText().max(1000, "Max 1000 characters"),
  lastFollowUpAt: optionalText(),
});

export type FollowUpFormValues = yup.InferType<typeof followUpSchema>;
