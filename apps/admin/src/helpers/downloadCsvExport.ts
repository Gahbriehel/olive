import { apiClient } from "@/utils/api-client";

function filenameFromContentDisposition(
  header: string | undefined,
  fallback: string,
): string {
  if (!header) return fallback;
  const match = header.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallback;
}

/**
 * Fetches a CSV export endpoint (via apiClient, so the auth header and
 * 401-refresh flow are reused) and triggers a client-side file download.
 * Errors are already toasted by apiClient's response interceptor.
 */
export async function downloadCsvExport(
  endpoint: string,
  params: Record<string, unknown> = {},
  fallbackFilename = "export.csv",
): Promise<boolean> {
  try {
    const res = await apiClient.get<Blob>(endpoint, {
      params,
      responseType: "blob",
    });

    const filename = filenameFromContentDisposition(
      res.headers?.["content-disposition"],
      fallbackFilename,
    );

    const objectUrl = URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    return false;
  }
}
