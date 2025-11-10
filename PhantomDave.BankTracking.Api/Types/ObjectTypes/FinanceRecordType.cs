using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.ObjectTypes;

public record FinanceRecordType
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public DateTime Date { get; init; }
    public bool IsRecurring { get; init; }
    public RecurrenceFrequency RecurrenceFrequency { get; init; }
    public DateTime? RecurrenceEndDate { get; init; }
    public DateTime? LastProcessedDate { get; init; }
    public int? ParentRecurringRecordId { get; init; }
    public bool IsRecurringInstance { get; init; }

    public static FinanceRecordType FromFinanceRecord(FinanceRecord record) =>
        new()
        {
            Id = record.Id,
            Name = record.Name,
            Amount = record.Amount,
            Currency = record.Currency,
            Description = record.Description,
            Date = record.Date,
            IsRecurring = record.IsRecurring,
            RecurrenceFrequency = record.RecurrenceFrequency,
            RecurrenceEndDate = record.RecurrenceEndDate,
            LastProcessedDate = record.LastProcessedDate,
            ParentRecurringRecordId = record.ParentRecurringRecordId,
            IsRecurringInstance = record.IsRecurringInstance
        };
}
