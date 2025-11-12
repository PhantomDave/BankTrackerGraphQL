namespace PhantomDave.BankTracking.Api.Types.Inputs;

public class PreviewImportInput
{
    public IFile File { get; set; } = null!;
    public int? TemplateId { get; set; }
}

