package com.statify.backend.exception;

public class ReportTimeoutException extends RuntimeException {
    public ReportTimeoutException(String uploadId) {
        super(uploadId);
    }
}
