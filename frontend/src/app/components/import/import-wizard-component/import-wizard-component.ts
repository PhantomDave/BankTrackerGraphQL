import { Component, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { Step1UploadComponent } from './steps/step1-upload.component';
import { Step2DetectComponent } from './steps/step2-detect.component';
import { FlexComponent } from '../../ui-library/flex-component/flex-component';
import { ImportService } from '../../../models/import/import-service';
import { Step3ConfigureComponent } from './steps/step3-configure.component';

@Component({
  selector: 'app-import-wizard-component',
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    Step1UploadComponent,
    Step2DetectComponent,
    FlexComponent,
    Step3ConfigureComponent,
  ],
  templateUrl: './import-wizard-component.html',
  styleUrl: './import-wizard-component.css',
})
export class ImportWizardComponent {
  private readonly importService = inject(ImportService);

  readonly preview = computed(() => this.importService.preview());

  isLinear = false;
}
