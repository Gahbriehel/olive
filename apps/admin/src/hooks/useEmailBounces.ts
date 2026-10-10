import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { emailBounceService } from "@/services/emailBounce.service";
import {
  EmailBounce,
  EmailBounceAnalyticsResponse,
} from "@/models/emailBounce";
import { IQueryParams } from "@/models/base";

const EMPTY_BOUNCES: EmailBounce[] = [];

interface BounceAnalyticsParams {
  year: number;
  /** null = whole year. */
  month: number | null;
  emailType?: IQueryParams["emailType"];
  recipientType?: IQueryParams["recipientType"];
}

/** Delivery/bounce KPIs and breakdowns for the bounces report. */
export function useEmailBounceAnalytics({
  year,
  month,
  emailType,
  recipientType,
}: BounceAnalyticsParams) {
  const query = useQuery<EmailBounceAnalyticsResponse>({
    queryKey: [
      "email-bounces-analytics",
      year,
      month,
      emailType,
      recipientType,
    ],
    queryFn: () =>
      emailBounceService.getBounceAnalytics({
        year,
        month: month || undefined,
        emailType,
        recipientType,
      }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    analytics: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Paginated bounce list. */
export function useEmailBounces(params: IQueryParams) {
  const query = useQuery({
    queryKey: ["email-bounces-list", params],
    queryFn: () => emailBounceService.getBounces(params),
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    bounces: query.data?.data ?? EMPTY_BOUNCES,
    response: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Invalidates both bounce domains (list + analytics). */
export function useInvalidateEmailBounces() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["email-bounces-list"] });
    queryClient.invalidateQueries({ queryKey: ["email-bounces-analytics"] });
  };
}

/** Marks a bounce as resolved and refreshes the bounce list + analytics. */
export function useResolveEmailBounce(options?: {
  onSuccess?: (updated: EmailBounce) => void;
  onError?: () => void;
}) {
  const invalidate = useInvalidateEmailBounces();
  return useMutation({
    mutationFn: (id: string) => emailBounceService.resolveBounce(id),
    onSuccess: (updated) => {
      invalidate();
      options?.onSuccess?.(updated);
    },
    onError: () => options?.onError?.(),
  });
}
