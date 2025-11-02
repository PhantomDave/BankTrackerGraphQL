import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FlexComponent } from '../../ui-library/flex-component/flex-component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-configuration',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FlexComponent,
    MatIconModule,
  ],
  templateUrl: './create-configuration-component.html',
  styleUrl: './create-configuration-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateConfigurationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  configurationCreated = output<{ name: string; description: string; field1: string }>();
  cancelled = output<void>();

  validateTotalEquals100 = (group: AbstractControl): { [key: string]: unknown } | null => {
    const arr = group.get('fields') as FormArray | null;
    if (!arr || arr.length === 0) return null;
    const sum = arr.controls.reduce(
      (sum, control) => sum + Number(control.get('value')?.value || 0),
      0,
    );
    return sum === 100 ? null : { totalMustBe100: true };
  };

  configurationForm: FormGroup = this.fb.group(
    {
      name: ['', Validators.required],
      description: [''],
      rule: [''],
      fields: this.fb.array<FormGroup>([]),
    },
    { validators: this.validateTotalEquals100 },
  );

  get fields(): FormArray {
    return this.configurationForm.get('fields') as FormArray;
  }

  addField(): void {
    const fg = this.fb.group({
      name: ['', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
    });
    this.fields.push(fg);
  }

  removeField(index: number): void {
    this.fields.removeAt(index);
  }

  onSubmit(): void {
    if (this.configurationForm.valid) {
      const formValue = this.configurationForm.value;
      const values = this.configurationForm.getRawValue() as Record<string, unknown>;
      const json = JSON.stringify(values, null, 2);
      console.log(json);
      this.configurationCreated.emit(formValue);
      this.configurationForm.reset();
    }
  }

  async onCancel(): Promise<void> {
    await this.router.navigate(['/config']);
  }
}
