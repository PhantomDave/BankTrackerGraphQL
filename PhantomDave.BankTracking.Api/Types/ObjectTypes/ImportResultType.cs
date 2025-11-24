
namespace PhantomDave.BankTracking.Api.Types.ObjectTypes;

public class ImportResultType
{
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public int DuplicateCount { get; set; }
    public List<ImportError> Errors { get; set; } = [];
    public List<FinanceRecordType> CreatedRecords { get; set; } = [];
}

public class ImportError
{
    public int RowNumber { get; set; }
    public string Message { get; set; } = string.Empty;
    public Dictionary<string, string> RowData { get; set; } = [];
}

