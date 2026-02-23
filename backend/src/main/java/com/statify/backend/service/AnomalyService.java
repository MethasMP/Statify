package com.statify.backend.service;

import com.statify.backend.entity.Anomaly;
import com.statify.backend.entity.Transaction;
import com.statify.backend.repository.AnomalyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnomalyService {

    private final AnomalyRepository anomalyRepository;

    // Default threshold from PRD
    private static final BigDecimal LARGE_AMOUNT_THRESHOLD = new BigDecimal("10000.00");

    @Transactional
    public void detectAnomalies(List<Transaction> transactions) {
        List<Anomaly> anomalies = new ArrayList<>();

        for (int i = 0; i < transactions.size(); i++) {
            Transaction txn = transactions.get(i);

            // 1. Large Amount Rule
            if (txn.getAmount().abs().compareTo(LARGE_AMOUNT_THRESHOLD) >= 0) {
                anomalies.add(createAnomaly(txn, "Large Amount", "MEDIUM",
                        "Transaction exceeds threshold of " + LARGE_AMOUNT_THRESHOLD));
            }

            // 2. Duplicate Rule (N^2 check limited to this batch for MVP)
            for (int j = i + 1; j < transactions.size(); j++) {
                Transaction other = transactions.get(j);
                if (txn.getDescription().equals(other.getDescription()) &&
                        txn.getAmount().equals(other.getAmount()) &&
                        txn.getTxnDate().equals(other.getTxnDate())) {

                    anomalies.add(createAnomaly(txn, "Duplicate", "HIGH",
                            "Potential duplicate with other transaction in this statement"));
                }
            }
        }

        anomalyRepository.saveAll(anomalies);
    }

    private Anomaly createAnomaly(Transaction txn, String rule, String severity, String detail) {
        Anomaly anomaly = new Anomaly();
        anomaly.setTransaction(txn);
        anomaly.setRuleName(rule);
        anomaly.setSeverity(severity);
        anomaly.setDetail(detail);
        return anomaly;
    }
}
