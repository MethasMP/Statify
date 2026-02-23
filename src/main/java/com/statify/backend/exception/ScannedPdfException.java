package com.statify.backend.exception;

public class ScannedPdfException extends RuntimeException {
    public ScannedPdfException(String filename) {
        super("PDF appears image-based: " + filename);
    }
}
