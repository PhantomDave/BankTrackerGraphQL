using HotChocolate.Authorization;
using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Api.Types.Inputs;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using ColumnDetectionResult = PhantomDave.BankTracking.Api.Services.ColumnDetectionResult;

namespace PhantomDave.BankTracking.Api.Types.Mutations;

[ExtendObjectType(OperationTypeNames.Mutation)]
public class ImportMutations
{
    [Authorize]
    public async Task<ImportPreviewType> PreviewImport(
        PreviewImportInput input,
        [Service] FileImportService fileService,
        [Service] ColumnDetectionService detectionService,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        var parsedFile = await fileService.ParseFileAsync(input.File);
        Dictionary<string, ColumnDetectionResult> detectionResults = detectionService.DetectColumns(parsedFile.Headers.ToArray());
        return await Task.FromResult(new ImportPreviewType()
        {
            DetectedColumns = detectionResults,
            Headers = parsedFile.Headers,
            SampleRows = [.. parsedFile.Rows.Take(5)],
            TotalRows = parsedFile.Rows.Count
        });
    }

    [Authorize]
    public async Task<ImportResultType> ConfirmImport(
        ConfirmImportInput input,
        [Service] FileImportService fileService,
        [Service] FinanceRecordService financeService,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        
        //TODO: Implement this
        // Placeholder to not break the build
        return await Task.FromResult(new ImportResultType()
        {
            CreatedRecords = [],
            DuplicateCount = 0,
            Errors = [],
            FailureCount = 0,
            SuccessCount = 0
        });
    }


    // [Authorize]
    // public async Task<BankImportTemplateType> CreateImportTemplate(
    //     string bankName,
    //     Dictionary<string, string> columnMappings,
    //     string dateFormat,
    //     string decimalSeparator,
    //     string thousandsSeparator,
    //     bool isDefault,
    //     [Service] ImportTemplateService templateService,
    //     [Service] IHttpContextAccessor httpContextAccessor)
    // {
    // }
    //
    // [Authorize]
    // public async Task<BankImportTemplateType> UpdateImportTemplate(...)
    //
    // [Authorize]
    // public async Task<bool> DeleteImportTemplate(int id, ...)
    
}