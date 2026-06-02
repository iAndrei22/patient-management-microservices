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
      gradient: "from-primary to-primary/40",
    },
    {
      label: "Transactions",
      value: String(summary.totalPayments),
      icon: Activity,
      note: "Total payment events persisted",
      gradient: "from-primary/70 to-accent",
    },
    {
      label: "Average Payment",
      value: summary.averagePaymentFormatted ?? "RON 0.00",
      icon: ArrowUpRight,
      note: "Average ticket size",
      gradient: "from-primary/60 to-accent/30",
    },
    {
      label: "Top Service",
      value: summary.topServiceType ?? "—",
      icon: Layers3,
      note: "Service type with highest revenue",
      gradient: "from-accent/40 to-primary/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, note, gradient }) => (
        <Card key={label} className="border-border/70 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden relative">
          {/* Gradient accent bar at top */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-accent/20">
              <Icon className="size-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter text-foreground">{value}</div>
            <p className="mt-2 text-xs text-muted-foreground">{note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

