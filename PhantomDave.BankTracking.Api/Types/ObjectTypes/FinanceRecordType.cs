using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.ObjectTypes;

public record FinanceRecordType
{
    public int Id { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public DateTime Date { get; init; }
    public bool IsRecurring { get; init; }

    public static FinanceRecordType FromFinanceRecord(FinanceRecord record) =>
        new()
        {
            Id = record.Id,
            Amount = record.Amount,
            Currency = record.Currency,
            Description = record.Description,
            Date = record.Date,
            IsRecurring = record.IsRecurring
        };
}

