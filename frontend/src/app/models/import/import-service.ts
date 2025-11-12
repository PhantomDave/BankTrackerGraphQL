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

  // State signals
  private readonly _preview = signal<ImportPreview | null>(null);
  private readonly _result = signal<ImportResult | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
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
  async confirmImport(): Promise<boolean> {
    return true;
  }

  validateFile(_file: File): string | null {
    return null;
  }
}
