import { IQueryParams } from "@/models";
import { IContactResponse } from "@/models/contact";
import { apiClient } from "@/utils/api-client";

export type IContactSubmissionType = "prayer" | "inquiry";

export async function getContacts(
  params: IQueryParams,
  type: IContactSubmissionType,
): Promise<IContactResponse> {
  const response = await apiClient.get<IContactResponse>(
    `/contact/submissions`,
    { params: { ...params, type } },
  );
  return response.data;
}
