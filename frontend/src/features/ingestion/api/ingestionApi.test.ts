/**
 * TDD: ingestionApi unit tests
 * Tests the API client contract — NOT the server behavior.
 * Uses fetch mock (global) to verify correct URLs, methods, and error handling.
 *
 * RED phase: These tests define the exact contract the client must fulfill.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ingestionApi } from "@/features/ingestion/api/ingestionApi";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function okJson(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);
}

function failJson(status: number, body: unknown) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

describe("ingestionApi", () => {
  beforeEach(() => mockFetch.mockReset());

  // ── uploadFile ───────────────────────────────────────────────────────
  describe("uploadFile", () => {
    it("POSTs to /api/v1/uploads with FormData", async () => {
      mockFetch.mockReturnValueOnce(okJson({ id: "abc", status: "pending" }));
      const file = new File(["test"], "statement.csv", { type: "text/csv" });

      await ingestionApi.uploadFile(file);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/uploads",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("throws with server error message on failure", async () => {
      mockFetch.mockReturnValueOnce(
        failJson(400, { message: "UNSUPPORTED_FILE_TYPE" })
      );

      await expect(
        ingestionApi.uploadFile(new File(["x"], "a.docx"))
      ).rejects.toThrow("UNSUPPORTED_FILE_TYPE");
    });
  });

  // ── getUploadStatus ──────────────────────────────────────────────────
  describe("getUploadStatus", () => {
    it("GETs /api/v1/uploads/:id", async () => {
      mockFetch.mockReturnValueOnce(okJson({ id: "xyz", status: "completed" }));

      const result = await ingestionApi.getUploadStatus("xyz");

      expect(mockFetch).toHaveBeenCalledWith("/api/v1/uploads/xyz", undefined);
      expect(result.status).toBe("completed");
    });

    it("throws when upload not found (404)", async () => {
      mockFetch.mockReturnValueOnce(failJson(404, { message: "RESOURCE_NOT_FOUND" }));

      await expect(ingestionApi.getUploadStatus("bad-id")).rejects.toThrow();
    });
  });

  // ── getSummary ───────────────────────────────────────────────────────
  describe("getSummary", () => {
    it("GETs /api/v1/uploads/:id/summary", async () => {
      const summary = { totalIncome: 50000, totalExpense: 20000, netBalance: 30000 };
      mockFetch.mockReturnValueOnce(okJson(summary));

      const result = await ingestionApi.getSummary("id1");

      expect(mockFetch).toHaveBeenCalledWith("/api/v1/uploads/id1/summary", undefined);
      expect(result.totalIncome).toBe(50000);
    });
  });

  // ── getTransactions ──────────────────────────────────────────────────
  describe("getTransactions", () => {
    it("GETs with no query params when no filters", async () => {
      mockFetch.mockReturnValueOnce(okJson([]));

      await ingestionApi.getTransactions("id1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/uploads/id1/transactions",
        undefined
      );
    });

    it("appends categoryId query param when provided", async () => {
      mockFetch.mockReturnValueOnce(okJson([]));

      await ingestionApi.getTransactions("id1", { categoryId: 3 });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/uploads/id1/transactions?categoryId=3",
        undefined
      );
    });

    it("appends keyword query param when provided", async () => {
      mockFetch.mockReturnValueOnce(okJson([]));

      await ingestionApi.getTransactions("id1", { keyword: "KFC" });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/uploads/id1/transactions?keyword=KFC",
        undefined
      );
    });
  });

  // ── overrideCategory ─────────────────────────────────────────────────
  describe("overrideCategory", () => {
    it("PATCHes /api/v1/uploads/transactions/:id/category", async () => {
      mockFetch.mockReturnValueOnce(okJson({ id: "txn1", categoryId: 2 }));

      await ingestionApi.overrideCategory("txn1", 2);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/uploads/transactions/txn1/category?categoryId=2",
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  // ── getAnomalies ─────────────────────────────────────────────────────
  describe("getAnomalies", () => {
    it("GETs /api/v1/uploads/:uploadId/anomalies", async () => {
      mockFetch.mockReturnValueOnce(okJson([]));

      await ingestionApi.getAnomalies("upload1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/uploads/upload1/anomalies",
        undefined
      );
    });
  });

  // ── updateAnomalyStatus ───────────────────────────────────────────────
  describe("updateAnomalyStatus", () => {
    it("PATCHes anomaly status with confirmed", async () => {
      mockFetch.mockReturnValueOnce(okJson({ id: "a1", status: "confirmed" }));

      await ingestionApi.updateAnomalyStatus("a1", "confirmed");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/anomalies/a1/status?status=confirmed",
        expect.objectContaining({ method: "PATCH" })
      );
    });

    it("PATCHes anomaly status with dismissed", async () => {
      mockFetch.mockReturnValueOnce(okJson({ id: "a1", status: "dismissed" }));

      await ingestionApi.updateAnomalyStatus("a1", "dismissed");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/anomalies/a1/status?status=dismissed",
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  // ── addRule ───────────────────────────────────────────────────────────
  describe("addRule", () => {
    it("POSTs to /api/v1/rules with JSON body", async () => {
      mockFetch.mockReturnValueOnce(okJson({ id: 99, keyword: "LINEMAN" }));

      await ingestionApi.addRule({ keyword: "LINEMAN", categoryId: 1 });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/rules",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        })
      );
    });
  });

  // ── deleteRule ────────────────────────────────────────────────────────
  describe("deleteRule", () => {
    it("DELETEs /api/v1/rules/:id", async () => {
      mockFetch.mockReturnValueOnce(okJson(undefined));

      await ingestionApi.deleteRule(5);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/rules/5",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
