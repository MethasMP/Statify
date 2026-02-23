package com.statify.backend.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.NoSuchElementException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * TDD: Every error scenario from PRD §12 Error Handling must have a test.
 * Tests verify user-facing response structure, NOT stack traces.
 */
@WebMvcTest(controllers = GlobalExceptionHandlerTest.FakeController.class)
@Import(GlobalExceptionHandler.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mvc;

    // ── Fake controller to trigger each exception type ──────────────────
    @RestController
    @RequestMapping("/test-errors")
    static class FakeController {

        @GetMapping("/not-found")
        public void triggerNotFound() {
            throw new NoSuchElementException("Resource not found");
        }

        @GetMapping("/unsupported-type")
        public void triggerUnsupportedType() {
            throw new UnsupportedFileTypeException("docx");
        }

        @GetMapping("/scanned-pdf")
        public void triggerScannedPdf() {
            throw new ScannedPdfException("statement.pdf");
        }

        @GetMapping("/partial-parse")
        public void triggerPartialParse() {
            throw new PartialParseException(180, 200);
        }

        @GetMapping("/unhandled")
        public void triggerUnhandled() {
            throw new RuntimeException("Unexpected boom");
        }
    }

    // ── Tests ────────────────────────────────────────────────────────────
    @Test
    @DisplayName("404 → returns JSON with code=RESOURCE_NOT_FOUND")
    void not_found_returns_structured_json() throws Exception {
        mvc.perform(get("/test-errors/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.action").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("unsupported file type → 400 with code=UNSUPPORTED_FILE_TYPE")
    void unsupported_file_type_returns_400() throws Exception {
        mvc.perform(get("/test-errors/unsupported-type"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("UNSUPPORTED_FILE_TYPE"))
                .andExpect(jsonPath("$.action").exists());
    }

    @Test
    @DisplayName("scanned PDF → 422 with code=SCANNED_PDF_DETECTED")
    void scanned_pdf_returns_422() throws Exception {
        mvc.perform(get("/test-errors/scanned-pdf"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("SCANNED_PDF_DETECTED"))
                .andExpect(jsonPath("$.action").exists());
    }

    @Test
    @DisplayName("partial parse → 206 with processed/total counts")
    void partial_parse_returns_206_with_counts() throws Exception {
        mvc.perform(get("/test-errors/partial-parse"))
                .andExpect(status().is(206))
                .andExpect(jsonPath("$.code").value("PARTIAL_PARSE"))
                .andExpect(jsonPath("$.processed").value(180))
                .andExpect(jsonPath("$.total").value(200));
    }

    @Test
    @DisplayName("unhandled exception → 500 with NO stack trace in body")
    void unhandled_exception_hides_stack_trace() throws Exception {
        mvc.perform(get("/test-errors/unhandled"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                // Stack trace must NOT appear
                .andExpect(jsonPath("$.stackTrace").doesNotExist())
                .andExpect(jsonPath("$.trace").doesNotExist());
    }
}
