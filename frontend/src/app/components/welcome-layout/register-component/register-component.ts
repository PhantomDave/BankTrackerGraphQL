import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AccountService } from '../../../models/account/account-service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { FlexComponent } from '../../ui-library/flex-component/flex-component';
import { WelcomeLayoutComponent } from '../welcome-layout-component/welcome-layout-component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-component',
  imports: [
    WelcomeLayoutComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FlexComponent,
  ],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly _accountService = inject(AccountService);
  private readonly _snackbarService = inject(SnackbarService);
  private readonly router = inject(Router);
  protected readonly registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected async redirectToLogin() {
    await this.router.navigate(['login']);
  }

  protected async onSubmit() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      const result = await this._accountService.createAccount(email, password);
      if (typeof result === 'boolean') {
        if (result) {
          this._snackbarService.success('Account created successfully!');
        } else {
          this._snackbarService.error('Failed to create account. Please try again.');
        }
      }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
