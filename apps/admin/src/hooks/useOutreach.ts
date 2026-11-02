import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { outreachService } from "@/services/outreach.service";
import {
  OutreachOpenPayload,
  OutreachPreviewRequest,
  OutreachQueryParams,
} from "@/models/outreach";
import { customToast } from "@/helpers/customToast";

export function useOutreachToday(limit: number = 20) {
  return useQuery({
    queryKey: ["outreach-today", limit],
    queryFn: () => outreachService.today(limit),
  });
}

export function useOutreachList(params?: OutreachQueryParams) {
  return useQuery({
    queryKey: ["outreach", params],
    queryFn: () => outreachService.list(params),
  });
}

export function usePersonMessages(
  personId: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: ["person-messages", personId, params],
    queryFn: () => outreachService.personMessages(personId, params),
    enabled: Boolean(personId),
  });
}

export function useOutreachPreview() {
  return useMutation({
    mutationFn: (payload: OutreachPreviewRequest) =>
      outreachService.preview(payload),
  });
}

export function useOpenOutreach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OutreachOpenPayload) => outreachService.open(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-today"] });
      queryClient.invalidateQueries({ queryKey: ["outreach"] });
    },
  });
}

export function useConfirmOutreach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      sent,
    }: {
      id: string;
      sent: boolean;
      personId?: string;
    }) => outreachService.confirm(id, sent),
    onSuccess: (data, variables) => {
      const personId = variables.personId || data.personId;

      // Invalidate outreach queries
      queryClient.invalidateQueries({ queryKey: ["outreach-today"] });
      queryClient.invalidateQueries({ queryKey: ["outreach"] });

      if (personId) {
        queryClient.invalidateQueries({
          queryKey: ["person-messages", personId],
        });
        queryClient.invalidateQueries({ queryKey: ["person", personId] });
      }

      // Invalidate birthdays and birthday analytics
      queryClient.invalidateQueries({ queryKey: ["birthdays"] });
      queryClient.invalidateQueries({ queryKey: ["birthdays-list"] });
      queryClient.invalidateQueries({ queryKey: ["birthday-analytics"] });

      // Invalidate check-ins queries
      queryClient.invalidateQueries({ queryKey: ["check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["check-ins-queue"] });
      queryClient.invalidateQueries({ queryKey: ["check-in-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
    onError: (err: unknown) => {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "Failed to update outreach confirmation status";
      customToast.error(msg);
    },
  });
}
