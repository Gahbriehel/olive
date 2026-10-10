import { isAxiosError } from "axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { birthdayService } from "@/services/birthday.service";
import {
  BirthdayPersonItem,
  BirthdayStatusFilter,
  SendBirthdayGreetingPayload,
} from "@/models/birthday";

const EMPTY_BIRTHDAYS: BirthdayPersonItem[] = [];

interface BirthdayCycle {
  year: number;
  /** null = whole year. */
  month: number | null;
}

/** KPI + 12-month breakdown for the birthday outreach report. */
export function useBirthdayAnalytics({ year, month }: BirthdayCycle) {
  const query = useQuery({
    queryKey: ["birthday-analytics", year, month],
    queryFn: () =>
      birthdayService.getBirthdayAnalytics({
        year,
        month: month || undefined,
      }),
  });

  return {
    analytics: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

interface BirthdayListParams extends BirthdayCycle {
  status: BirthdayStatusFilter;
  search: string;
  page: number;
  limit: number;
}

/** Paginated birthday directory for a year/month cycle. */
export function useBirthdays({
  year,
  month,
  status,
  search,
  page,
  limit,
}: BirthdayListParams) {
  const query = useQuery({
    queryKey: ["birthdays-list", year, month, status, search, page, limit],
    queryFn: () =>
      birthdayService.getBirthdays({
        year,
        month: month || undefined,
        status: status === BirthdayStatusFilter.ALL ? undefined : status,
        search: search.trim() || undefined,
        page,
        limit,
      }),
  });

  return {
    birthdays: query.data?.data ?? EMPTY_BIRTHDAYS,
    meta: {
      total: query.data?.total ?? 0,
      page: query.data?.page ?? 1,
      limit: query.data?.limit ?? limit,
      totalPages: query.data?.totalPages ?? 1,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

function invalidateBirthdayQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    queryClient.invalidateQueries({ queryKey: ["birthdays-list"] }),
    queryClient.invalidateQueries({ queryKey: ["birthday-analytics"] }),
  ]);
}

/** Sends a birthday greeting email and refreshes dashboard/report data. */
export function useSendBirthdayGreeting() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Birthday greeting sent" },
    mutationFn: (payload: SendBirthdayGreetingPayload) =>
      birthdayService.sendBirthdayGreeting(payload),
    onSuccess: () => invalidateBirthdayQueries(queryClient),
    onError: (error) => {
      // 409: already greeted / concurrent send. Refresh so the UI catches up.
      if (isAxiosError(error) && error.response?.status === 409) {
        void invalidateBirthdayQueries(queryClient);
      }
    },
  });
}
