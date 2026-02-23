package com.statify.backend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * PRD §6: No stack traces to users. Every error has:
 * - user-facing message (what happened)
 * - suggested action (what to do next)
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 413: File too large ────────────────────────────────────────────
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleSizeExceeded(MaxUploadSizeExceededException ex) {
        log.warn("Upload rejected: file exceeds 10MB limit");
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(error("FILE_TOO_LARGE",
                        "File exceeds the 10MB limit.",
                        "Please split the statement into smaller files and upload again."));
    }

    // ── 400: Unsupported file type ─────────────────────────────────────
    @ExceptionHandler(UnsupportedFileTypeException.class)
    public ResponseEntity<Map<String, Object>> handleUnsupportedType(UnsupportedFileTypeException ex) {
        log.warn("Upload rejected: unsupported file type — {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(error("UNSUPPORTED_FILE_TYPE",
                        ex.getMessage(),
                        "Please upload an Excel (.xlsx), PDF, or CSV file."));
    }

    // ── 422: Scanned / image-based PDF ────────────────────────────────
    @ExceptionHandler(ScannedPdfException.class)
    public ResponseEntity<Map<String, Object>> handleScannedPdf(ScannedPdfException ex) {
        log.warn("PDF rejected: appears to be image-based — {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(error("SCANNED_PDF_DETECTED",
                        "This PDF appears to be image-based and cannot be parsed.",
                        "Please upload a text-extractable PDF from your bank's online portal."));
    }

    // ── 206: Partial parse failure ────────────────────────────────────
    @ExceptionHandler(PartialParseException.class)
    public ResponseEntity<Map<String, Object>> handlePartialParse(PartialParseException ex) {
        log.warn("Partial parse: processed {}/{} rows", ex.getProcessed(), ex.getTotal());
        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .body(Map.of(
                        "code", "PARTIAL_PARSE",
                        "message", String.format("We processed %d of %d rows.", ex.getProcessed(), ex.getTotal()),
                        "action", "Partial results are shown below. Check your file for malformed rows.",
                        "processed", ex.getProcessed(),
                        "total", ex.getTotal(),
                        "timestamp", Instant.now().toString()));
    }

    // ── 404: Resource not found ────────────────────────────────────────
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(error("RESOURCE_NOT_FOUND",
                        "The requested resource could not be found.",
                        "Check the ID and try again."));
    }

    // ── 504: Report/export timeout ─────────────────────────────────────
    @ExceptionHandler(ReportTimeoutException.class)
    public ResponseEntity<Map<String, Object>> handleReportTimeout(ReportTimeoutException ex) {
        log.error("PDF report generation timed out for upload {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
                .body(error("REPORT_TIMEOUT",
                        "Report generation is taking longer than expected.",
                        "Please try again. If the problem persists, contact support."));
    }

    // ── 500: Generic fallback ──────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error("INTERNAL_ERROR",
                        "An unexpected error occurred. Our team has been notified.",
                        "Please try again in a few moments."));
    }

    // ── Helper ─────────────────────────────────────────────────────────
    private Map<String, Object> error(String code, String message, String action) {
        return Map.of(
                "code", code,
                "message", message,
                "action", action,
                "timestamp", Instant.now().toString());
    }
}
