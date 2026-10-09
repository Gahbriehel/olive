import { useQuery } from "@tanstack/react-query";
import { IQueryParams } from "@/models/base";
import { EmailLogItem } from "@/models/emailLog";
import { emailService } from "@/services/email.service";

const EMPTY_LOGS: EmailLogItem[] = [];

export function useEmailLogs(params?: IQueryParams) {
  const emailLogsQuery = useQuery({
    queryKey: ["email-logs", params],
    queryFn: () => emailService.getEmailLogs(params),
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    items: emailLogsQuery.data?.items || EMPTY_LOGS,
    meta: emailLogsQuery.data?.meta,
    isLoading: emailLogsQuery.isLoading,
    isFetching: emailLogsQuery.isFetching,
    isError: emailLogsQuery.isError,
    error: emailLogsQuery.error,
    refetch: emailLogsQuery.refetch,
  };
}
