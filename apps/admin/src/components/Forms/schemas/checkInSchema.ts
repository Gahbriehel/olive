import { yup, requiredText, optionalText } from "@/models/validation";
import { CHECK_IN_REASON_KEYS, type CheckInReason } from "@/models/checkIn";

export const immediateLogCheckInSchema = yup.object({
  reason: yup
    .mixed<CheckInReason>()
    .oneOf(CHECK_IN_REASON_KEYS, "Select a reason for the check-in")
    .required("Reason is required"),
  notes: requiredText("Notes").max(2000, "Notes cannot exceed 2000 characters"),
  outcome: requiredText("Outcome").max(
    2000,
    "Outcome cannot exceed 2000 characters",
  ),
});

export type ImmediateLogCheckInFormValues = yup.InferType<
  typeof immediateLogCheckInSchema
>;

export const scheduleCareCheckInSchema = yup.object({
  reason: yup
    .mixed<CheckInReason>()
    .oneOf(CHECK_IN_REASON_KEYS, "Select a reason for scheduled care")
    .required("Reason is required"),
  assignedToId: optionalText(),
  scheduledFor: optionalText(),
  notes: requiredText("Reason & instructions").max(
    2000,
    "Instructions cannot exceed 2000 characters",
  ),
});

export type ScheduleCareCheckInFormValues = yup.InferType<
  typeof scheduleCareCheckInSchema
>;

export const completeCheckInSchema = yup.object({
  outcome: requiredText("Outcome & resolution").max(
    2000,
    "Outcome cannot exceed 2000 characters",
  ),
});

export type CompleteCheckInFormValues = yup.InferType<
  typeof completeCheckInSchema
>;
