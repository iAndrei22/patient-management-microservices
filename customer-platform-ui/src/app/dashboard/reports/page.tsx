"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, CalendarRange, Filter, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsKpiCards } from "@/components/analytics/AnalyticsKpiCards";
import { PaymentsOverTimeChart } from "@/components/analytics/PaymentsOverTimeChart";
import { PaymentsVolumeChart } from "@/components/analytics/PaymentsVolumeChart";
import { RecentPaymentsTable } from "@/components/analytics/RecentPaymentsTable";
import { RevenueByServiceChart } from "@/components/analytics/RevenueByServiceChart";
import {
  fetchAnalyticsSummary,
  fetchPaymentsOverTime,
  fetchRecentPayments,
  fetchRevenueByService,
} from "@/lib/analytics";
import type {
  AnalyticsSummary,
  PaymentsOverTime,
  RecentPayment,
  RevenueByService,
} from "@/types/analytics";
import { useAuth } from "@/contexts/auth-context";

const DATE_RANGE_OPTIONS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "180D", days: 180 },
  { label: "1Y", days: 365 },
] as const;

const GRANULARITY_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
] as const;

const ALL_SERVICES = "all";

type Granularity = (typeof GRANULARITY_OPTIONS)[number]["value"];

function normalizeCurrency(value: string): string {
  return value.replace(/\$/g, "RON ");
}

