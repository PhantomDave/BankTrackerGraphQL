import { firstValueFrom } from 'rxjs';

import { inject, Injectable, signal, Signal } from '@angular/core';
import type { GraphQLError } from 'graphql';

import {
  CreateAccountGQL,
  GetAccountByEmailGQL,
  GetUserAccountGQL,
  LoginGQL,
  UpdateAccountGQL,
  VerifyTokenGQL,
} from '../../../generated/graphql';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { SessionData } from '../session-data';
import { Account } from './account';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly createAccountGQL = inject(CreateAccountGQL);
  private readonly getAccountByEmailGQL = inject(GetAccountByEmailGQL);
  private readonly snackbar = inject(SnackbarService);
  private readonly loginGQL = inject(LoginGQL);
  private readonly verifyTokenGQL = inject(VerifyTokenGQL);
  private readonly updateAccountGQL = inject(UpdateAccountGQL);
  private readonly getUserAccountGQL = inject(GetUserAccountGQL);

  private readonly _isAuthenticated = signal<boolean>(false);
  readonly isAuthenticated: Signal<boolean> = this._isAuthenticated.asReadonly();

  private readonly _selectedAccount = signal<Account | null>(null);
  readonly selectedAccount: Signal<Account | null> = this._selectedAccount.asReadonly();

  private readonly _accounts = signal<readonly Account[]>([]);
  readonly accounts: Signal<readonly Account[]> = this._accounts.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading: Signal<boolean> = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error: Signal<string | null> = this._error.asReadonly();

  private extractGraphQLError(result: unknown, fallback: string): string | null {
    const errors =
      (result as { errors?: readonly GraphQLError[] | null | undefined })?.errors ?? [];
    if (errors.length > 0) {
      return errors[0]?.message ?? fallback;
    }
    return null;
  }

  constructor() {
    const token = localStorage.getItem('sessionData');
    this._isAuthenticated.set(token !== null);
  }

  async getAccountByEmail(email: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.getAccountByEmailGQL.fetch({ variables: { email } }),
      );

      if (result?.data?.accountByEmail !== null && result?.data?.accountByEmail !== undefined) {
        const account = result.data.accountByEmail;
        this._selectedAccount.set({
          id: account.id,
          email: account.email,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt ?? null,
          currentBalance: account.currentBalance || undefined,
        });
      }

      const gqlMessage = this.extractGraphQLError(result, 'Errore durante il caricamento account');
      if (gqlMessage) {
        this._error.set(gqlMessage);
        this.snackbar.error(gqlMessage);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore imprevisto';
      this._error.set(message);
      this.snackbar.error(message);
    } finally {
      this._loading.set(false);
    }
  }

  async verifyToken(): Promise<boolean> {
    const resp = await firstValueFrom(this.verifyTokenGQL.fetch());
    return !!resp.data?.isAValidJwt;
  }

  async createAccount(email: string, password: string): Promise<boolean | string> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.createAccountGQL.mutate({ variables: { email, password } }),
      );

      if (result?.data?.createAccount) {
        this.snackbar.success('Account creato con successo');
        return true;
      }

      const gqlMessage = this.extractGraphQLError(result, 'Creazione account fallita');
      if (gqlMessage) {
        this._error.set(gqlMessage);
        this.snackbar.error(gqlMessage);
        return gqlMessage;
      }

      const fallbackMessage = 'Creazione account fallita';
      this._error.set(fallbackMessage);
      this.snackbar.error(fallbackMessage);
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
      const result = await firstValueFrom(this.loginGQL.mutate({ variables: { email, password } }));

      const token = result?.data?.login?.token;
      const account = result?.data?.login?.account;
      if (token && account) {
        const sessionData: SessionData = {
          token,
          lastCheck: Date.now(),
          isValid: true,
        };
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        this._selectedAccount.set({
          id: account.id,
          email: account.email,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt ?? null,
          currentBalance: account.currentBalance || undefined,
        });
        this._isAuthenticated.set(true);
        this.snackbar.success('Login effettuato');
        return true;
      }

      const gqlMessage = this.extractGraphQLError(result, 'Credenziali non valide');
      if (gqlMessage) {
        this._error.set(gqlMessage);
        this.snackbar.error(gqlMessage);
        return gqlMessage;
      }

      const fallbackMessage = 'Credenziali non valide';
      this._error.set(fallbackMessage);
      this.snackbar.error(fallbackMessage);
      return fallbackMessage;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore imprevisto';
      this._error.set(message);
      this.snackbar.error(message);
      return message;
    } finally {
      this._loading.set(false);
    }
  }

  async getUserAccount(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const result = await firstValueFrom(this.getUserAccountGQL.fetch());

      if (result?.data?.userAccount) {
        const account = result.data.userAccount;
        const acc: Account = {
          id: account.id,
          email: account.email,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt ?? null,
          currentBalance: account.currentBalance || undefined,
        };
        this._selectedAccount.set(acc);
        return;
      }

      const gqlMessage = this.extractGraphQLError(result, 'Errore durante il caricamento account');
      if (gqlMessage) {
        this._error.set(gqlMessage);
        this.snackbar.error(gqlMessage);
        throw new Error(gqlMessage);
      }

      const fallbackMessage = 'Errore durante il caricamento account';
      this._error.set(fallbackMessage);
      this.snackbar.error(fallbackMessage);
      throw new Error(fallbackMessage);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore imprevisto';
      this._error.set(message);
      this.snackbar.error(message);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  logout(): void {
    localStorage.removeItem('sessionData');
    this._selectedAccount.set(null);
    this._isAuthenticated.set(false);
  }

  async updateAccount(email: string, currentBalance: number): Promise<boolean | string> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.updateAccountGQL.mutate({
          variables: {
            email,
            currentBalance,
          },
        }),
      );

      const updatedAccount = result?.data?.updateAccount;
      if (updatedAccount) {
        this._selectedAccount.set({
          id: updatedAccount.id,
          email: updatedAccount.email,
          createdAt: updatedAccount.createdAt,
          updatedAt: updatedAccount.updatedAt ?? null,
          currentBalance: updatedAccount.currentBalance || undefined,
        });
        this.snackbar.success('Account aggiornato');
        return true;
      }

      const gqlMessage = this.extractGraphQLError(result, 'Aggiornamento account non riuscito');
      if (gqlMessage) {
        this._error.set(gqlMessage);
        this.snackbar.error(gqlMessage);
        return gqlMessage;
      }

      const fallbackMessage = 'Aggiornamento account non riuscito';
      this._error.set(fallbackMessage);
      this.snackbar.error(fallbackMessage);
      return fallbackMessage;
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
