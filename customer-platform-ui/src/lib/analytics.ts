import { apiFetch } from "@/lib/api";
import type {
  AnalyticsSummary,
  PaymentsOverTime,
  RecentPayment,
  RevenueByService,
} from "@/types/analytics";

const ANALYTICS_PATH = "/api/analytics";

async function readErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  } catch {
    // response body may not be JSON
  }
  return fallback;
}

async function fetchJson<T>(url: string, fallback: string): Promise<T> {
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallback));
  }
  return response.json() as Promise<T>;
}

export function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  return fetchJson(`${ANALYTICS_PATH}/summary`, "Failed to load analytics summary");
}

export function fetchRevenueByService(): Promise<RevenueByService[]> {
  return fetchJson(
    `${ANALYTICS_PATH}/revenue-by-service`,
    "Failed to load revenue by service"
  );
}

export function fetchPaymentsOverTime(
  days = 30,
  interval = "day"
): Promise<PaymentsOverTime[]> {
  const params = new URLSearchParams({ days: String(days), interval });
  return fetchJson(
    `${ANALYTICS_PATH}/payments-over-time?${params.toString()}`,
    "Failed to load payments over time"
  );
}

export function fetchRecentPayments(limit = 10): Promise<RecentPayment[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  return fetchJson(
    `${ANALYTICS_PATH}/recent-payments?${params.toString()}`,
    "Failed to load recent payments"
  );
}

