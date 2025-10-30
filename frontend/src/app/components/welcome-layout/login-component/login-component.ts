import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import {WelcomeLayoutComponent} from '../welcome-layout-component/welcome-layout-component';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexComponent} from '../../flex-component/flex-component';

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

  protected readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected onSubmit() {
    if (this.loginForm.valid) {
      const {email, password} = this.loginForm.value;
      console.log('Email:', email);
      console.log('Password:', password);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
