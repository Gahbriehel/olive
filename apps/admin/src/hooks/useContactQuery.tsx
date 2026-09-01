import { IQueryParams } from "@/models";
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
