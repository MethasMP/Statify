package com.statify.backend.exception;

public class UnsupportedFileTypeException extends RuntimeException {
    public UnsupportedFileTypeException(String extension) {
        super("File type '." + extension + "' is not supported. Accepted: .xlsx, .xls, .pdf, .csv");
    }
}
