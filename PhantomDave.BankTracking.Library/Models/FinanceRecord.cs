namespace PhantomDave.BankTracking.Library.Models;

public class FinanceRecord
{
    public int Id { get; set; }
    public int? AccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public bool IsRecurring { get; set; } = false;

    // Recurrence properties
    public RecurrenceFrequency RecurrenceFrequency { get; set; } = RecurrenceFrequency.None;
    public DateTime? RecurrenceEndDate { get; set; }
    public DateTime? LastProcessedDate { get; set; }
    public int? ParentRecurringRecordId { get; set; } // Links to the original recurring record
    public bool IsRecurringInstance { get; set; } = false; // True if this was auto-generated from a recurring record
}