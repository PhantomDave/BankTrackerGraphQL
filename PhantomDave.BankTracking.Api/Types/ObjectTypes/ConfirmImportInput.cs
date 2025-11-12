namespace PhantomDave.BankTracking.Api.Types.ObjectTypes;

public class ConfirmImportInput
{
    public IFile File { get; set; }
    public Dictionary<string, string> ColumnMappings { get; set; }
    public string DateFormat { get; set; }
    public string DecimalSeparator { get; set; }
    public string ThousandsSeparator { get; set; }
    public int RowsToSkip { get; set; } = 0;
    public bool SaveAsTemplate { get; set; } = false;
    public string? TemplateName { get; set; }
}