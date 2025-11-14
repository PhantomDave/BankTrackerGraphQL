import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
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
    MatInputModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDividerModule,
  ],
  templateUrl: './step3-configure.component.html',
  styleUrl: './step3-configure.component.css',
})
export class Step3ConfigureComponent {
  private readonly importService = inject(ImportService);
  protected readonly preview = computed(() => this.importService.preview());

  protected readonly dateFormat = signal<string>('dd/MM/yyyy');
  protected readonly decimalSeparator = signal<string>(',');
  protected readonly thousandsSeparator = signal<string>('.');
  protected readonly rowsToSkip = signal<number>(0);
  protected readonly saveAsTemplate = signal<boolean>(false);
  protected readonly templateName = signal<string>('');

  protected readonly dateFormatPresets = [
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (Italian)' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)' },
    { value: 'custom', label: 'Custom' },
  ];

  protected updateDateFormat(format: string): void {
    this.dateFormat.set(format);
    this.importService.setDateFormat(format);
  }

  protected updateDecimalSeparator(separator: string): void {
    this.decimalSeparator.set(separator);
    this.importService.setDecimalSeparator(separator);
  }

  protected updateThousandsSeparator(separator: string): void {
    this.thousandsSeparator.set(separator);
    this.importService.setThousandsSeparator(separator);
  }

  protected updateRowsToSkip(rows: number): void {
    this.rowsToSkip.set(rows);
    this.importService.setRowsToSkip(rows);
  }

  protected updateSaveAsTemplate(save: boolean): void {
    this.saveAsTemplate.set(save);
    this.importService.setSaveAsTemplate(save);
  }

  protected updateTemplateName(name: string): void {
    this.templateName.set(name);
    this.importService.setTemplateName(name);
  }
}
