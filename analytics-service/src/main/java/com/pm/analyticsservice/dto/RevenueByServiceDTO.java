package com.pm.analyticsservice.dto;

public record RevenueByServiceDTO(
        String serviceType,
        Long amountCents,
        String amountFormatted,
        Double percentage
) {}

