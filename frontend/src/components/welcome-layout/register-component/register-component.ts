import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import {WelcomeLayoutComponent} from '../welcome-layout-component/welcome-layout-component';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexComponent} from '../../flex-component/flex-component';
import {AccountService} from '../../../models/account/account-service';
import {SnackbarService} from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-register-component',
  imports: [
    WelcomeLayoutComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FlexComponent
  ],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly _accountService = inject(AccountService);
  private readonly _snackbarService = inject(SnackbarService);
  protected readonly registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected async onSubmit() {
    if (this.registerForm.valid) {
      const {email, password} = this.registerForm.value;
      const result = await this._accountService.createAccount(email, password);
      if(typeof result === 'boolean') {
        if(result) {
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
