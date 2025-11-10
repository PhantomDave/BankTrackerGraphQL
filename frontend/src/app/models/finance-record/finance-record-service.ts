import { inject, Injectable, Signal, signal } from '@angular/core';
import { FinanceRecord } from './finance-record';
import { CreateFinanceRecordGQL, GetFinanceRecordsGQL } from '../../../generated/graphql';
import { RecurrenceFrequency } from '../../../models/recurrence-frequency';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

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
    date: any;
    isRecurring: boolean;
  }): FinanceRecord {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      date: new Date(data.date),
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
        })) ?? [];

      this._financeRecords.set(records);
    } catch (_error) {
      this._error.set('Failed to fetch finance records');
    } finally {
      this._loading.set(false);
    }
  }
}
