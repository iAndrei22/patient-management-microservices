export interface AnalyticsSummary {
  totalRevenueCents: number;
  totalRevenueFormatted: string;
  totalPayments: number;
  averagePaymentCents: number | null;
  averagePaymentFormatted: string | null;
  topServiceType: string | null;
}

export interface RevenueByService {
  serviceType: string;
  amountCents: number;
  amountFormatted: string;
  percentage: number;
}

export interface PaymentsOverTime {
  periodLabel: string;
  periodIso: string;
  totalAmountCents: number;
  totalAmountFormatted: string;
  count: number;
}

export interface RecentPayment {
  id: number;
  customerId: string;
  amountCents: number;
  amountFormatted: string;
  serviceType: string;
  sessionId: string;
  eventTimestamp: string | null;
  receivedAt: string | null;
}

