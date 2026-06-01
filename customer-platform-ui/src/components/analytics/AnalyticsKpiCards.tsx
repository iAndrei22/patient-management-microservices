"use client";

import { ArrowUpRight, Activity, DollarSign, Layers3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSummary } from "@/types/analytics";

export function AnalyticsKpiCards({ summary }: { summary: AnalyticsSummary }) {
  const cards = [
    {
      label: "Total Revenue",
      value: summary.totalRevenueFormatted,
      icon: DollarSign,
      note: "All payments in the selected period",
    },
    {
      label: "Transactions",
      value: String(summary.totalPayments),
      icon: Activity,
      note: "Total payment events persisted",
    },
    {
      label: "Average Payment",
      value: summary.averagePaymentFormatted ?? "RON 0.00",
      icon: ArrowUpRight,
      note: "Average ticket size",
    },
    {
      label: "Top Service",
      value: summary.topServiceType ?? "—",
      icon: Layers3,
      note: "Service type with highest revenue",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, note }) => (
        <Card key={label} className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

