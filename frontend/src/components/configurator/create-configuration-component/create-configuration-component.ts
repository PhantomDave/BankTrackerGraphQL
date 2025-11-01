import { Component, inject, ChangeDetectionStrategy, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FlexComponent } from '../../ui-library/flex-component/flex-component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-configuration',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FlexComponent,
  ],
  templateUrl: './create-configuration-component.html',
  styleUrl: './create-configuration-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CreateConfigurationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  configurationCreated = output<{name: string; description: string; field1: string}>();
  cancelled = output<void>();
  fields = signal<string[]>([]);

  configurationForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    rule: [''],
  });

  addField() {
    const fieldName = 'field' + (this.fields().length + 1);
    this.fields.update(current => [...current, fieldName]);
    this.configurationForm.addControl(fieldName, this.fb.control(''));
  }

  onSubmit(): void {
    // TODO: Databasestuff
    if (this.configurationForm.valid) {
      const formValue = this.configurationForm.value;
      this.configurationCreated.emit(formValue);
      this.configurationForm.reset();
    }
  }

  async onCancel(): Promise<void> {
    await this.router.navigate(['/config']);
  }
}
