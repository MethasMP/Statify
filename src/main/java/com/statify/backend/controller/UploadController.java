package com.statify.backend.controller;

import com.statify.backend.entity.Transaction;
import com.statify.backend.entity.Upload;
import com.statify.backend.exception.UnsupportedFileTypeException;
import com.statify.backend.repository.AnomalyRepository;
import com.statify.backend.repository.TransactionRepository;
import com.statify.backend.repository.UploadRepository;
import com.statify.backend.service.ReportService;
import com.statify.backend.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;
    private final UploadRepository uploadRepository;
    private final TransactionRepository transactionRepository;
    private final AnomalyRepository anomalyRepository;
    private final ReportService reportService;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("xlsx", "xls", "pdf", "csv");
    private static final long MAX_SIZE_BYTES = 10L * 1024 * 1024; // 10 MB

    /** POST /api/v1/uploads */
    @PostMapping
    public ResponseEntity<Upload> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        // File type validation
        String ext = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new UnsupportedFileTypeException(ext);
        }
        // Size validation
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new org.springframework.web.multipart.MaxUploadSizeExceededException(MAX_SIZE_BYTES);
        }

        Upload upload = uploadService.initiateUpload(file);
        uploadService.processUpload(upload.getId(), file);
        return ResponseEntity.accepted().body(upload);
    }

    /** GET /api/v1/uploads/:id */
    @GetMapping("/{id}")
    public ResponseEntity<Upload> getUploadStatus(@PathVariable UUID id) {
        return uploadRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/v1/uploads/:id/preview — first 10 rows */
    @GetMapping("/{id}/preview")
    public ResponseEntity<List<Transaction>> getPreview(@PathVariable UUID id) {
        List<Transaction> all = transactionRepository.findByUploadIdOrderByTxnDate(id);
        return ResponseEntity.ok(all.stream().limit(10).collect(Collectors.toList()));
    }

    /** GET /api/v1/uploads/:id/transactions — with optional filters */
    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(
            @PathVariable UUID id,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String keyword) {

        List<Transaction> txns = transactionRepository.findByUploadIdOrderByTxnDate(id);

        if (categoryId != null) {
            txns = txns.stream().filter(t -> Objects.equals(t.getCategoryId(), categoryId))
                    .collect(Collectors.toList());
        }
        if (keyword != null && !keyword.isBlank()) {
            String lower = keyword.toLowerCase();
            txns = txns.stream()
                    .filter(t -> t.getDescription().toLowerCase().contains(lower))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(txns);
    }

    /** GET /api/v1/uploads/:id/summary — dashboard cards */
    @GetMapping("/{id}/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@PathVariable UUID id) {
        List<Transaction> txns = transactionRepository.findByUploadIdOrderByTxnDate(id);
        long anomalyCount = anomalyRepository.findByUploadId(id).size();

        BigDecimal totalIncome = txns.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = txns.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) < 0)
                .map(t -> t.getAmount().abs())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal net = totalIncome.subtract(totalExpense);

        // Category breakdown for donut chart
        Map<Integer, BigDecimal> byCategory = txns.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) < 0 && t.getCategoryId() != null)
                .collect(Collectors.groupingBy(
                        Transaction::getCategoryId,
                        Collectors.reducing(BigDecimal.ZERO, t -> t.getAmount().abs(), BigDecimal::add)));

        return ResponseEntity.ok(Map.of(
                "totalIncome", totalIncome,
                "totalExpense", totalExpense,
                "netBalance", net,
                "anomalyCount", anomalyCount,
                "txnCount", txns.size(),
                "byCategory", byCategory));
    }

    /** PATCH /api/v1/transactions/:txnId/category */
    @PatchMapping("/transactions/{txnId}/category")
    public ResponseEntity<Transaction> overrideCategory(
            @PathVariable UUID txnId,
            @RequestParam Integer categoryId) {
        return transactionRepository.findById(txnId)
                .map(txn -> {
                    txn.setCategoryId(categoryId);
                    txn.setOverride(true);
                    return ResponseEntity.ok(transactionRepository.save(txn));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> getReport(@PathVariable UUID id) {
        try {
            byte[] pdfBytes = reportService.generatePdfReport(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report-" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains("."))
            return "";
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
