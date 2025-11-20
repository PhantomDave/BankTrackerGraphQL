import { Component, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmationDialogModel {
  title: string;
  content: string;
  field?: string;
  defaultButtonText?: string;
  action?: { text: string; action: () => void }[];
}
@Component({
  selector: 'app-confirmation-dialog-component',
  templateUrl: './confirmation-dialog-component.component.html',
  styleUrls: ['./confirmation-dialog-component.component.css'],
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmationDialogComponentComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponentComponent>);
  readonly data = inject<ConfirmationDialogModel>(MAT_DIALOG_DATA);
  readonly dataModel = model(this.data);

  closeDialog() {
    this.dialogRef.close();
  }
}
