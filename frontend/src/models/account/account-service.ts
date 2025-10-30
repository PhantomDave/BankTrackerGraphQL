import {inject, Injectable, signal, Signal} from '@angular/core';
import {Account} from './account';
import {firstValueFrom} from 'rxjs';
import { SnackbarService } from '../../shared/services/snackbar.service';
import {
  CreateAccountGQL,
  GetAccountByEmailGQL,
  GetAccountsGQL,
  LoginAccountGQL,
  LoginGQL
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
  private readonly loginGQL = inject(LoginGQL);

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

  async login(email: string, password: string): Promise<boolean | string> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const result = await firstValueFrom(
        this.loginGQL.mutate({ variables: { email, password } })
      );

      const token = result?.data?.login?.token;
      const account = result?.data?.login?.account;
      if (token && account) {
        localStorage.setItem('auth_token', token);
        this._selectedAccount.set({
          id: account.id,
          email: account.email,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt ?? null
        });
        this.snackbar.success('Login effettuato');
        return true;
      }

      const message = 'Credenziali non valide';
      this._error.set(message);
      this.snackbar.error(message);
      return message;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore imprevisto';
      this._error.set(message);
      this.snackbar.error(message);
      return message;
    } finally {
      this._loading.set(false);
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this._selectedAccount.set(null);
  }
}
