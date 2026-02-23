package com.statify.backend.controller;

import com.statify.backend.entity.Anomaly;
import com.statify.backend.repository.AnomalyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AnomalyController {

    private final AnomalyRepository anomalyRepository;

    /** GET /api/v1/uploads/:id/anomalies — list anomalies for an upload */
    @GetMapping("/uploads/{uploadId}/anomalies")
    public ResponseEntity<List<Anomaly>> listAnomalies(@PathVariable UUID uploadId) {
        return ResponseEntity.ok(anomalyRepository.findByUploadId(uploadId));
    }

    /** PATCH /api/v1/anomalies/:id/status — confirm or dismiss */
    @PatchMapping("/anomalies/{id}/status")
    public ResponseEntity<Anomaly> updateStatus(
            @PathVariable UUID id,
            @RequestParam String status) {

        if (!List.of("confirmed", "dismissed").contains(status)) {
            return ResponseEntity.badRequest().build();
        }

        return anomalyRepository.findById(id)
                .map(a -> {
                    a.setStatus(status);
                    a.setReviewedAt(OffsetDateTime.now());
                    return ResponseEntity.ok(anomalyRepository.save(a));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
