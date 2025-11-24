namespace PhantomDave.BankTracking.Api.Types.ObjectTypes;

public class BankImportTemplateType
{
    public static BankImportTemplateType FromBankImportTemplate(Library.Models.BankImportTemplate template)
    {
        return new BankImportTemplateType
        {
            Id = template.Id,
            AccountId = template.AccountId,
            BankName = template.BankName,
            ColumnMappings = template.ColumnMappings,
            DateFormat = template.DateFormat,
            DecimalSeparator = template.DecimalSeparator,
            ThousandsSeparator = template.ThousandsSeparator,
            IsDefault = template.IsDefault,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt
        };
    }

    public int Id { get; set; }
    public int AccountId { get; set; }
    public string BankName { get; set; } = string.Empty;
    public Dictionary<string, string> ColumnMappings { get; set; } = [];
    public string DateFormat { get; set; } = "dd/MM/yyyy";
    public string DecimalSeparator { get; set; } = ".";
    public string ThousandsSeparator { get; set; } = ",";
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

