import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { ImportService } from '../../../../models/import/import-service';

@Component({
  selector: 'app-import-step5-confirm',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatListModule,
  ],
  templateUrl: './step5-confirm.component.html',
  styleUrl: './step5-confirm.component.css',
})
export class Step5ConfirmComponent {
  private readonly importService = inject(ImportService);

  protected readonly loading = computed(() => this.importService.loading());
  protected readonly error = computed(() => this.importService.error());
  protected readonly result = computed(() => this.importService.result());
  protected readonly preview = computed(() => this.importService.preview());
  protected readonly columnMappings = computed(() => this.importService.columnMappings());
  protected readonly dateFormat = computed(() => this.importService.dateFormat());
  protected readonly decimalSeparator = computed(() => this.importService.decimalSeparator());
  protected readonly thousandsSeparator = computed(() => this.importService.thousandsSeparator());
  protected readonly rowsToSkip = computed(() => this.importService.rowsToSkip());
  protected readonly saveAsTemplate = computed(() => this.importService.saveAsTemplate());
  protected readonly templateName = computed(() => this.importService.templateName());
  protected readonly selectedFile = computed(() => this.importService.selectedFile());

  protected async onConfirmImport(): Promise<void> {
    const file = this.selectedFile();
    const mappings = this.columnMappings();
    if (!file || !mappings || Object.keys(mappings).length === 0) return;

    await this.importService.confirmImport(
      file,
      mappings,
      this.dateFormat(),
      this.decimalSeparator(),
      this.thousandsSeparator(),
      this.rowsToSkip(),
      this.saveAsTemplate(),
      this.templateName() || undefined,
    );
  }
}
