import { inject, Injectable, signal } from '@angular/core';
import { ConfirmImportGQL, PreviewImportGQL } from '../../../generated/graphql';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { ImportPreview } from './import-preview';
import { ImportResult } from './import-result';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly previewImportGQL = inject(PreviewImportGQL);
  private readonly confirmImportGQL = inject(ConfirmImportGQL);
  private readonly snackbar = inject(SnackbarService);

  private readonly _preview = signal<ImportPreview | null>(null);
  private readonly _result = signal<ImportResult | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  public readonly preview = this._preview.asReadonly();
  public readonly result = this._result.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();

  async previewFile(file: File): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.previewImportGQL.mutate({
          variables: {
            file: {
              file,
            },
          },
        }),
      );

      if (result.error) {
        const errorMsg = result.error.message;
        this._error.set(errorMsg);
        this.snackbar.error(errorMsg);
        return false;
      }

      if (!result.data?.previewImport) {
        const errorMsg = 'No preview data returned';
        this._error.set(errorMsg);
        this.snackbar.error(errorMsg);
        return false;
      }

      const gqlPreview = result.data.previewImport;
      const preview: ImportPreview = {
        headers: gqlPreview.headers,
        totalRows: gqlPreview.totalRows,
        sampleRows: gqlPreview.sampleRows.map((row) =>
          row.reduce((acc, kv) => ({ ...acc, [kv.key]: kv.value }), {}),
        ),
        detectedColumns: gqlPreview.detectedColumns.reduce(
          (acc, kv) => ({ ...acc, [kv.key]: kv.value }),
          {},
        ),
      };

      this._preview.set(preview);
      this.snackbar.success('File preview loaded successfully');
      return true;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to preview file';
      this._error.set(errorMsg);
      this.snackbar.error(errorMsg);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async confirmImport(
    file: File,
    columnMappings: Record<string, string>,
    dateFormat: string = 'dd/MM/yyyy',
    decimalSeparator: string = ',',
    thousandsSeparator: string = '.',
    rowsToSkip: number = 0,
    saveAsTemplate: boolean = false,
    templateName?: string,
  ): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const columnMappingsArray = Object.entries(columnMappings).map(([key, value]) => ({
        key,
        value,
      }));

      const result = await firstValueFrom(
        this.confirmImportGQL.mutate({
          variables: {
            file: {
              file,
              columnMappings: columnMappingsArray,
              dateFormat,
              decimalSeparator,
              thousandsSeparator,
              rowsToSkip,
              saveAsTemplate,
              templateName: templateName || null,
            },
          },
        }),
      );

      if (result.error) {
        const errorMsg = result.error.message;
        this._error.set(errorMsg);
        this.snackbar.error(errorMsg);
        return false;
      }

      if (!result.data?.confirmImport) {
        const errorMsg = 'No import result returned';
        this._error.set(errorMsg);
        this.snackbar.error(errorMsg);
        return false;
      }

      const gqlResult = result.data.confirmImport;
      const importResult: ImportResult = {
        successCount: gqlResult.successCount,
        failureCount: gqlResult.failureCount,
        duplicateCount: gqlResult.duplicateCount,
        errors: gqlResult.errors.map((err) => ({
          rowNumber: err.rowNumber,
          message: err.message,
          rowData: err.rowData.reduce((acc, kv) => ({ ...acc, [kv.key]: kv.value }), {}),
        })),
        createdRecords: gqlResult.createdRecords.map((record) => ({
          id: record.id,
          name: record.name,
          description: record.description,
          amount: record.amount,
          currency: record.currency,
          date: record.date,
          isRecurring: false,
          isRecurringInstance: false,
          recurrenceFrequency: 'NONE',
        })),
      };

      this._result.set(importResult);
      this.snackbar.success(`Import complete: ${importResult.successCount} records created`);
      return true;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to import file';
      this._error.set(errorMsg);
      this.snackbar.error(errorMsg);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  validateFile(file: File): string | null {
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    const ALLOWED_EXTENSIONS = ['.csv', '.xlsx'];
    const ALLOWED_MIME_TYPES = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!file) {
      return 'No file selected';
    }

    if (file.size === 0) {
      return 'File is empty';
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed`;
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return `Invalid file MIME type. Expected CSV or Excel file`;
    }

    return null;
  }
}
