import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  emailService,
  type IBatchEmailPayload,
  type ISendBatchRegistrantsEmailPayload,
} from "@/services/email.service";

/** Sent emails show up in the Messaging Center delivery logs. */
function useInvalidateEmailLogs() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["email-logs"] });
}

/** Broadcast an email to selected people (Messaging Center). */
export function useSendBatchEmail() {
  const invalidateLogs = useInvalidateEmailLogs();
  return useMutation({
    meta: { successMessage: "Broadcast sent" },
    mutationFn: (payload: IBatchEmailPayload) =>
      emailService.sendBatchEmail(payload),
    onSuccess: () => invalidateLogs(),
  });
}

/** Email selected registrants, or all registrants matching a filter. */
export function useSendRegistrantsEmail() {
  const invalidateLogs = useInvalidateEmailLogs();
  return useMutation({
    meta: { successMessage: "Email sent to registrants" },
    mutationFn: (payload: ISendBatchRegistrantsEmailPayload) =>
      emailService.sendBatchRegistrantsEmail(payload),
    onSuccess: () => invalidateLogs(),
  });
}
