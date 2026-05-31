package com.pm.analyticsservice.dto;

public record RecentPaymentDTO(
        Long id,
        String customerId,
        Long amountCents,
        String amountFormatted,
        String serviceType,
        String sessionId,
        String eventTimestamp,
        String receivedAt
) {}

