export interface IBaseResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
  statusCode?: number;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface IQueryParams {
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  eventId?: string;
  teamId?: string;
  membershipStatus?: string;
}

export function extractData<T>(resData: unknown): T {
  if (!resData || typeof resData !== "object") {
    return resData as T;
  }
  let current: unknown = resData;
  if (
    "data" in (current as Record<string, unknown>) &&
    (current as Record<string, unknown>).data !== null &&
    (current as Record<string, unknown>).data !== undefined
  ) {
    current = (current as Record<string, unknown>).data;
  }
  if (current && typeof current === "object" && !Array.isArray(current)) {
    const obj = current as Record<string, unknown>;
    if ("items" in obj && Array.isArray(obj.items)) {
      return obj.items as T;
    }
    if ("events" in obj && Array.isArray(obj.events)) {
      return obj.events as T;
    }
    if ("people" in obj && Array.isArray(obj.people)) {
      return obj.people as T;
    }
    if ("teams" in obj && Array.isArray(obj.teams)) {
      return obj.teams as T;
    }
    if ("registrations" in obj && Array.isArray(obj.registrations)) {
      return obj.registrations as T;
    }
    if ("games" in obj && Array.isArray(obj.games)) {
      return obj.games as T;
    }
  }
  return current as T;
}

export function extractArray<T>(resData: unknown): T[] {
  const extracted = extractData<T[]>(resData);
  if (Array.isArray(extracted)) {
    return extracted;
  }
  return [];
}
