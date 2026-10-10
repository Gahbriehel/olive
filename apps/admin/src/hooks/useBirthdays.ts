import { useQuery } from "@tanstack/react-query";
import { birthdayService } from "@/services/birthday.service";
import { BirthdayPersonItem, BirthdayStatusFilter } from "@/models/birthday";

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
