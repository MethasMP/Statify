package com.statify.backend.parser;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class PdfParser implements FileParser {

    @Override
    public boolean supports(String fileExtension) {
        return "pdf".equalsIgnoreCase(fileExtension);
    }

    @Override
    public List<ParsedTransaction> parse(InputStream inputStream) {
        List<ParsedTransaction> transactions = new ArrayList<>();
        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true); // Critical for banking PDFs
            String text = stripper.getText(document);

            // Improved regex:
            // Group 1: Date (DD/MM/YY or DD/MM/YYYY)
            // Group 2: Description (everything until the amount)
            // Group 3: Amount (digits, commas, and decimals)
            // Group 4: Balance (optional check)
            Pattern pattern = Pattern.compile(
                    "(\\d{2}/\\d{2}/(?:\\d{2}|\\d{4}))\\s+(.+?)\\s+([\\d,]+\\.\\d{2})(?:\\s+([\\d,]+\\.\\d{2}))?");

            String[] lines = text.split("\\r?\\n");
            for (String line : lines) {
                Matcher matcher = pattern.matcher(line);
                if (matcher.find()) {
                    String dateStr = matcher.group(1);
                    // Handle both YY and YYYY formats
                    DateTimeFormatter dtf = dateStr.length() == 8 ? DateTimeFormatter.ofPattern("dd/MM/yy")
                            : DateTimeFormatter.ofPattern("dd/MM/yyyy");

                    LocalDate date = LocalDate.parse(dateStr, dtf);
                    String description = matcher.group(2).trim();
                    BigDecimal amountValue = new BigDecimal(matcher.group(3).replace(",", ""));

                    // Improved Credit/Debit heuristic:
                    // Usually, if there's no minus sign and it's KBank, we'd need to check columns.
                    // For now, look for keywords.
                    boolean isCredit = description.toUpperCase()
                            .matches(".*(DEPOSIT|INTEREST|REFUND|TRANSFER IN|RECEIVED|SALARY|INCOME).*");
                    BigDecimal finalAmount = isCredit ? amountValue : amountValue.negate();

                    transactions.add(new ParsedTransaction(date, description, finalAmount, "THB"));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse PDF: " + e.getMessage(), e);
        }
        return transactions;
    }
}
