export interface FinanceRecord {
  name: string;
  description: string;
  recurring: boolean;
  amount: number;
  currency: string;
  date: Date;
}
