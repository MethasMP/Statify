// Extended types for full PRD coverage
export type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Upload {
  id: string;
  filename: string;
  fileType: string;
  status: UploadStatus;
  rowCount?: number;
  errorMsg?: string;
  uploadedAt: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  system: boolean;
}

export interface Transaction {
  id: string;
  uploadId: string;
  txnDate: string;
  description: string;
  amount: number;
  currency: string;
  categoryId?: number;
  matchedRuleId?: number;
  override: boolean;
}

export interface Anomaly {
  id: string;
  transaction: Transaction;
  ruleName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  detail: string;
  status: 'open' | 'confirmed' | 'dismissed';
  reviewedAt?: string;
  createdAt: string;
}

export interface CategorizationRule {
  id: number;
  keyword: string;
  category: Category;
  priority: number;
  matchCount: number;
  system: boolean;
  createdAt: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  anomalyCount: number;
  txnCount: number;
  byCategory: Record<string, number>;
}
