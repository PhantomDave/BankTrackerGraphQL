import { Component, computed, effect, inject, signal } from '@angular/core';
import { ImportService } from '../../../../models/import/import-service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-import-step2-detect',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './step2-detect.component.html',
  styleUrl: './step2-detect.component.css',
})
export class Step2DetectComponent {
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
    'Skip',
  ];

  protected readonly detectedColumnsArray = computed(() => {
    const preview = this.preview();
    if (!preview) return [];
    return Object.entries(preview.detectedColumns).map(([key, value]) => ({
      column: key,
      mapping: value.suggestedMapping,
      confidence: value.confidence,
    }));
  });

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
    if (field === '' || field === 'Skip') {
      delete mappings[column];
    } else {
      mappings[column] = field;
    }
    this.columnMappings.set(mappings);
    this.importService.setColumnMappings(mappings);
  }

  protected getColumnMapping(column: string): string {
    return this.columnMappings()[column] || '';
  }

  protected getDuplicateMapping(): string[] {
    const mappings = this.columnMappings();
    const fieldCount: Record<string, number> = {};
    Object.values(mappings).forEach((field) => {
      if (field === 'Unknown' || field === 'Skip') return;
      if (field) {
        fieldCount[field] = (fieldCount[field] || 0) + 1;
      }
    });

    return Object.keys(fieldCount).filter((field) => fieldCount[field] > 1);
  }

  protected getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
  }

  protected getConfidenceLabel(confidence: number): string {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 50) return 'Medium Confidence';
    return 'Low Confidence';
  }

  protected getConfidenceIcon(confidence: number): string {
    if (confidence >= 80) return 'check_circle';
    if (confidence >= 50) return 'info';
    return 'warning';
  }
}
