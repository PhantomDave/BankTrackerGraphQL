using PhantomDave.BankTracking.Api.Services;

namespace PhantomDave.BankTracking.Api.Types.ObjectTypes;

public class ImportPreviewType
{
    public Dictionary<string, ColumnDetectionResult> DetectedColumns { get; set; } = new();
    public List<Dictionary<string, string>> SampleRows { get; set; } = [];
    public int TotalRows { get; set; }
    public List<string> Headers { get; set; } = [];
}

