import { inject, Injectable, Signal, signal } from '@angular/core';
import { FinanceRecord } from './finance-record';
import { CreateFinanceRecordGQL, GetFinanceRecordsGQL } from '../../../generated/graphql';
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
          },
        },
      }),
    );

    if (result) {
      this._selectedFinanceRecord.set({
        id: result.data?.createFinanceRecord.id ?? 0,
        name: result.data?.createFinanceRecord.name ?? '',
        description: result.data?.createFinanceRecord.description ?? '',
        amount: result.data?.createFinanceRecord.amount ?? 0,
        currency: result.data?.createFinanceRecord.currency ?? '',
        date: new Date(result.data?.createFinanceRecord.date ?? ''),
        recurring: result.data?.createFinanceRecord.isRecurring ?? false,
      });
      this._financeRecords.update((prev) => [
        ...prev,
        {
          id: result.data?.createFinanceRecord.id ?? 0,
          name: result.data?.createFinanceRecord.name ?? '',
          description: result.data?.createFinanceRecord.description ?? '',
          amount: result.data?.createFinanceRecord.amount ?? 0,
          currency: result.data?.createFinanceRecord.currency ?? '',
          date: new Date(result.data?.createFinanceRecord.date ?? ''),
          recurring: result.data?.createFinanceRecord.isRecurring ?? false,
        },
      ]);
    } else {
      this._error.set('Failed to create finance record');
    }
    this._loading.set(false);
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
