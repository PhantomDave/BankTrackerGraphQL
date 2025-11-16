namespace PhantomDave.BankTracking.Api.Types.ObjectTypes;

public record MonthlyComparisonType
{
    public IEnumerable<MonthlyStatisticsType> MonthlyData { get; init; } = [];
    public int TotalMonthsAnalyzed { get; init; }
    public decimal OverallAverageIncome { get; init; }
    public decimal OverallAverageExpense { get; init; }
    public MonthlyStatisticsType? HighestSpendingMonth { get; init; }
    public MonthlyStatisticsType? LowestSpendingMonth { get; init; }
}