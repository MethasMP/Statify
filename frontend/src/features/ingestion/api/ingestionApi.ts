import type { Upload, Transaction, Anomaly, Category, CategorizationRule, Summary } from "../types";

const BASE = "/api/v1";

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const ingestionApi = {
  // ── Uploads ─────────────────────────────────────────────────────────
  uploadFile: async (file: File): Promise<Upload> => {
    const formData = new FormData();
    formData.append("file", file);
    return req<Upload>("/uploads", { method: "POST", body: formData });
  },
  getUploadStatus: (id: string) => req<Upload>(`/uploads/${id}`),
  getPreview:      (id: string) => req<Transaction[]>(`/uploads/${id}/preview`),
  getSummary:      (id: string) => req<Summary>(`/uploads/${id}/summary`),

  // ── Transactions ─────────────────────────────────────────────────────
  getTransactions: (id: string, params?: { categoryId?: number; keyword?: string }) => {
    const qs = new URLSearchParams();
    if (params?.categoryId) qs.set("categoryId", String(params.categoryId));
    if (params?.keyword)   qs.set("keyword", params.keyword);
    const qstr = qs.toString() ? "?" + qs.toString() : "";
    return req<Transaction[]>(`/uploads/${id}/transactions${qstr}`);
  },
  overrideCategory: (txnId: string, categoryId: number) =>
    req<Transaction>(`/uploads/transactions/${txnId}/category?categoryId=${categoryId}`, {
      method: "PATCH",
    }),

  // ── Anomalies ─────────────────────────────────────────────────────────
  getAnomalies: (uploadId: string) => req<Anomaly[]>(`/uploads/${uploadId}/anomalies`),
  updateAnomalyStatus: (id: string, status: "confirmed" | "dismissed") =>
    req<Anomaly>(`/anomalies/${id}/status?status=${status}`, { method: "PATCH" }),

  // ── Categories & Rules ────────────────────────────────────────────────
  getCategories: () => req<Category[]>("/categories"),
  getRules: ()       => req<CategorizationRule[]>("/rules"),
  addRule: (payload: { keyword: string; categoryId: number; priority?: number }) =>
    req<CategorizationRule>("/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  updateRule: (id: number, payload: { keyword: string; categoryId: number; priority?: number }) =>
    req<CategorizationRule>(`/rules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  deleteRule: (id: number) => req<void>(`/rules/${id}`, { method: "DELETE" }),
};
