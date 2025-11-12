import { Component, computed, inject } from '@angular/core';
import { ImportService } from '../../../../models/import/import-service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-import-step2-detect',
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, MatDividerModule],
  templateUrl: './step2-detect.component.html',
  styleUrl: './step2-detect.component.css',
})
export class Step2DetectComponent {
  private readonly importService = inject(ImportService);
  protected readonly preview = computed(() => this.importService.preview());

  protected readonly detectedColumnsArray = computed(() => {
    const preview = this.preview();
    if (!preview) return [];
    return Object.entries(preview.detectedColumns).map(([key, value]) => ({
      column: key,
      mapping: value.suggestedMapping,
      confidence: value.confidence,
    }));
  });

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
