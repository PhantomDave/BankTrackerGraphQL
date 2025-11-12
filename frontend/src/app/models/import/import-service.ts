import { inject, Injectable, signal } from '@angular/core';
import { ConfirmImportGQL, PreviewImportGQL } from '../../../generated/graphql';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { ImportPreview } from './import-preview';
import { ImportResult } from './import-result';

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
    return true;
  }
  async confirmImport(): Promise<boolean> {
    return true;
  }
  validateFile(file: File): string | null {
    return null;
  }
}
