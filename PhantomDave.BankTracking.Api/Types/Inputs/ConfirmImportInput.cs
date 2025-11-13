namespace PhantomDave.BankTracking.Api.Types.Inputs;

public class ConfirmImportInput
{
    public required IFile File { get; set; }
    public required Dictionary<string, string> ColumnMappings { get; set; }
    public required string DateFormat { get; set; }
    public required string DecimalSeparator { get; set; }
    public required string ThousandsSeparator { get; set; }
    public int RowsToSkip { get; set; } = 0;
    public bool SaveAsTemplate { get; set; } = false;
    public string? TemplateName { get; set; }
    public int AccountId { get; set; }
}
