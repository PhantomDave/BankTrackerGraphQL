import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import {WelcomeLayoutComponent} from '../welcome-layout-component/welcome-layout-component';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexComponent} from '../../flex-component/flex-component';
import {AccountService} from '../../../../models/account/account-service';

@Component({
  selector: 'app-login-component',
  imports: [
    WelcomeLayoutComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FlexComponent
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);

  protected readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected async onSubmit() {
    if (this.loginForm.valid) {
      const {email, password} = this.loginForm.value;
      await this.accountService.loginAccount(email, password);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
