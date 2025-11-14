import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { ImportService } from '../../../../models/import/import-service';

@Component({
  selector: 'app-import-step3-configure',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatButtonModule,
  ],
  templateUrl: './step3-configure.component.html',
  styleUrl: './step3-configure.component.css',
})
export class Step3ConfigureComponent {
  private readonly importService = inject(ImportService);
  protected readonly preview = computed(() => this.importService.preview());

  protected readonly columnMappings = signal<Record<string, string>>({});

  protected readonly availableFields = [
    'Date',
    'Description',
    'Amount',
    'Currency',
    'Name',
    'Balance',
  ];

  constructor() {
    effect(() => {
      const previewData = this.preview();
      if (!previewData) return;

      if (Object.keys(this.columnMappings()).length === 0) {
        const initialMappings: Record<string, string> = {};
        Object.entries(previewData.detectedColumns).forEach(([column, detection]) => {
          initialMappings[column] = detection.suggestedMapping;
        });
        this.columnMappings.set(initialMappings);
        this.importService.setColumnMappings(initialMappings);
      }
    });
  }

  protected updateColumnMapping(column: string, field: string): void {
    const mappings = { ...this.columnMappings() };
    if (field === '') {
      delete mappings[column];
    } else {
      mappings[column] = field;
    }
    this.columnMappings.set(mappings);
    this.importService.setColumnMappings(mappings);
  }

  protected getDuplicateMapping(): string[] {
    const mappings = this.columnMappings();
    const fieldCount: Record<string, number> = {};
    Object.values(mappings).forEach((field) => {
      if (field === 'Unknown') return;
      if (field) {
        fieldCount[field] = (fieldCount[field] || 0) + 1;
      }
    });

    return Object.keys(fieldCount).filter((field) => fieldCount[field] > 1);
  }

  protected getColumnMapping(column: string): string {
    return this.columnMappings()[column] || '';
  }

  protected getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
  }

  protected getConfidenceLabel(confidence: number): string {
    if (confidence >= 80) return 'High';
    if (confidence >= 50) return 'Medium';
    return 'Low';
  }

  protected getDetectionConfidence(column: string): number | null {
    const previewData = this.preview();
    if (!previewData) return null;
    return previewData.detectedColumns[column]?.confidence || null;
  }
}
