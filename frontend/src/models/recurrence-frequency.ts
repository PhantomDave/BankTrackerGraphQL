export enum RecurrenceFrequency {
  None = 0,
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
  Yearly = 4,
}

export interface RecurrenceOption {
  value: RecurrenceFrequency;
  label: string;
}

export const RECURRENCE_OPTIONS: RecurrenceOption[] = [
  { value: RecurrenceFrequency.None, label: 'None' },
  { value: RecurrenceFrequency.Daily, label: 'Daily' },
  { value: RecurrenceFrequency.Weekly, label: 'Weekly' },
  { value: RecurrenceFrequency.Monthly, label: 'Monthly' },
  { value: RecurrenceFrequency.Yearly, label: 'Yearly' },
];
