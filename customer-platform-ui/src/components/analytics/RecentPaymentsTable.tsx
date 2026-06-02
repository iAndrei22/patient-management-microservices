"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type SortKey = "eventTimestamp" | "amountCents";

export function RecentPaymentsTable({
  data,
  emptyMessage = "No recent payments available.",
}: {
  data: RecentPayment[];
  emptyMessage?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("eventTimestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  const visibleData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? data.filter((payment) =>
          [payment.customerId, payment.sessionId, payment.serviceType].some((value) =>
            value.toLowerCase().includes(term)
          )
        )
      : data;

    return [...filtered].sort((left, right) => {
      const leftValue = sortKey === "amountCents"
        ? left.amountCents
        : new Date(left.eventTimestamp ?? 0).getTime();
      const rightValue = sortKey === "amountCents"
        ? right.amountCents
        : new Date(right.eventTimestamp ?? 0).getTime();
      return sortDirection === "asc" ? leftValue - rightValue : rightValue - leftValue;
    });
  }, [data, searchTerm, sortDirection, sortKey]);

  async function handleCopySessionId(sessionId: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopiedSessionId(sessionId);
      window.setTimeout(() => setCopiedSessionId((current) => (current === sessionId ? null : current)), 1400);
    } catch {
      setCopiedSessionId(null);
    }
  }

  function toggleSort(nextKey: SortKey): void {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection(nextKey === "amountCents" ? "desc" : "desc");
  }

  return (
    <Card className="border-border/60 shadow-md hover:shadow-lg transition-shadow ring-1 ring-border/40 overflow-hidden">
      <CardHeader className="gap-4 border-b border-border/40 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="font-bold">Recent Transactions</CardTitle>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search customer, service, or session ID"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border bg-background px-3 py-1">{visibleData.length} results</span>
            <span className="rounded-full border bg-background px-3 py-1">Sorted by {sortKey === "amountCents" ? "amount" : "date"} {sortDirection}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {visibleData.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-accent/10 py-10 text-center text-sm text-muted-foreground">
            {searchTerm.trim() ? "No transactions match your search." : emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 hover:bg-gradient-to-r hover:from-primary/8 hover:to-accent/8">
                <TableHead>
                  <button type="button" className="inline-flex items-center gap-1 font-medium" onClick={() => toggleSort("eventTimestamp")}>
                    Date
                    {sortKey === "eventTimestamp" ? (
                      sortDirection === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
                    ) : (
                      <ArrowUpDown className="size-3.5 text-muted-foreground" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>
                  <button type="button" className="inline-flex items-center gap-1 font-medium" onClick={() => toggleSort("amountCents")}>
                    Amount (RON)
                    {sortKey === "amountCents" ? (
                      sortDirection === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
                    ) : (
                      <ArrowUpDown className="size-3.5 text-muted-foreground" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Session ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleData.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {formatTimestamp(payment.eventTimestamp)}
                  </TableCell>
                  <TableCell className="font-medium">{payment.customerId}</TableCell>
                  <TableCell>{payment.amountFormatted}</TableCell>
                  <TableCell>{payment.serviceType}</TableCell>
                  <TableCell className="max-w-60">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-mono text-xs">{payment.sessionId}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => void handleCopySessionId(payment.sessionId)}
                        aria-label={`Copy session id ${payment.sessionId}`}
                      >
                        {copiedSessionId === payment.sessionId ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>
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
