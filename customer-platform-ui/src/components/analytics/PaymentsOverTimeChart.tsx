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

export function PaymentsOverTimeChart({ data }: { data: PaymentsOverTime[] }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Payments Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[360px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No time-series data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="periodLabel" tickMargin={8} minTickGap={16} />
              <YAxis />
              <Tooltip
                formatter={(value: unknown, name: unknown, props: { payload?: PaymentsOverTime }) => [
                  props.payload?.totalAmountFormatted ?? value,
                  `${name}`,
                ]}
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

