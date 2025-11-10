import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
import { map } from 'rxjs';
import { FinanceRecord } from '../../../models/finance-record';

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
  ],
  templateUrl: './add-entry.html',
  styleUrl: './add-entry.css',
})
export class AddEntry {
  private readonly dialogRef = inject(MatDialogRef<AddEntry, FinanceRecord | undefined>);
  private readonly dialogData = inject(MAT_DIALOG_DATA) as FinanceRecordDialogData;
  private readonly formBuilder = inject(FormBuilder);

  private readonly initialValue: FinanceRecord = {
    name: this.dialogData?.name ?? '',
    description: this.dialogData?.description ?? '',
    recurring: this.dialogData?.recurring ?? false,
    amount: this.dialogData?.amount ?? 0,
    currency: this.dialogData?.currency ?? '',
    date: this.dialogData?.date ? new Date(this.dialogData.date) : new Date(),
  };

  readonly dialogTitle = this.dialogData ? 'Edit Finance Record' : 'Add Finance Record';

  readonly financeRecordForm = this.formBuilder.nonNullable.group({
    name: [this.initialValue.name, [Validators.required, Validators.maxLength(120)]],
    description: [this.initialValue.description, [Validators.maxLength(500)]],
    recurring: [this.initialValue.recurring],
    amount: [this.initialValue.amount, [Validators.required, Validators.min(0.01)]],
    currency: [this.initialValue.currency, [Validators.required, Validators.maxLength(3)]],
    date: [this.initialValue.date, [Validators.required]],
  });

  private readonly formInvalidSignal = toSignal(
    this.financeRecordForm.statusChanges.pipe(map(() => this.financeRecordForm.invalid)),
    { initialValue: this.financeRecordForm.invalid },
  );

  readonly isSubmitDisabled = computed(() => this.formInvalidSignal());

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
