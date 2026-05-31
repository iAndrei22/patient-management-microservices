package com.pm.analyticsservice.service;

import com.pm.analyticsservice.dto.AnalyticsSummaryDTO;
import com.pm.analyticsservice.dto.PaymentsOverTimeDTO;
import com.pm.analyticsservice.dto.RecentPaymentDTO;
import com.pm.analyticsservice.dto.RevenueByServiceDTO;
import com.pm.analyticsservice.model.PaymentAnalytics;
import com.pm.analyticsservice.repository.PaymentAnalyticsRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {
    private static final DateTimeFormatter DAY_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter UTC_INSTANT_FORMATTER = DateTimeFormatter.ISO_INSTANT;
    private static final String DEFAULT_CURRENCY = "USD";

    private final PaymentAnalyticsRepository paymentAnalyticsRepository;

    public AnalyticsService(PaymentAnalyticsRepository paymentAnalyticsRepository) {
        this.paymentAnalyticsRepository = paymentAnalyticsRepository;
    }

    public AnalyticsSummaryDTO getSummary() {
        long totalRevenueCents = safeLong(paymentAnalyticsRepository.getTotalPaymentAmountNative());
        long totalPayments = safeLong(paymentAnalyticsRepository.getTotalPaymentCountNative());
        long averagePaymentCents = totalPayments > 0 ? totalRevenueCents / totalPayments : 0L;

        List<Object[]> byService = paymentAnalyticsRepository.getRevenueByServiceType();
        String topService = byService.isEmpty() ? null : String.valueOf(byService.get(0)[0]);

        return new AnalyticsSummaryDTO(
                totalRevenueCents,
                formatMoney(totalRevenueCents),
                totalPayments,
                averagePaymentCents,
                formatMoney(averagePaymentCents),
                topService
        );
    }

    public List<RevenueByServiceDTO> getRevenueByService() {
        List<Object[]> rows = paymentAnalyticsRepository.getRevenueByServiceType();
        long totalRevenue = rows.stream()
                .mapToLong(row -> safeLong(row[1]))
                .sum();

        List<RevenueByServiceDTO> response = new ArrayList<>();
        for (Object[] row : rows) {
            String serviceType = row[0] == null ? "Unknown" : String.valueOf(row[0]);
            long amount = safeLong(row[1]);
            double percentage = totalRevenue > 0
                    ? round((amount * 100.0) / totalRevenue, 1)
                    : 0.0;
            response.add(new RevenueByServiceDTO(
                    serviceType,
                    amount,
                    formatMoney(amount),
                    percentage
            ));
        }
        return response;
    }

    public List<PaymentsOverTimeDTO> getPaymentsOverTime(int days, String interval) {
        int safeDays = Math.max(1, days);
        String safeInterval = normalizeInterval(interval);
        Instant from = Instant.now().minusSeconds((long) safeDays * 24L * 60L * 60L);
        List<Object[]> rows = paymentAnalyticsRepository.getPaymentsOverTime(safeInterval, Timestamp.from(from));

        Map<String, PaymentsOverTimeDTO> result = new LinkedHashMap<>();
        for (Object[] row : rows) {
            Instant periodInstant = toInstant(row[0]);
            long amount = safeLong(row[1]);
            long count = safeLong(row[2]);
            String label = formatPeriodLabel(periodInstant, safeInterval);
            result.put(label, new PaymentsOverTimeDTO(
                    label,
                    periodInstant.toString(),
                    amount,
                    formatMoney(amount),
                    count
            ));
        }

        return new ArrayList<>(result.values());
    }

    public List<RecentPaymentDTO> getRecentPayments(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        List<PaymentAnalytics> payments = paymentAnalyticsRepository
                .findAllByOrderByEventTimestampDesc(PageRequest.of(0, safeLimit));

        return payments.stream()
                .map(this::toRecentPaymentDTO)
                .toList();
    }

    private RecentPaymentDTO toRecentPaymentDTO(PaymentAnalytics payment) {
        Instant eventInstant = payment.getEventTimestamp() == null
                ? null
                : Instant.ofEpochMilli(payment.getEventTimestamp());
        Instant receivedAt = payment.getReceivedAt();
        long amount = payment.getAmount() == null ? 0L : payment.getAmount();
        return new RecentPaymentDTO(
                payment.getId(),
                payment.getCustomerId(),
                amount,
                formatMoney(amount),
                payment.getServiceType(),
                payment.getSessionId(),
                eventInstant == null ? null : eventInstant.toString(),
                receivedAt == null ? null : receivedAt.toString()
        );
    }

    private static String normalizeInterval(String interval) {
        if (interval == null) return "day";
        String trimmed = interval.trim().toLowerCase(Locale.ROOT);
        return switch (trimmed) {
            case "hour", "week", "day" -> trimmed;
            default -> "day";
        };
    }

    private static String formatPeriodLabel(Instant instant, String interval) {
        LocalDateTime utc = LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
        return switch (interval) {
            case "hour" -> utc.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:00"));
            case "week" -> utc.toLocalDate().format(DAY_FORMATTER);
            default -> utc.toLocalDate().format(DAY_FORMATTER);
        };
    }

    private static Instant toInstant(Object value) {
        if (value instanceof Timestamp timestamp) {
            return timestamp.toInstant();
        }
        if (value instanceof java.util.Date date) {
            return date.toInstant();
        }
        if (value instanceof Instant instant) {
            return instant;
        }
        if (value != null) {
            return Timestamp.valueOf(value.toString()).toInstant();
        }
        return Instant.EPOCH;
    }

    private static String formatMoney(long amountCents) {
        NumberFormat format = NumberFormat.getCurrencyInstance(Locale.US);
        format.setCurrency(java.util.Currency.getInstance(DEFAULT_CURRENCY));
        return format.format(BigDecimal.valueOf(amountCents).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
    }

    private static long safeLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number number) return number.longValue();
        return Long.parseLong(value.toString());
    }

    private static double round(double value, int places) {
        BigDecimal decimal = BigDecimal.valueOf(value);
        return decimal.setScale(places, RoundingMode.HALF_UP).doubleValue();
    }
}

