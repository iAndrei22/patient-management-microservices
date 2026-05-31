package com.pm.analyticsservice.repository;

import com.pm.analyticsservice.model.PaymentAnalytics;
import java.sql.Timestamp;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentAnalyticsRepository extends JpaRepository<PaymentAnalytics, Long> {
    boolean existsBySessionId(String sessionId);

    @Query("SELECT SUM(p.amount) FROM PaymentAnalytics p")
    Long getTotalPaymentAmount();

    @Query("SELECT COUNT(p) FROM PaymentAnalytics p")
    Long getTotalPaymentCount();

    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM payment_analytics", nativeQuery = true)
    Long getTotalPaymentAmountNative();

    @Query(value = "SELECT COALESCE(COUNT(*), 0) FROM payment_analytics", nativeQuery = true)
    Long getTotalPaymentCountNative();

    @Query(value = """
            SELECT service_type, COALESCE(SUM(amount), 0) AS total_amount
            FROM payment_analytics
            GROUP BY service_type
            ORDER BY total_amount DESC, service_type ASC
            """, nativeQuery = true)
    List<Object[]> getRevenueByServiceType();

    @Query(value = """
            SELECT date_trunc(:interval, to_timestamp(event_timestamp / 1000.0)) AS period,
                   COALESCE(SUM(amount), 0) AS total_amount,
                   COUNT(*) AS payment_count
            FROM payment_analytics
            WHERE to_timestamp(event_timestamp / 1000.0) >= :fromTs
            GROUP BY period
            ORDER BY period ASC
            """, nativeQuery = true)
    List<Object[]> getPaymentsOverTime(@Param("interval") String interval, @Param("fromTs") Timestamp fromTs);

    List<PaymentAnalytics> findAllByOrderByEventTimestampDesc(Pageable pageable);
}