export default function ReportsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [revenueByService, setRevenueByService] = useState<RevenueByService[]>([]);
  const [paymentsOverTime, setPaymentsOverTime] = useState<PaymentsOverTime[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [dateRangeDays, setDateRangeDays] = useState<(typeof DATE_RANGE_OPTIONS)[number]["days"]>(30);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [serviceType, setServiceType] = useState(ALL_SERVICES);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [summaryData, serviceData, timeData, recentData] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchRevenueByService(),
          fetchPaymentsOverTime(dateRangeDays, granularity),
          fetchRecentPayments(10),
        ]);
        if (!mounted) return;
        setSummary({
          ...summaryData,
          totalRevenueFormatted: normalizeCurrency(summaryData.totalRevenueFormatted),
          averagePaymentFormatted: summaryData.averagePaymentFormatted
            ? normalizeCurrency(summaryData.averagePaymentFormatted)
            : null,
        });
        setRevenueByService(
          serviceData.map((item) => ({
            ...item,
            amountFormatted: normalizeCurrency(item.amountFormatted),
          }))
        );
        setPaymentsOverTime(
          timeData.map((item) => ({
            ...item,
            totalAmountFormatted:
              normalizeCurrency(item.totalAmountFormatted),
          }))
        );
        setRecentPayments(
          recentData.map((item) => ({
            ...item,
            amountFormatted: normalizeCurrency(item.amountFormatted),
          }))
        );
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [dateRangeDays, granularity, refreshTick]);

  const hasData = useMemo(() => !!summary || revenueByService.length > 0 || paymentsOverTime.length > 0 || recentPayments.length > 0, [
    summary,
    revenueByService,
    paymentsOverTime,
    recentPayments,
  ]);

  const availableServiceTypes = useMemo(
    () =>
      Array.from(
        new Set([
          ...revenueByService.map((item) => item.serviceType),
          ...recentPayments.map((item) => item.serviceType),
        ])
      ).sort((left, right) => left.localeCompare(right)),
    [revenueByService, recentPayments]
  );

  const visibleRevenueByService = useMemo(
    () =>
      serviceType === ALL_SERVICES
        ? revenueByService
        : revenueByService.filter((item) => item.serviceType === serviceType),
    [revenueByService, serviceType]
  );

  const visibleRecentPayments = useMemo(
    () =>
      serviceType === ALL_SERVICES
        ? recentPayments
        : recentPayments.filter((item) => item.serviceType === serviceType),
    [recentPayments, serviceType]
  );

  const selectedRangeLabel = DATE_RANGE_OPTIONS.find((option) => option.days === dateRangeDays)?.label ?? `${dateRangeDays}D`;
  const selectedGranularityLabel = GRANULARITY_OPTIONS.find((option) => option.value === granularity)?.label ?? granularity;
  const selectedServiceLabel = serviceType === ALL_SERVICES ? "All services" : serviceType;
  const hasActiveFilters = dateRangeDays !== 30 || granularity !== "day" || serviceType !== ALL_SERVICES;

  const chartEmptyMessage =
    serviceType === ALL_SERVICES
      ? "No analytics data available for the selected date range."
      : `No analytics data for ${selectedServiceLabel}.`;

  const transactionsEmptyMessage =
    serviceType === ALL_SERVICES
      ? "No recent payments available for the selected date range."
      : `No recent payments found for ${selectedServiceLabel}.`;

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <BarChart3 className="size-3.5" />
              Financial Analytics Dashboard
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              High-visibility, read-only payment analytics powered by Kafka-persisted events.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Button>
            <Button variant="outline" onClick={logout} className="gap-2">
              <LogOut className="size-4" />
              Log out
            </Button>
            <Button variant="outline" onClick={() => setRefreshTick((tick) => tick + 1)} className="gap-2">
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </div>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="size-4 text-primary" />
              Report controls
            </CardTitle>
            <CardDescription>
              Tune the report period and chart granularity. Service filters keep the revenue breakdown and recent transactions focused without adding backend complexity.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarRange className="size-4 text-primary" />
                Date range
              </div>
              <div className="flex flex-wrap gap-2">
                {DATE_RANGE_OPTIONS.map((option) => (
                  <Button
                    key={option.days}
                    type="button"
                    variant={dateRangeDays === option.days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRangeDays(option.days)}
                    disabled={loading}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="size-4 text-primary" />
                Granularity
              </div>
              <div className="flex flex-wrap gap-2">
                {GRANULARITY_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={granularity === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGranularity(option.value)}
                    disabled={loading}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="service-filter" className="flex items-center gap-2 text-sm font-medium">
                <Filter className="size-4 text-primary" />
                Service type
              </label>
              <select
                id="service-filter"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                value={serviceType}
                onChange={(event) => setServiceType(event.target.value)}
                disabled={loading || availableServiceTypes.length === 0}
              >
                <option value={ALL_SERVICES}>All services</option>
                {availableServiceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border bg-background px-3 py-1">Range: {selectedRangeLabel}</span>
          <span className="rounded-full border bg-background px-3 py-1">Granularity: {selectedGranularityLabel}</span>
          <span className="rounded-full border bg-background px-3 py-1">Service: {selectedServiceLabel}</span>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateRangeDays(30);
                setGranularity("day");
                setServiceType(ALL_SERVICES);
              }}
              className="h-7"
            >
              Reset filters
            </Button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && !hasData ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-xl border bg-card" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-90 animate-pulse rounded-xl border bg-card" />
              <div className="h-90 animate-pulse rounded-xl border bg-card" />
              <div className="h-85 animate-pulse rounded-xl border bg-card lg:col-span-2" />
            </div>
            <div className="h-105 animate-pulse rounded-xl border bg-card" />
          </div>
        ) : (
          <div className="space-y-6">
            {summary && <AnalyticsKpiCards summary={summary} />}

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-2">
              <RevenueByServiceChart data={visibleRevenueByService} emptyMessage={chartEmptyMessage} />
              <PaymentsOverTimeChart data={paymentsOverTime} emptyMessage={chartEmptyMessage} />
            </div>

            <PaymentsVolumeChart data={paymentsOverTime} emptyMessage={chartEmptyMessage} />

            <RecentPaymentsTable data={visibleRecentPayments} emptyMessage={transactionsEmptyMessage} />
          </div>
        )}
      </div>
    </div>
  );
}

