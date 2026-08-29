import { apiClient } from "@/utils/api-client";
import { ICheckInPayload, IRegistrationResponse } from "@/models/registration";
import { IBaseResponse } from "@/models/base";

function extractData<T>(resData: IBaseResponse<T> | T): T {
  if (resData && typeof resData === "object" && "data" in resData) {
    return (resData as IBaseResponse<T>).data;
  }
  return resData as T;
}

export const attendanceService = {
  async checkInAttendee(
    payload: ICheckInPayload,
  ): Promise<IRegistrationResponse> {
    const res = await apiClient.post<
      IBaseResponse<IRegistrationResponse> | IRegistrationResponse
    >("/attendance/checkin", payload);
    return extractData(res.data);
  },

  async getEventAttendance(eventId: string): Promise<IRegistrationResponse[]> {
    const res = await apiClient.get<
      IBaseResponse<IRegistrationResponse[]> | IRegistrationResponse[]
    >(`/attendance/event/${eventId}`);
    return extractData(res.data) || [];
  },
};
