"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsKpiCards } from "@/components/analytics/AnalyticsKpiCards";
import { PaymentsOverTimeChart } from "@/components/analytics/PaymentsOverTimeChart";
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

export default function ReportsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [revenueByService, setRevenueByService] = useState<RevenueByService[]>([]);
  const [paymentsOverTime, setPaymentsOverTime] = useState<PaymentsOverTime[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [summaryData, serviceData, timeData, recentData] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchRevenueByService(),
          fetchPaymentsOverTime(30, "day"),
          fetchRecentPayments(10),
        ]);
        if (!mounted) return;
        setSummary(summaryData);
        setRevenueByService(serviceData);
        setPaymentsOverTime(timeData);
        setRecentPayments(recentData);
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
  }, [refreshTick]);

  const hasData = useMemo(() => !!summary || revenueByService.length > 0 || paymentsOverTime.length > 0 || recentPayments.length > 0, [
    summary,
    revenueByService,
    paymentsOverTime,
    recentPayments,
  ]);

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
          <Button variant="outline" onClick={() => setRefreshTick((tick) => tick + 1)} className="gap-2">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && !hasData ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="h-28 animate-pulse rounded-xl bg-card" />
            <div className="h-28 animate-pulse rounded-xl bg-card" />
            <div className="h-28 animate-pulse rounded-xl bg-card" />
            <div className="h-28 animate-pulse rounded-xl bg-card" />
            <div className="h-[360px] animate-pulse rounded-xl bg-card md:col-span-2" />
            <div className="h-[360px] animate-pulse rounded-xl bg-card md:col-span-2" />
            <div className="h-[420px] animate-pulse rounded-xl bg-card md:col-span-2 xl:col-span-4" />
          </div>
        ) : (
          <div className="space-y-6">
            {summary && <AnalyticsKpiCards summary={summary} />}

            <div className="grid gap-6 md:grid-cols-2">
              <RevenueByServiceChart data={revenueByService} />
              <PaymentsOverTimeChart data={paymentsOverTime} />
            </div>

            <RecentPaymentsTable data={recentPayments} />
          </div>
        )}
      </div>
    </div>
  );
}

