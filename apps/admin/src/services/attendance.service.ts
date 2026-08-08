import { apiClient } from "@/utils/api-client";
import { ICheckInPayload, IApiRegistration } from "@/models/registration";
import { IBaseResponse } from "@/models/base";

function extractData<T>(resData: IBaseResponse<T> | T): T {
  if (resData && typeof resData === "object" && "data" in resData) {
    return (resData as IBaseResponse<T>).data;
  }
  return resData as T;
}

export const attendanceService = {
  async checkInAttendee(payload: ICheckInPayload): Promise<IApiRegistration> {
    const res = await apiClient.post<
      IBaseResponse<IApiRegistration> | IApiRegistration
    >("/attendance/checkin", payload);
    return extractData(res.data);
  },

  async getEventAttendance(eventId: string): Promise<IApiRegistration[]> {
    const res = await apiClient.get<
      IBaseResponse<IApiRegistration[]> | IApiRegistration[]
    >(`/attendance/event/${eventId}`);
    return extractData(res.data) || [];
  },
};
