import { inject, Injectable, Signal, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import {
  CreateFinanceRecordGQL,
  GetFinanceRecordsGQL,
  RecurrenceFrequency,
} from '../../../generated/graphql';
import { FinanceRecord } from './finance-record';

@Injectable({
  providedIn: 'root',
})
export class FinanceRecordService {
  private readonly createFinanceRecordGQL = inject(CreateFinanceRecordGQL);
  private readonly getFinanceRecordsGQL = inject(GetFinanceRecordsGQL);

  private readonly _selectedFinanceRecord = signal<FinanceRecord | null>(null);
  readonly selectedFinanceRecord: Signal<FinanceRecord | null> =
    this._selectedFinanceRecord.asReadonly();

  private readonly _financeRecords = signal<readonly FinanceRecord[]>([]);
  readonly financeRecords: Signal<readonly FinanceRecord[]> = this._financeRecords.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading: Signal<boolean> = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error: Signal<string | null> = this._error.asReadonly();

  async createFinanceRecord(record: FinanceRecord): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

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
      }),
    );

    if (result?.data?.createFinanceRecord) {
      const newRecord = this.mapToFinanceRecord(result.data.createFinanceRecord);
      this._selectedFinanceRecord.set(newRecord);
      this._financeRecords.update((prev) => [...prev, newRecord]);
    } else {
      this._error.set('Failed to create finance record');
    }
    this._loading.set(false);
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

  async getFinanceRecords(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(this.getFinanceRecordsGQL.fetch());

      const records =
        result.data?.financeRecordsForAccount.map<FinanceRecord>((record) => ({
          id: record.id,
          name: record.name,
          description: record.description,
          amount: record.amount,
          currency: record.currency,
          date: new Date(record.date),
          recurring: record.isRecurring,
          recurrenceFrequency: record.recurrenceFrequency,
          recurrenceEndDate: record.recurrenceEndDate ? new Date(record.recurrenceEndDate) : null,
          lastProcessedDate: record.lastProcessedDate ? new Date(record.lastProcessedDate) : null,
          parentRecurringRecordId: record.parentRecurringRecordId,
          isRecurringInstance: record.isRecurringInstance,
        })) ?? [];

      this._financeRecords.set(records);
    } catch (_error) {
      this._error.set('Failed to fetch finance records');
    } finally {
      this._loading.set(false);
    }
  }
}
