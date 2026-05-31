package com.pm.analyticsservice.dto;

public record AnalyticsSummaryDTO(
        Long totalRevenueCents,
        String totalRevenueFormatted,
        Long totalPayments,
        Long averagePaymentCents,
        String averagePaymentFormatted,
        String topServiceType
) {}

