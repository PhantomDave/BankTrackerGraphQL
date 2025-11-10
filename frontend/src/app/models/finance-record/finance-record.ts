import { RecurrenceFrequency } from '../../../models/recurrence-frequency';

export interface FinanceRecord {
  id?: number;
  name: string;
  description: string;
  recurring: boolean;
  amount: number;
  currency: string;
  date: Date;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceEndDate?: Date | null;
  lastProcessedDate?: Date | null;
  parentRecurringRecordId?: number | null;
  isRecurringInstance?: boolean;
}
