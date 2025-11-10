import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

import { AccountService } from '../../../models/account/account-service';
import { FlexComponent } from '../../ui-library/flex-component/flex-component';
import { WelcomeLayoutComponent } from '../welcome-layout-component/welcome-layout-component';

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
  private readonly router = inject(Router);

  protected readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected async onSubmit() {
    if (this.loginForm.valid) {
      const {email, password} = this.loginForm.value;
      const resp = await this.accountService.login(email, password);
      if(resp) {
        await this.router.navigate(['home']);
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
