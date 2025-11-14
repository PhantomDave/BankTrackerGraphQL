import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImportService } from '../../../../models/import/import-service';
import { FlexComponent } from '../../../ui-library/flex-component/flex-component';

interface ParsedRecord {
  rowNumber: number;
  date: string;
  amount: string;
  currency: string;
  description: string;
  name: string;
  balance?: string;
  validationStatus: 'valid' | 'duplicate' | 'error';
  validationMessage?: string;
  rawData: Record<string, string>;
}

type FilterType = 'all' | 'valid' | 'duplicates' | 'errors';

@Component({
  selector: 'app-import-step4-preview',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    FlexComponent,
  ],
  templateUrl: './step4-preview.component.html',
  styleUrl: './step4-preview.component.css',
})
export class Step4PreviewComponent {
  private readonly importService = inject(ImportService);
  protected readonly preview = computed(() => this.importService.preview());
  protected readonly columnMappings = computed(() => this.importService.columnMappings());
  protected readonly decimalSeparator = computed(() => this.importService.decimalSeparator());

  protected readonly displayedColumns: string[] = [
    'status',
    'rowNumber',
    'date',
    'amount',
    'currency',
    'description',
    'name',
  ];

  protected readonly currentFilter = signal<FilterType>('all');
  protected readonly parsedRecords = signal<ParsedRecord[]>([]);

  protected readonly filteredRecords = computed(() => {
    const records = this.parsedRecords();
    const filter = this.currentFilter();

    if (filter === 'all') return records;
    if (filter === 'valid') return records.filter((r) => r.validationStatus === 'valid');
    if (filter === 'duplicates') return records.filter((r) => r.validationStatus === 'duplicate');
    if (filter === 'errors') return records.filter((r) => r.validationStatus === 'error');

    return records;
  });

  protected readonly summary = computed(() => {
    const records = this.parsedRecords();
    return {
      total: records.length,
      valid: records.filter((r) => r.validationStatus === 'valid').length,
      duplicates: records.filter((r) => r.validationStatus === 'duplicate').length,
      errors: records.filter((r) => r.validationStatus === 'error').length,
    };
  });

  constructor() {
    effect(() => {
      const previewData = this.preview();
      const mappings = this.columnMappings();

      if (!previewData || !mappings || Object.keys(mappings).length === 0) {
        return;
      }

      this.parseRecords(previewData, mappings);
    });
  }

  private parseRecords(
    previewData: {
      sampleRows: Array<Record<string, string>>;
      headers: string[];
    },
    mappings: Record<string, string>,
  ): void {
    const records: ParsedRecord[] = [];
    const reversedMappings: Record<string, string> = {};

    Object.entries(mappings).forEach(([column, field]) => {
      reversedMappings[field] = column;
    });

    previewData.sampleRows.forEach((row, index) => {
      const parsedRecord = this.parseRow(row, reversedMappings, index + 1);
      records.push(parsedRecord);
    });

    this.parsedRecords.set(records);
  }

  private parseRow(
    row: Record<string, string>,
    reversedMappings: Record<string, string>,
    rowNumber: number,
  ): ParsedRecord {
    const record: ParsedRecord = {
      rowNumber,
      date: this.getFieldValue(row, reversedMappings, 'Date'),
      amount: this.getFieldValue(row, reversedMappings, 'Amount'),
      currency: this.getFieldValue(row, reversedMappings, 'Currency') || 'EUR',
      description: this.getFieldValue(row, reversedMappings, 'Description'),
      name: this.getFieldValue(row, reversedMappings, 'Name'),
      balance: this.getFieldValue(row, reversedMappings, 'Balance'),
      validationStatus: 'valid',
      rawData: row,
    };

    const validation = this.validateRecord(record);
    record.validationStatus = validation.status;
    record.validationMessage = validation.message;

    return record;
  }

