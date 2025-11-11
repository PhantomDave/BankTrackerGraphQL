import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AccountService } from '../../models/account/account-service';

@Component({
  selector: 'app-settings-component',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './settings-component.html',
  styleUrl: './settings-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  private readonly accountService = inject(AccountService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly account = this.accountService.selectedAccount;
  protected readonly loading = this.accountService.loading;
  protected readonly error = this.accountService.error;

  protected readonly accountForm = this.formBuilder.nonNullable.group({
    email: [this.account()?.email ?? '', [Validators.required, Validators.email]],
    currentBalance: [this.account()?.currentBalance ?? 0, [Validators.required]],
  });

  private readonly syncAccountForm = effect(() => {
    const account = this.account();
    if (!account) {
      return;
    }

    const nextEmail = account.email ?? '';
    const nextBalance = account.currentBalance ?? 0;

    const emailControl = this.accountForm.controls.email;
    const balanceControl = this.accountForm.controls.currentBalance;

    if (emailControl.value === nextEmail && balanceControl.value === nextBalance) {
      return;
    }

    this.accountForm.patchValue(
      {
        email: nextEmail,
        currentBalance: nextBalance,
      },
      {
        emitEvent: false,
      },
    );

    this.accountForm.markAsPristine();
    this.accountForm.markAsUntouched();
  });

  ngOnInit() {
    this.accountService.getUserAccount();
  }

  protected async onSubmit(): Promise<void> {
    let email = this.account()?.email;
    let balance = this.account()?.currentBalance;

    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    if (this.accountForm.get('email')?.touched) {
      email = this.accountForm.get('email')?.value;
    }

    if (this.accountForm.get('currentBalance')?.touched) {
      balance = this.accountForm.get('currentBalance')?.value;
    }

    await this.accountService.updateAccount(email!, balance ?? 0);
  }
}
