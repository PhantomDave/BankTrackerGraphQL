import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import {WelcomeLayoutComponent} from '../welcome-layout-component/welcome-layout-component';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexComponent} from '../../ui-library/flex-component/flex-component';
import {AccountService} from '../../../models/account/account-service';
import {Router} from '@angular/router';

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
