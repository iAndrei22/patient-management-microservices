package com.pm.analyticsservice.controller;

import com.pm.analyticsservice.dto.AnalyticsSummaryDTO;
import com.pm.analyticsservice.dto.PaymentsOverTimeDTO;
import com.pm.analyticsservice.dto.RecentPaymentDTO;
import com.pm.analyticsservice.dto.RevenueByServiceDTO;
import com.pm.analyticsservice.service.AnalyticsService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDTO> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/revenue-by-service")
    public ResponseEntity<List<RevenueByServiceDTO>> getRevenueByService() {
        return ResponseEntity.ok(analyticsService.getRevenueByService());
    }

    @GetMapping("/payments-over-time")
    public ResponseEntity<List<PaymentsOverTimeDTO>> getPaymentsOverTime(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "day") String interval) {
        return ResponseEntity.ok(analyticsService.getPaymentsOverTime(days, interval));
    }

    @GetMapping("/recent-payments")
    public ResponseEntity<List<RecentPaymentDTO>> getRecentPayments(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getRecentPayments(limit));
    }
}


