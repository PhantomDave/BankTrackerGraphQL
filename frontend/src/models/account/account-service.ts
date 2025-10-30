import {inject, Injectable, signal, Signal} from '@angular/core';
import {Account} from './account';
import {Apollo} from 'apollo-angular';
import {GET_ACCOUNT_BY_EMAIL} from './account.queries';
import {firstValueFrom} from 'rxjs';
import {CREATE_ACCOUNT} from './account.mutations';
import { SnackbarService } from '../../shared/services/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly apollo = inject(Apollo);
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
        this.apollo.query<{ accountByEmail: Account | null }>({
          query: GET_ACCOUNT_BY_EMAIL,
          variables: {email}
        })
      );

      if (result?.data?.accountByEmail !== null && result?.data?.accountByEmail !== undefined) {
        this._selectedAccount.set(result.data.accountByEmail);
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
      const result = await firstValueFrom(this.apollo.mutate<{createAccount: Account | null}>({
        mutation: CREATE_ACCOUNT,
        variables: {email, password}
      }));

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
}
