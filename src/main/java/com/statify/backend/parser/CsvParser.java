package com.statify.backend.parser;

import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class CsvParser implements FileParser {

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public boolean supports(String fileExtension) {
        return "csv".equalsIgnoreCase(fileExtension);
    }

    @Override
    public List<ParsedTransaction> parse(InputStream inputStream) {
        List<ParsedTransaction> transactions = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) { // Skip header
                    firstLine = false;
                    continue;
                }
                String[] columns = line.split(",");
                if (columns.length < 4)
                    continue;

                LocalDate date = LocalDate.parse(columns[0].trim(), formatter);
                String description = columns[1].trim();

                BigDecimal withdrawal = columns[2].isEmpty() ? BigDecimal.ZERO : new BigDecimal(columns[2].trim());
                BigDecimal deposit = columns[3].isEmpty() ? BigDecimal.ZERO : new BigDecimal(columns[3].trim());

                BigDecimal amount = deposit.subtract(withdrawal);

                transactions.add(new ParsedTransaction(date, description, amount, "THB"));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage(), e);
        }
        return transactions;
    }
}
