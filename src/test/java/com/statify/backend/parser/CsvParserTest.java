package com.statify.backend.parser;

import org.junit.jupiter.api.Test;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CsvParserTest {

    private final CsvParser parser = new CsvParser();

    @Test
    void testParseKBankCSV() {
        String csvData = "Date,Description,Withdrawal,Deposit,Balance\n" +
                "23/02/2026,KFC,120.00,,5000.00\n" +
                "24/02/2026,Salary,,45000.00,50000.00";

        List<ParsedTransaction> txns = parser.parse(new ByteArrayInputStream(csvData.getBytes()));

        assertEquals(2, txns.size());
        assertEquals(LocalDate.of(2026, 2, 23), txns.get(0).date());
        assertEquals("KFC", txns.get(0).description());
        assertEquals(new BigDecimal("-120.00"), txns.get(0).amount());

        assertEquals(LocalDate.of(2026, 2, 24), txns.get(1).date());
        assertEquals("Salary", txns.get(1).description());
        assertEquals(new BigDecimal("45000.00"), txns.get(1).amount());
    }
}
