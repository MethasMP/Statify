package com.statify.backend.parser;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Calendar;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ExcelParser (Apache POI XSSFWorkbook).
 * Each test builds an in-memory .xlsx workbook and feeds it to the parser.
 */
class ExcelParserTest {

    private final ExcelParser parser = new ExcelParser();

    // ── supports() ──────────────────────────────────────────────────────

    @Test
    void supportsXlsx() {
        assertTrue(parser.supports("xlsx"));
        assertTrue(parser.supports("XLSX"));
    }

    @Test
    void supportsXls() {
        assertTrue(parser.supports("xls"));
    }

    @Test
    void doesNotSupportCsvOrPdf() {
        assertFalse(parser.supports("csv"));
        assertFalse(parser.supports("pdf"));
    }

    // ── happy path ───────────────────────────────────────────────────────

    @Test
    void parsesKBankFormatWithDateHeader() throws Exception {
        // Build: Date | Description | Withdrawal | Deposit
        ByteArrayInputStream stream = buildXlsx(wb -> {
            Sheet s = wb.createSheet("Statement");
            Row hdr = s.createRow(0);
            hdr.createCell(0).setCellValue("Date");
            hdr.createCell(1).setCellValue("Description");
            hdr.createCell(2).setCellValue("Withdrawal");
            hdr.createCell(3).setCellValue("Deposit");

            // Row 1 — KFC debit 120
            Row r1 = s.createRow(1);
            setDateCell(wb, r1, 0, 2026, 2, 23);
            r1.createCell(1).setCellValue("KFC CHATUCHAK");
            r1.createCell(2).setCellValue(120.0);
            r1.createCell(3).setCellValue(0.0);

            // Row 2 — Salary credit 45000
            Row r2 = s.createRow(2);
            setDateCell(wb, r2, 0, 2026, 2, 24);
            r2.createCell(1).setCellValue("SALARY PAYMENT");
            r2.createCell(2).setCellValue(0.0);
            r2.createCell(3).setCellValue(45000.0);
        });

        List<ParsedTransaction> txns = parser.parse(stream);

        assertEquals(2, txns.size());

        ParsedTransaction kfc = txns.get(0);
        assertEquals(LocalDate.of(2026, 2, 23), kfc.date());
        assertEquals("KFC CHATUCHAK", kfc.description());
        assertTrue(kfc.amount().compareTo(new BigDecimal("-120.0")) == 0,
                "Withdrawal should be negative");

        ParsedTransaction salary = txns.get(1);
        assertEquals(LocalDate.of(2026, 2, 24), salary.date());
        assertEquals("SALARY PAYMENT", salary.description());
        assertTrue(salary.amount().compareTo(new BigDecimal("45000.0")) == 0,
                "Deposit should be positive");
    }

    @Test
    void parsesThaiHeader_วันที่() throws Exception {
        ByteArrayInputStream stream = buildXlsx(wb -> {
            Sheet s = wb.createSheet("Sheet1");
            Row hdr = s.createRow(0);
            hdr.createCell(0).setCellValue("วันที่"); // Thai header
            hdr.createCell(1).setCellValue("รายการ");
            hdr.createCell(2).setCellValue("ถอน");
            hdr.createCell(3).setCellValue("ฝาก");

            Row r1 = s.createRow(1);
            r1.createCell(0).setCellValue("23/02/2026"); // string date
            r1.createCell(1).setCellValue("ร้านอาหาร");
            r1.createCell(2).setCellValue(350.0);
            r1.createCell(3).setCellValue(0.0);
        });

        List<ParsedTransaction> txns = parser.parse(stream);
        assertEquals(1, txns.size());
        assertEquals(LocalDate.of(2026, 2, 23), txns.get(0).date());
        assertTrue(txns.get(0).amount().compareTo(BigDecimal.ZERO) < 0,
                "Debit amount must be negative");
    }

    @Test
    void skipsBlankRowsGracefully() throws Exception {
        ByteArrayInputStream stream = buildXlsx(wb -> {
            Sheet s = wb.createSheet("Sheet1");
            Row hdr = s.createRow(0);
            hdr.createCell(0).setCellValue("Date");
            hdr.createCell(1).setCellValue("Description");
            hdr.createCell(2).setCellValue("Withdrawal");
            hdr.createCell(3).setCellValue("Deposit");

            // Row 1 — real data
            Row r1 = s.createRow(1);
            setDateCell(wb, r1, 0, 2026, 2, 10);
            r1.createCell(1).setCellValue("GRAB");
            r1.createCell(2).setCellValue(89.0);
            r1.createCell(3).setCellValue(0.0);

            // Row 2 — intentionally blank (simulate empty separator)
            s.createRow(2); // blank

            // Row 3 — real data
            Row r3 = s.createRow(3);
            setDateCell(wb, r3, 0, 2026, 2, 11);
            r3.createCell(1).setCellValue("SHOPEE");
            r3.createCell(2).setCellValue(299.0);
            r3.createCell(3).setCellValue(0.0);
        });

        List<ParsedTransaction> txns = parser.parse(stream);
        assertEquals(2, txns.size(), "Blank row should be skipped");
    }

    @Test
    void throwsOnUnrecognisedFormat() {
        // Sheet with no date header and no date cells
        ByteArrayInputStream stream = buildXlsx(wb -> {
            Sheet s = wb.createSheet("Sheet1");
            Row r = s.createRow(0);
            r.createCell(0).setCellValue("totally wrong");
            r.createCell(1).setCellValue("columns");
        });

        RuntimeException ex = assertThrows(RuntimeException.class, () -> parser.parse(stream));
        assertTrue(ex.getMessage().contains("EXCEL_PARSE_ERROR") ||
                ex.getMessage().contains("detect header"),
                "Should throw descriptive parse error");
    }

    // ── helpers ───────────────────────────────────────────────────────────

    interface WorkbookBuilder {
        void build(Workbook wb) throws Exception;
    }

    private ByteArrayInputStream buildXlsx(WorkbookBuilder builder) {
        try (Workbook wb = new XSSFWorkbook()) {
            builder.build(wb);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Test workbook build failed", e);
        }
    }

    private void setDateCell(Workbook wb, Row row, int col, int year, int month, int day) {
        Cell cell = row.createCell(col);
        CellStyle style = wb.createCellStyle();
        CreationHelper helper = wb.getCreationHelper();
        style.setDataFormat(helper.createDataFormat().getFormat("dd/MM/yyyy"));
        cell.setCellStyle(style);

        Calendar cal = Calendar.getInstance();
        cal.set(year, month - 1, day, 0, 0, 0);
        cal.set(Calendar.MILLISECOND, 0);
        cell.setCellValue(cal.getTime());
    }
}
