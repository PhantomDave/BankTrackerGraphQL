import { inject, Injectable, Signal, signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
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

  constructor() {
    this.getFinanceRecordsGQL
      .watch()
      .valueChanges.pipe(
        tap((result) => {
          if (result.data?.financeRecordsForAccount) {
            const records = result.data.financeRecordsForAccount
              .filter((record) => record != null)
              .map<FinanceRecord>((record) => ({
                id: record!.id ?? 0,
                name: record!.name ?? '',
                description: record!.description ?? '',
                amount: record!.amount ?? 0,
                currency: record!.currency ?? '',
                date: new Date(record!.date ?? new Date()),
                recurring: record!.isRecurring ?? false,
                recurrenceFrequency: record!.recurrenceFrequency,
                recurrenceEndDate: record!.recurrenceEndDate
                  ? new Date(record!.recurrenceEndDate)
                  : null,
                lastProcessedDate: record!.lastProcessedDate
                  ? new Date(record!.lastProcessedDate)
                  : null,
                parentRecurringRecordId: record!.parentRecurringRecordId ?? null,
                isRecurringInstance: record!.isRecurringInstance ?? false,
              }));
            this._financeRecords.set(records);
          }
        }),
      )
      .subscribe();
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
        console.log('[FinanceRecordService] Record created, refetch triggered');
      } else {
        this._error.set('Failed to create finance record');
      }
    } catch (_error) {
      this._error.set('Failed to create finance record');
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

  async getFinanceRecords(): Promise<void> {
    // This method is now just for triggering a refetch
    // The actual data updates happen through the watch subscription
    console.log('[FinanceRecordService] getFinanceRecords called - triggering refetch');
    await firstValueFrom(this.getFinanceRecordsGQL.fetch());
  }
}
