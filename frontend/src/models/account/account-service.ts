import {inject, Injectable, signal, Signal} from '@angular/core';
import {Account} from './account';
import {firstValueFrom} from 'rxjs';
import { SnackbarService } from '../../shared/services/snackbar.service';
import {
  CreateAccountGQL,
  GetAccountByEmailGQL,
  GetAccountsGQL,
  LoginAccountGQL
} from '../../generated/graphql';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly createAccountGQL = inject(CreateAccountGQL);
  private readonly getAccountByEmailGQL = inject(GetAccountByEmailGQL);
  private readonly getAccountsGQL = inject(GetAccountsGQL);
  private readonly loginAccountGQL = inject(LoginAccountGQL);
  private readonly snackbar = inject(SnackbarService);

  private readonly _selectedAccount = signal<Account | null>(null);
  readonly selectedAccount: Signal<Account | null> = this._selectedAccount.asReadonly();

  private readonly _accounts = signal<readonly Account[]>([]);
  readonly accounts: Signal<readonly Account[]> = this._accounts.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading: Signal<boolean> = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error: Signal<string | null> = this._error.asReadonly();

  async getAccountByEmail(email: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.getAccountByEmailGQL.fetch({ variables: { email } })
      );

      if (result?.data?.accountByEmail !== null && result?.data?.accountByEmail !== undefined) {
        this._selectedAccount.set(result.data.accountByEmail as Account);
      }

      if (result && (result as any).error) {
        const message = (result as any).error?.message ?? 'Errore durante il caricamento account';
        this._error.set(message);
        this.snackbar.error(message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore imprevisto';
      this._error.set(message);
      this.snackbar.error(message);
    } finally {
      this._loading.set(false);
    }
  }

  async createAccount(email: string, password: string): Promise<boolean | string> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.createAccountGQL.mutate({ variables: { email, password } })
      );

      if (result?.data?.createAccount) {
        this.snackbar.success('Account creato con successo');
        return true;
      }

      if (result && (result as any).error) {
        const message = (result as any).error?.message ?? 'Creazione account fallita';
        this._error.set(message);
        this.snackbar.error(message);
        return message;
      }

      const message = 'Creazione account fallita';
      this._error.set(message);
      this.snackbar.error(message);
      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore imprevisto';
      this._error.set(message);
      this.snackbar.error(message);
      return message;
    } finally {
      this._loading.set(false);
    }
  }

  async loginAccount(email: string, password: string): Promise<Account | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.loginAccountGQL.mutate({ variables: { email, password } })
      );

      if (result?.data?.loginAccount) {
        const account = result.data.loginAccount as Account;
        this._selectedAccount.set(account);
        this.snackbar.success('Login effettuato con successo');
        return account;
      }

      if (result && (result as any).error) {
        const message = (result as any).error?.message ?? 'Login fallito';
        this._error.set(message);
        this.snackbar.error(message);
      }

      return null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore imprevisto';
      this._error.set(message);
      this.snackbar.error(message);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async getAllAccounts(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.getAccountsGQL.fetch({})
      );

      if (result?.data?.accounts) {
        this._accounts.set(result.data.accounts as readonly Account[]);
      }

      if (result && (result as any).error) {
        const message = (result as any).error?.message ?? 'Errore durante il caricamento degli account';
        this._error.set(message);
        this.snackbar.error(message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore imprevisto';
      this._error.set(message);
      this.snackbar.error(message);
    } finally {
      this._loading.set(false);
    }
  }
}
