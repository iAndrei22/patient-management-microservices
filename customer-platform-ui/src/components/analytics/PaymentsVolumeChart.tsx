"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentsOverTime } from "@/types/analytics";

export function PaymentsVolumeChart({
  data,
  emptyMessage = "No payment data available yet.",
}: {
  data: PaymentsOverTime[];
  emptyMessage?: string;
}) {
  return (
    <Card className="border-border/60 shadow-md hover:shadow-lg transition-shadow ring-1 ring-border/40 overflow-hidden lg:col-span-2">
      <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/5 to-accent/5">
         <CardTitle className="font-bold">Payment Volume</CardTitle>
      </CardHeader>
      <CardContent className="h-85">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="periodLabel" tickMargin={8} minTickGap={18} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value: number, name: string) => [value, name]} />
              <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}



