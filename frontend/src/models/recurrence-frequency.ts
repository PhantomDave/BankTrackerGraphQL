// Frontend recurrence helpers aligned with GraphQL generated enum.
// We re-export the generated GraphQL enum (string values: NONE, DAILY, WEEKLY, MONTHLY, YEARLY)
// to avoid accidental numeric serialization which GraphQL rejects (IntValueNode error).
import { RecurrenceFrequency as GqlRecurrenceFrequency } from '../generated/graphql';

export const RecurrenceFrequency = GqlRecurrenceFrequency;

export interface RecurrenceOption {
  value: GqlRecurrenceFrequency;
  label: string;
}

export const RECURRENCE_OPTIONS: RecurrenceOption[] = [
  { value: RecurrenceFrequency.NONE, label: 'None' },
  { value: RecurrenceFrequency.DAILY, label: 'Daily' },
  { value: RecurrenceFrequency.WEEKLY, label: 'Weekly' },
  { value: RecurrenceFrequency.MONTHLY, label: 'Monthly' },
  { value: RecurrenceFrequency.YEARLY, label: 'Yearly' },
];
