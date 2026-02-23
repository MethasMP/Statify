package com.statify.backend.parser;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * ExcelParser — reads KBank / SCB / BBL formatted .xlsx bank statements.
 *
 * Expected column layout (flexible — detects header row automatically):
 * Date | Description | Withdrawal (Debit) | Deposit (Credit) | [Balance]
 *
 * Strategy: scan first 10 rows for a "date"-like header, then parse from there.
 * Amount convention: positive = credit (income), negative = debit (expense).
 */
@Slf4j
@Component
public class ExcelParser implements FileParser {

    @Override
    public boolean supports(String fileExtension) {
        return "xlsx".equalsIgnoreCase(fileExtension) || "xls".equalsIgnoreCase(fileExtension);
    }

    @Override
    public List<ParsedTransaction> parse(InputStream inputStream) {
        List<ParsedTransaction> transactions = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            int dataStartRow = detectDataStartRow(sheet);

            if (dataStartRow < 0) {
                throw new RuntimeException("EXCEL_PARSE_ERROR: Could not detect header row. " +
                        "Expected columns: Date, Description, Withdrawal, Deposit");
            }

            log.info("Excel parser: sheet='{}', dataStartRow={}, totalRows={}",
                    sheet.getSheetName(), dataStartRow, sheet.getLastRowNum());

            for (int r = dataStartRow; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null || isBlankRow(row))
                    continue;

                try {
                    ParsedTransaction txn = parseRow(row);
                    if (txn != null)
                        transactions.add(txn);
                } catch (Exception e) {
                    log.warn("Excel parser: skipping row {} — {}", r, e.getMessage());
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage(), e);
        }

        log.info("Excel parser: parsed {} transactions", transactions.size());
        return transactions;
    }

    // ── Private helpers ───────────────────────────────────────────────────

    /**
     * Scan up to 15 rows for a header row containing a date-like column.
     * Returns the first DATA row index (header + 1), or -1 if not found.
     */
    private int detectDataStartRow(Sheet sheet) {
        for (int r = 0; r <= Math.min(15, sheet.getLastRowNum()); r++) {
            Row row = sheet.getRow(r);
            if (row == null)
                continue;
            for (Cell cell : row) {
                String val = cellString(cell).toLowerCase();
                if (val.contains("date") || val.contains("วันที่") || val.contains("txn date")) {
                    return r + 1; // data starts on next row
                }
            }
            // Also accept: if first cell is a valid date value, treat this as data row
            Cell firstCell = row.getCell(0);
            if (firstCell != null && firstCell.getCellType() == CellType.NUMERIC
                    && DateUtil.isCellDateFormatted(firstCell)) {
                return r;
            }
        }
        return -1;
    }

    private ParsedTransaction parseRow(Row row) {
        // Col 0: Date
        Cell dateCell = row.getCell(0);
        if (dateCell == null)
            return null;
        LocalDate date = extractDate(dateCell);
        if (date == null)
            return null;

        // Col 1: Description / Narration
        String description = cellString(row.getCell(1));
        if (description.isBlank())
            description = "UNNAMED_TRANSACTION";

        // Col 2: Withdrawal / Debit (outflow → negative)
        BigDecimal withdrawal = cellDecimal(row.getCell(2));

        // Col 3: Deposit / Credit (inflow → positive)
        // If sheet has only 3 cols (date, desc, amount with +/- sign), adjust:
        BigDecimal deposit = row.getLastCellNum() >= 4
                ? cellDecimal(row.getCell(3))
                : BigDecimal.ZERO;

        BigDecimal amount = deposit.subtract(withdrawal);

        // Skip rows where both amounts are zero (likely subtotals / empty separators)
        if (amount.compareTo(BigDecimal.ZERO) == 0 && withdrawal.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }

        return new ParsedTransaction(date, description, amount, "THB");
    }

    private LocalDate extractDate(Cell cell) {
        if (cell == null)
            return null;
        try {
            if (DateUtil.isCellDateFormatted(cell)) {
                Date d = cell.getDateCellValue();
                return d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            }
            // Try parsing string date (dd/MM/yyyy or yyyy-MM-dd)
            String raw = cellString(cell).trim();
            if (raw.matches("\\d{2}/\\d{2}/\\d{4}")) {
                String[] parts = raw.split("/");
                return LocalDate.of(Integer.parseInt(parts[2]),
                        Integer.parseInt(parts[1]),
                        Integer.parseInt(parts[0]));
            }
            if (raw.matches("\\d{4}-\\d{2}-\\d{2}")) {
                return LocalDate.parse(raw);
            }
        } catch (Exception e) {
            log.debug("Could not parse date from cell: {}", cell);
        }
        return null;
    }

    private BigDecimal cellDecimal(Cell cell) {
        if (cell == null)
            return BigDecimal.ZERO;
        try {
            return switch (cell.getCellType()) {
                case NUMERIC -> BigDecimal.valueOf(cell.getNumericCellValue());
                case STRING -> {
                    String s = cell.getStringCellValue().replaceAll("[,\\s]", "").trim();
                    yield s.isEmpty() ? BigDecimal.ZERO : new BigDecimal(s);
                }
                default -> BigDecimal.ZERO;
            };
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private String cellString(Cell cell) {
        if (cell == null)
            return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getDateCellValue().toString()
                    : String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield String.valueOf(cell.getNumericCellValue());
                } catch (Exception e) {
                    yield cell.getStringCellValue();
                }
            }
            default -> "";
        };
    }

    private boolean isBlankRow(Row row) {
        for (Cell cell : row) {
            if (cell != null && cell.getCellType() != CellType.BLANK
                    && !cellString(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }
}
