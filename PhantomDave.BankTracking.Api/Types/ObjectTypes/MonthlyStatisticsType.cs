namespace PhantomDave.BankTracking.Api.Types.ObjectTypes;

public record MonthlyStatisticsType
{
    public int Year { get; init; }
    public int Month { get; init; }
    public decimal TotalIncome { get; init; }
    public decimal TotalExpense { get; init; }
    public decimal NetAmount { get; init; }
    public int TransactionCount { get; init; }
    public decimal AverageTransactionAmount { get; init; }
    public string MostExpensiveCategory { get; init; } = string.Empty;
    public decimal RecurringExpenseTotal { get; init; }
    public decimal RecurringIncomeTotal { get; init; }
}