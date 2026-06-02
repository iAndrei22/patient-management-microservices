"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenueByService } from "@/types/analytics";

const COLORS = ["#2563eb", "#14b8a6", "#f97316", "#8b5cf6", "#ef4444"];

export function RevenueByServiceChart({
  data,
  emptyMessage = "No payment data available yet.",
}: {
  data: RevenueByService[];
  emptyMessage?: string;
}) {
  return (
    <Card className="border-border/60 shadow-md hover:shadow-lg transition-shadow ring-1 ring-border/40 overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/5 to-accent/5">
         <CardTitle className="font-bold">Revenue by Service Type</CardTitle>
      </CardHeader>
      <CardContent className="h-90">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amountCents"
                nameKey="serviceType"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.serviceType} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
               <Tooltip
                 formatter={(value: unknown, name: unknown, props: any) => [
                   (props.payload as RevenueByService)?.amountFormatted ?? value,
                   (props.payload as RevenueByService)?.serviceType ?? name,
                 ]}
               />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

