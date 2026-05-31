"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentPayment } from "@/types/analytics";

function formatTimestamp(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

export function RecentPaymentsTable({ data }: { data: RecentPayment[] }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="py-8 text-sm text-muted-foreground">
            No recent payments available.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Session ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {formatTimestamp(payment.eventTimestamp)}
                  </TableCell>
                  <TableCell className="font-medium">{payment.customerId}</TableCell>
                  <TableCell>{payment.amountFormatted}</TableCell>
                  <TableCell>{payment.serviceType}</TableCell>
                  <TableCell className="max-w-60 truncate font-mono text-xs">
                    {payment.sessionId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}



