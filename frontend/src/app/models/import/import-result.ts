export interface ImportError {
  rowNumber: number;
  message: string;
  rowData: Record<string, string>;
}

export interface CreatedFinanceRecord {
  id: number;
  name: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  isRecurring: boolean;
  isRecurringInstance: boolean;
  lastProcessedDate?: string | null;
  parentRecurringRecordId?: number | null;
  recurrenceEndDate?: string | null;
  recurrenceFrequency: string;
}

export interface ImportResult {
  successCount: number;
  failureCount: number;
  duplicateCount: number;
  errors: ImportError[];
  createdRecords: CreatedFinanceRecord[];
}
