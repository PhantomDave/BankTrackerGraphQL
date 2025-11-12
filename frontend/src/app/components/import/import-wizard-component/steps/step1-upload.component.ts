import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImportService } from '../../../../models/import/import-service';

// Step 1 of the import wizard: handle file selection, validation and preview request
// Emits previewLoaded when the backend preview succeeds so the parent stepper can advance.

@Component({
  selector: 'app-import-step1-upload',
  imports: [CommonModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './step1-upload.component.html',
  styleUrl: './step1-upload.component.css',
})
export class Step1UploadComponent {
  private readonly importService = inject(ImportService);

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly validationError = signal<string | null>(null);
  protected readonly preview = this.importService.preview;
  protected readonly loading = this.importService.loading;
  protected readonly serviceError = this.importService.error;

  protected onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    this.validationError.set(null);
    if (file) {
      const error = this.importService.validateFile(file);
      if (error) {
        this.validationError.set(error);
      }
    }
  }

  protected async onPreviewClick() {
    const file = this.selectedFile();
    if (!file) return;
    const validation = this.importService.validateFile(file);
    if (validation) {
      this.validationError.set(validation);
      return;
    }
    await this.importService.previewFile(file);
  }
}
