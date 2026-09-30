import { IQueryParams } from "@/models";
import { extractMeta } from "@/models/base";
import { IContactResponse } from "@/models/contact";
import { getContacts, IContactSubmissionType } from "@/services/contact";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export function useContactQuery(
  params: IQueryParams,
  type: IContactSubmissionType,
): UseQueryResult<IContactResponse, Error> {
  return useQuery({
    queryKey: ["contact", params, type],
    queryFn: async () => await getContacts(params, type),
  });
}

export function useContactCounts() {
  const prayersQuery = useQuery({
    queryKey: ["contact", { limit: 1 }, "prayer"],
    queryFn: async () => await getContacts({ limit: 1 }, "prayer"),
    staleTime: 1000 * 60 * 2,
  });

  const inquiriesQuery = useQuery({
    queryKey: ["contact", { limit: 1 }, "inquiry"],
    queryFn: async () => await getContacts({ limit: 1 }, "inquiry"),
    staleTime: 1000 * 60 * 2,
  });

  const prayerMeta = extractMeta(prayersQuery.data) ?? prayersQuery.data?.meta;
  const inquiryMeta =
    extractMeta(inquiriesQuery.data) ?? inquiriesQuery.data?.meta;

  const prayerCount =
    prayerMeta?.total ?? prayersQuery.data?.data?.items?.length;
  const inquiryCount =
    inquiryMeta?.total ?? inquiriesQuery.data?.data?.items?.length;

  return {
    prayerCount,
    inquiryCount,
    isLoading: prayersQuery.isLoading || inquiriesQuery.isLoading,
    refetch: () => {
      prayersQuery.refetch();
      inquiriesQuery.refetch();
    },
  };
}
