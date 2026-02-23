package com.statify.backend.service;

import com.statify.backend.entity.Anomaly;
import com.statify.backend.entity.Transaction;
import com.statify.backend.repository.AnomalyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * TDD tests for AnomalyService — three detection rules from PRD US-005/006/007.
 * Tests are written against the PUBLIC CONTRACT (rules), not the
 * implementation.
 */
@ExtendWith(MockitoExtension.class)
class AnomalyServiceTest {

    @Mock
    private AnomalyRepository anomalyRepository;

    @InjectMocks
    private AnomalyService service;

    private Transaction txn(String desc, double amount, LocalDate date) {
        Transaction t = new Transaction();
        t.setDescription(desc);
        t.setAmount(new BigDecimal(String.valueOf(amount)));
        t.setTxnDate(date);
        t.setCurrency("THB");
        return t;
    }

    @SuppressWarnings("unchecked")
    private List<Anomaly> captureAnomalies() {
        ArgumentCaptor<List<Anomaly>> captor = ArgumentCaptor.forClass(List.class);
        verify(anomalyRepository).saveAll(captor.capture());
        return captor.getValue();
    }

    // ── Large Amount Rule (US-006) ──────────────────────────────────────
    @Test
    @DisplayName("flags transaction >= 10,000 THB as MEDIUM severity")
    void flags_large_amount() {
        service.detectAnomalies(List.of(txn("Big Purchase", -10000.00, LocalDate.now())));

        List<Anomaly> anomalies = captureAnomalies();
        assertEquals(1, anomalies.size());
        assertEquals("Large Amount", anomalies.get(0).getRuleName());
        assertEquals("MEDIUM", anomalies.get(0).getSeverity());
    }

    @Test
    @DisplayName("does not flag transaction < 10,000 THB")
    void no_flag_for_normal_amount() {
        service.detectAnomalies(List.of(txn("Coffee", -120.00, LocalDate.now())));

        List<Anomaly> anomalies = captureAnomalies();
        assertTrue(anomalies.isEmpty(), "Small transaction must not generate anomaly");
    }

    @Test
    @DisplayName("flags positive credit >= 10,000 THB (absolute value check)")
    void flags_large_credit() {
        service.detectAnomalies(List.of(txn("Salary", 50000.00, LocalDate.now())));

        List<Anomaly> anomalies = captureAnomalies();
        assertEquals(1, anomalies.size());
        assertEquals("Large Amount", anomalies.get(0).getRuleName());
    }

    // ── Duplicate Rule (US-005) ─────────────────────────────────────────
    @Test
    @DisplayName("detects duplicate: same description + amount + date = HIGH severity")
    void detects_exact_duplicate() {
        LocalDate today = LocalDate.now();
        List<Transaction> txns = List.of(
                txn("KFC Purchase", -120.00, today),
                txn("KFC Purchase", -120.00, today));

        service.detectAnomalies(txns);

        List<Anomaly> anomalies = captureAnomalies();
        assertTrue(
                anomalies.stream().anyMatch(a -> a.getRuleName().equals("Duplicate") && a.getSeverity().equals("HIGH")),
                "Expected at least one HIGH duplicate anomaly");
    }

    @Test
    @DisplayName("does NOT flag same description + different amount as duplicate")
    void no_duplicate_for_different_amount() {
        LocalDate today = LocalDate.now();
        List<Transaction> txns = List.of(
                txn("GRAB", -80.00, today),
                txn("GRAB", -90.00, today) // different amount
        );

        service.detectAnomalies(txns);

        List<Anomaly> anomalies = captureAnomalies();
        long duplicateCount = anomalies.stream()
                .filter(a -> a.getRuleName().equals("Duplicate"))
                .count();
        assertEquals(0, duplicateCount);
    }

    @Test
    @DisplayName("does NOT flag same description + same amount + different date as duplicate")
    void no_duplicate_for_different_date() {
        List<Transaction> txns = List.of(
                txn("Netflix", -379.00, LocalDate.of(2026, 1, 1)),
                txn("Netflix", -379.00, LocalDate.of(2026, 2, 1)) // next month = legitimate recurring
        );

        service.detectAnomalies(txns);

        List<Anomaly> anomalies = captureAnomalies();
        long duplicateCount = anomalies.stream()
                .filter(a -> a.getRuleName().equals("Duplicate"))
                .count();
        assertEquals(0, duplicateCount, "Monthly recurring payment must NOT be flagged as duplicate");
    }

    // ── Empty / Edge cases ──────────────────────────────────────────────
    @Test
    @DisplayName("handles empty list without throwing")
    void handles_empty_list() {
        assertDoesNotThrow(() -> service.detectAnomalies(List.of()));
    }

    @Test
    @DisplayName("handles single transaction — no duplicate possible")
    void no_duplicate_from_single_transaction() {
        service.detectAnomalies(List.of(txn("Solo", -200.00, LocalDate.now())));

        List<Anomaly> anomalies = captureAnomalies();
        long duplicateCount = anomalies.stream()
                .filter(a -> a.getRuleName().equals("Duplicate"))
                .count();
        assertEquals(0, duplicateCount);
    }
}
