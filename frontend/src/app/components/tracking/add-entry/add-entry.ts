import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { map } from 'rxjs';
import { FinanceRecord } from '../../../models/finance-record/finance-record';
import { RecurrenceFrequency, RECURRENCE_OPTIONS } from '../../../../models/recurrence-frequency';

type FinanceRecordDialogData = Partial<FinanceRecord> | undefined;

@Component({
  selector: 'app-add-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './add-entry.html',
  styleUrl: './add-entry.css',
})
export class AddEntry {
  private readonly dialogRef = inject(MatDialogRef<AddEntry, FinanceRecord | undefined>);
  private readonly dialogData = inject(MAT_DIALOG_DATA) as FinanceRecordDialogData;
  private readonly formBuilder = inject(FormBuilder);

  readonly recurrenceOptions = RECURRENCE_OPTIONS;

  private readonly initialValue: FinanceRecord = {
    id: this.dialogData?.id ?? undefined,
    name: this.dialogData?.name ?? '',
    description: this.dialogData?.description ?? '',
    recurring: this.dialogData?.recurring ?? false,
    amount: this.dialogData?.amount ?? 0,
    currency: this.dialogData?.currency ?? '',
    date: this.dialogData?.date ? new Date(this.dialogData.date) : new Date(),
    recurrenceFrequency: this.dialogData?.recurrenceFrequency ?? RecurrenceFrequency.NONE,
    recurrenceEndDate: this.dialogData?.recurrenceEndDate
      ? new Date(this.dialogData.recurrenceEndDate)
      : null,
  };

  readonly dialogTitle = this.dialogData ? 'Edit Finance Record' : 'Add Finance Record';

  readonly financeRecordForm = this.formBuilder.nonNullable.group({
    id: [this.initialValue.id],
    name: [this.initialValue.name, [Validators.required, Validators.maxLength(120)]],
    description: [this.initialValue.description, [Validators.maxLength(500)]],
    recurring: [this.initialValue.recurring],
    amount: [this.initialValue.amount, [Validators.required]],
    currency: [this.initialValue.currency, [Validators.required, Validators.maxLength(3)]],
    date: [this.initialValue.date, [Validators.required]],
    recurrenceFrequency: [this.initialValue.recurrenceFrequency],
    recurrenceEndDate: [this.initialValue.recurrenceEndDate],
  });

  readonly isSubmitDisabled = toSignal(
    this.financeRecordForm.statusChanges.pipe(map(() => this.financeRecordForm.invalid)),
    { initialValue: this.financeRecordForm.invalid },
  );

  readonly isRecurringSignal = toSignal(this.financeRecordForm.controls.recurring.valueChanges, {
    initialValue: this.initialValue.recurring,
  });

  onSubmit(): void {
    if (this.financeRecordForm.invalid) {
      this.financeRecordForm.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.financeRecordForm.getRawValue());
  }

  close(): void {
    this.dialogRef.close();
  }
}
