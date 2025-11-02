import { inject, Injectable, signal, Signal } from '@angular/core';
import { Configuration } from './configuration';
import { firstValueFrom } from 'rxjs';
import { SnackbarService } from '../../shared/services/snackbar.service';
import {
  CreateConfigurationGQL,
  GetConfigurationsGQL,
  GetConfigurationByIdGQL,
  UpdateConfigurationGQL,
  ConfigurationInput,
} from '../../generated/graphql';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly getConfigurationsGQL = inject(GetConfigurationsGQL);
  private readonly getConfigurationByIdGQL = inject(GetConfigurationByIdGQL);
  private readonly createConfigurationGQL = inject(CreateConfigurationGQL);
  private readonly updateConfigurationGQL = inject(UpdateConfigurationGQL);
  private readonly snackbar = inject(SnackbarService);

  private readonly _configurations = signal<readonly Configuration[]>([]);
  readonly configurations: Signal<readonly Configuration[]> = this._configurations.asReadonly();

  private readonly _selectedConfiguration = signal<Configuration | null>(null);
  readonly selectedConfiguration: Signal<Configuration | null> =
    this._selectedConfiguration.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading: Signal<boolean> = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error: Signal<string | null> = this._error.asReadonly();

  async getConfigurations(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(this.getConfigurationsGQL.fetch());

      if (result?.data?.configurations) {
        this._configurations.set(result.data.configurations as Configuration[]);
      }

      if (result?.error) {
        const message = result.error.message ?? 'Errore durante il caricamento configurazioni';
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

  async getConfigurationById(id: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.getConfigurationByIdGQL.fetch({ variables: { id } }),
      );

      if (
        result?.data?.configurationById !== null &&
        result?.data?.configurationById !== undefined
      ) {
        this._selectedConfiguration.set(result.data.configurationById as Configuration);
      }

      if (result?.error) {
        const message = result.error.message ?? 'Errore durante il caricamento configurazione';
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

  async createConfiguration(input: ConfigurationInput): Promise<boolean | string> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.createConfigurationGQL.mutate({ variables: { input } }),
      );

      if (result?.data?.createConfiguration) {
        this.snackbar.success('Configurazione creata con successo');
        await this.getConfigurations();
        return true;
      }

      if (result?.error) {
        const message = result.error.message ?? 'Creazione configurazione fallita';
        this._error.set(message);
        this.snackbar.error(message);
        return message;
      }

      const message = 'Creazione configurazione fallita';
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

  async updateConfiguration(input: ConfigurationInput): Promise<boolean | string> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.updateConfigurationGQL.mutate({ variables: { input } }),
      );

      if (result?.data?.updateConfiguration) {
        this.snackbar.success('Configurazione aggiornata con successo');
        await this.getConfigurations();
        return true;
      }

      if (result?.error) {
        const message = result.error.message ?? 'Aggiornamento configurazione fallito';
        this._error.set(message);
        this.snackbar.error(message);
        return message;
      }

      const message = 'Aggiornamento configurazione fallito';
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
