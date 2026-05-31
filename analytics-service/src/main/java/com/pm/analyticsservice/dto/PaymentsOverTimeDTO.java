package com.pm.analyticsservice.dto;

public record PaymentsOverTimeDTO(
        String periodLabel,
        String periodIso,
        Long totalAmountCents,
        String totalAmountFormatted,
        Long count
) {}

