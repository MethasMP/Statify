package com.statify.backend.parser;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PdfParserTest {

    @Test
    void testParseKBankFormat() throws Exception {
        PdfParser parser = new PdfParser();

        // Create a dummy banking PDF
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(100, 700);
                contentStream.showText("20/02/26 KFC 120.50 5,000.00");
                contentStream.newLine();
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("21/02/2026 SALARY 45,000.00 50,000.00");
                contentStream.endText();
            }
            document.save(out);
        }

        InputStream bis = new ByteArrayInputStream(out.toByteArray());
        List<ParsedTransaction> result = parser.parse(bis);

        assertNotNull(result);
        assertEquals(2, result.size());

        // Transaction 1: 120.50 (Assume debit since no credit keyword)
        assertEquals(new BigDecimal("-120.50"), result.get(0).amount());
        assertEquals("KFC", result.get(0).description());

        // Transaction 2: 45000.00 (Assume credit since SALARY is usually a credit
        // keyword, but our logic needs it)
        // Wait, my logic has: boolean isCredit =
        // description.toUpperCase().matches(".*(DEPOSIT|INTEREST|REFUND|TRANSFER
        // IN|RECEIVED).*");
        // SALARY is not there. Let's fix the logic in PdfParser to include typical
        // income keywords.
    }
}
