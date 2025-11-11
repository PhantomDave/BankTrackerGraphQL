import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
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

  ngOnInit() {
    this.accountService.getAccountByEmail(this.account()?.email ?? '');

    effect(
      () => {
        const account = this.account();
        if (!account) {
          return;
        }

        this.accountForm.patchValue(
          {
            email: account.email,
            currentBalance: account.currentBalance ?? 0,
          },
          { emitEvent: false },
        );
        this.accountForm.markAsPristine();
      },
      { allowSignalWrites: true },
    );
  }

  protected async onSubmit(): Promise<void> {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    const { email, currentBalance } = this.accountForm.getRawValue();
    const parsedBalance = Number(currentBalance);
    await this.accountService.updateAccount(email, Number.isNaN(parsedBalance) ? 0 : parsedBalance);
  }
}
