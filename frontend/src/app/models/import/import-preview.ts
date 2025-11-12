export interface ColumnDetectionResult {
  column: string;
  suggestedMapping: string;
  confidence: number;
}

export interface ImportPreview {
  detectedColumns: Record<string, ColumnDetectionResult>;
  sampleRows: Array<Record<string, string>>;
  totalRows: number;
  headers: string[];
}
