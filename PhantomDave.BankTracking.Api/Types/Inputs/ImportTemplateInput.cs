namespace PhantomDave.BankTracking.Api.Types.Inputs;

public class ImportTemplateInput
{
    public required string BankName { get; set; }
    public required Dictionary<string, string> ColumnMappings { get; set; }
    public required string DateFormat { get; set; }
    public required string DecimalSeparator { get; set; }
    public required string ThousandsSeparator { get; set; }
    public bool IsDefault { get; set; } = false;
}
