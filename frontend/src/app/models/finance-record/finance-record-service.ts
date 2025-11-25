import { inject, Injectable, Signal, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CreateFinanceRecordGQL,
  DeleteFinanceRecordGQL,
  DeleteImportedFinanceRecordGQL,
  GetFinanceRecordsGQL,
  GetMonthlyComparisonGQL,
  GetMonthlyComparisonQuery,
  RecurrenceFrequency,
  UpdateFinanceRecordGQL,
} from '../../../generated/graphql';
import { FinanceRecord } from './finance-record';

@Injectable({
  providedIn: 'root',
})
export class FinanceRecordService {
  private readonly createFinanceRecordGQL = inject(CreateFinanceRecordGQL);
  private readonly getFinanceRecordsGQL = inject(GetFinanceRecordsGQL);
  private readonly updateFinanceRecordGQL = inject(UpdateFinanceRecordGQL);
  private readonly deleteFinanceRecordGQL = inject(DeleteFinanceRecordGQL);
  private readonly getMonthlyComparisonGQL = inject(GetMonthlyComparisonGQL);
  private readonly deleteImportedFinanceRecordGQL = inject(DeleteImportedFinanceRecordGQL);

  private readonly _monthlyComparison = signal<
    GetMonthlyComparisonQuery['monthlyComparison'] | null
  >(null);
  readonly monthlyComparison: Signal<GetMonthlyComparisonQuery['monthlyComparison'] | null> =
    this._monthlyComparison.asReadonly();

  private readonly _selectedFinanceRecord = signal<FinanceRecord | null>(null);
  readonly selectedFinanceRecord: Signal<FinanceRecord | null> =
    this._selectedFinanceRecord.asReadonly();

  private readonly _financeRecords = signal<readonly FinanceRecord[]>([]);
  readonly financeRecords: Signal<readonly FinanceRecord[]> = this._financeRecords.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading: Signal<boolean> = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error: Signal<string | null> = this._error.asReadonly();

  async updateFinanceRecord(record: FinanceRecord): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.updateFinanceRecordGQL.mutate({
          variables: {
            id: record.id!,
            name: record.name,
            description: record.description,
            amount: record.amount,
            currency: record.currency,
            date: record.date.toISOString(),
            isRecurring: record.recurring,
            recurrenceFrequency: record.recurrenceFrequency,
            recurrenceEndDate: record.recurrenceEndDate
              ? record.recurrenceEndDate.toISOString()
              : undefined,
          },
          refetchQueries: ['getFinanceRecords'],
        }),
      );

      if (result?.data?.updateFinanceRecord) {
        const updatedRecord = this.mapToFinanceRecord(result.data.updateFinanceRecord);
        this._selectedFinanceRecord.set(updatedRecord);
      } else {
        this._error.set('Failed to update finance record');
      }
    } catch {
      this._error.set('Failed to update finance record');
    } finally {
      this._loading.set(false);
    }
  }

  async getMonthlyComparison(startDate?: Date, endDate?: Date): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.getMonthlyComparisonGQL.fetch({
          variables: {
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
          },
        }),
      );

      if (result?.data?.monthlyComparison) {
        this._monthlyComparison.set(result.data.monthlyComparison);
      } else {
        this._error.set('Failed to fetch monthly comparison data');
      }
    } catch (error) {
      this._error.set(`Failed to fetch monthly comparison data: ${error}`);
    } finally {
      this._loading.set(false);
    }
  }

  async createFinanceRecord(record: FinanceRecord): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.createFinanceRecordGQL.mutate({
          variables: {
            newRecord: {
              name: record.name,
              description: record.description,
              isRecurring: record.recurring,
              amount: record.amount,
              currency: record.currency,
              date: record.date.toISOString(),
              recurrenceFrequency: record.recurrenceFrequency,
              recurrenceEndDate: record.recurrenceEndDate
                ? record.recurrenceEndDate.toISOString()
                : undefined,
            },
          },
          refetchQueries: ['getFinanceRecords'],
        }),
      );

      if (result?.data?.createFinanceRecord) {
        const newRecord = this.mapToFinanceRecord(result.data.createFinanceRecord);
        this._selectedFinanceRecord.set(newRecord);
      } else {
        this._error.set('Failed to create finance record');
      }
    } catch {
      this._error.set('Failed to create finance record');
    } finally {
      this._loading.set(false);
    }
  }

  async deleteFinanceRecordAsync(id: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.deleteFinanceRecordGQL.mutate({
          variables: {
            id,
          },
        }),
      );

      if (result?.data?.deleteFinanceRecord) {
        this._selectedFinanceRecord.set(null);
        this._financeRecords.update((records) => records.filter((record) => record.id !== id));
      }
    } catch {
      this._error.set('Failed to fetch finance records');
    } finally {
      this._loading.set(false);
    }
  }

  private mapToFinanceRecord(data: {
    id: number;
    name: string;
    description: string;
    amount: number;
    currency: string;
    date: string;
    isRecurring: boolean;
    isRecurringInstance: boolean;
    recurrenceFrequency?: RecurrenceFrequency;
    recurrenceEndDate?: string | null;
    lastProcessedDate?: string | null;
  }): FinanceRecord {
    return {
      ...data,
      date: new Date(data.date),
      recurrenceEndDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : undefined,
      lastProcessedDate: data.lastProcessedDate ? new Date(data.lastProcessedDate) : undefined,
      recurring: data.isRecurring,
    };
  }

  async deleteAllImportedData(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await firstValueFrom(
        this.deleteImportedFinanceRecordGQL.mutate({ refetchQueries: ['getFinanceRecords'] }),
      );
    } catch (error) {
      this._error.set(`Failed to delete imported finance records: ${error}`);
    } finally {
      this._loading.set(false);
    }
  }

  async getFinanceRecords(startDate: Date, endDate: Date): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.getFinanceRecordsGQL.fetch({
          variables: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }),
      );

      if (result?.data?.financeRecordsForAccount) {
        const records = result.data.financeRecordsForAccount.map((record) =>
          this.mapToFinanceRecord(record),
        );
        this._financeRecords.set(records);
      } else {
        this._error.set('Failed to fetch finance records');
      }
    } catch (error) {
      this._error.set(`Failed to fetch finance records: ${error}`);
    } finally {
      this._loading.set(false);
    }
  }
}