  private getFieldValue(
    row: Record<string, string>,
    reversedMappings: Record<string, string>,
    fieldName: string,
  ): string {
    const columnName = reversedMappings[fieldName];
    return columnName && row[columnName] ? row[columnName].trim() : '';
  }

  private validateRecord(record: ParsedRecord): {
    status: 'valid' | 'duplicate' | 'error';
    message?: string;
  } {
    const errors: string[] = [];

    if (!record.date) {
      errors.push('Missing date');
    } else if (!this.isValidDate(record.date)) {
      errors.push('Invalid date format');
    }

    if (!record.amount) {
      errors.push('Missing amount');
    } else if (!this.isValidAmount(record.amount)) {
      errors.push('Invalid amount');
    }

    if (!record.description && !record.name) {
      errors.push('Missing description or name');
    }

    if (errors.length > 0) {
      return {
        status: 'error',
        message: errors.join(', '),
      };
    }

    return { status: 'valid' };
  }

  private isValidDate(dateStr: string): boolean {
    if (!dateStr) return false;

    // Match supported formats and extract components
    let day: number, month: number, year: number;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      // dd/MM/yyyy
      const [d, m, y] = dateStr.split('/');
      day = parseInt(d, 10);
      month = parseInt(m, 10);
      year = parseInt(y, 10);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // yyyy-MM-dd
      const [y, m, d] = dateStr.split('-');
      day = parseInt(d, 10);
      month = parseInt(m, 10);
      year = parseInt(y, 10);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      // dd-MM-yyyy
      const [d, m, y] = dateStr.split('-');
      day = parseInt(d, 10);
      month = parseInt(m, 10);
      year = parseInt(y, 10);
    } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
      // dd.MM.yyyy
      const [d, m, y] = dateStr.split('.');
      day = parseInt(d, 10);
      month = parseInt(m, 10);
      year = parseInt(y, 10);
    } else {
      return false;
    }

    // Months in JS Date are 0-based
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  private normalizeAmount(amountStr: string): string {
    const decimalSep = this.decimalSeparator();
    let normalized = amountStr.replace(/\s/g, '');

    if (decimalSep === ',') {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = normalized.replace(/,/g, '');
    }

    return normalized;
  }

  private isValidAmount(amountStr: string): boolean {
    if (!amountStr) return false;

    const normalized = this.normalizeAmount(amountStr);
    const num = parseFloat(normalized);
    return !isNaN(num) && isFinite(num);
  }

  protected setFilter(filter: FilterType): void {
    this.currentFilter.set(filter);
  }

  protected getStatusIcon(status: string): string {
    switch (status) {
      case 'valid':
        return 'check_circle';
      case 'duplicate':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'help';
    }
  }

  protected getStatusColor(status: string): string {
    switch (status) {
      case 'valid':
        return 'status-valid';
      case 'duplicate':
        return 'status-duplicate';
      case 'error':
        return 'status-error';
      default:
        return '';
    }
  }

  protected formatDate(dateStr: string): string {
    if (!dateStr) return '';

    try {
      const formats = [
        { pattern: /^(\d{2})\/(\d{2})\/(\d{4})$/, order: [2, 1, 0] },
        { pattern: /^(\d{4})-(\d{2})-(\d{2})$/, order: [0, 1, 2] },
        { pattern: /^(\d{2})-(\d{2})-(\d{4})$/, order: [2, 1, 0] },
        { pattern: /^(\d{2})\.(\d{2})\.(\d{4})$/, order: [2, 1, 0] },
      ];

      for (const format of formats) {
        const match = dateStr.match(format.pattern);
        if (match) {
          const parts = [match[1], match[2], match[3]];
          const year = parts[format.order[0]];
          const month = parts[format.order[1]];
          const day = parts[format.order[2]];
          const date = new Date(`${year}-${month}-${day}`);

          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-GB');
          }
        }
      }

      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB');
      }

      return dateStr;
    } catch {
      return dateStr;
    }
  }
}
