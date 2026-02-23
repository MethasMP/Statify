package com.statify.backend.exception;

import lombok.Getter;

@Getter
public class PartialParseException extends RuntimeException {
    private final int processed;
    private final int total;

    public PartialParseException(int processed, int total) {
        super(String.format("Partial parse: %d/%d rows", processed, total));
        this.processed = processed;
        this.total = total;
    }
}
