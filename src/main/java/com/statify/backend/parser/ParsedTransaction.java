package com.statify.backend.parser;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ParsedTransaction(
        LocalDate date,
        String description,
        BigDecimal amount,
        String currency) {
}
