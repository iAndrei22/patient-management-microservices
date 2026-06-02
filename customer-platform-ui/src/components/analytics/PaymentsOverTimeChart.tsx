"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentsOverTime } from "@/types/analytics";

export function PaymentsOverTimeChart({
  data,
  emptyMessage = "No time-series data yet.",
}: {
  data: PaymentsOverTime[];
  emptyMessage?: string;
}) {
  return (
    <Card className="border-border/60 shadow-md hover:shadow-lg transition-shadow ring-1 ring-border/40 overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/5 to-accent/5">
         <CardTitle className="font-bold">Payments Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-90">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="periodLabel" tickMargin={8} minTickGap={16} />
              <YAxis />
              <Tooltip
                formatter={(value: number | string, name: string) => [value, name]}
              />
              <Line
                type="monotone"
                dataKey="totalAmountCents"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

