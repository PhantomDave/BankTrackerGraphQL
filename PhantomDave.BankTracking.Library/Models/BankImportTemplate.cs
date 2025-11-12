namespace PhantomDave.BankTracking.Library.Models;

public class BankImportTemplate
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public string BankName { get; set; } = string.Empty;
    public Dictionary<string, string> ColumnMappings { get; set; } = new();
    public string DateFormat { get; set; } = "dd/MM/yyyy";
    public string DecimalSeparator { get; set; } = ".";
    public string ThousandsSeparator { get; set; } = ",";
    public bool IsDefault { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}