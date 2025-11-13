using HotChocolate.Authorization;
using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Api.Types.Inputs;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using PhantomDave.BankTracking.Library.Models;
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
        var accountId = httpContextAccessor.GetAccountIdFromContext();
        
        // Parse the file
        var parsedFile = await fileService.ParseFileAsync(input.File);
        
        // Skip rows if specified
        var rowsToProcess = input.RowsToSkip > 0 
            ? parsedFile.Rows.Skip(input.RowsToSkip).ToList() 
            : parsedFile.Rows;
        
        var records = new List<FinanceRecord>();
        var errors = new List<ImportError>();
        var rowNumber = input.RowsToSkip + 1;
        
        foreach (var row in rowsToProcess)
        {
            rowNumber++;
            
            try
            {
                // Extract values based on column mappings
                var dateStr = GetColumnValue(row, input.ColumnMappings, "Date");
                var amountStr = GetColumnValue(row, input.ColumnMappings, "Amount");
                var description = GetColumnValue(row, input.ColumnMappings, "Description") ?? string.Empty;
                var name = GetColumnValue(row, input.ColumnMappings, "Name") ?? description;
                var currencyStr = GetColumnValue(row, input.ColumnMappings, "Currency") ?? "EUR";
                
                // Parse date
                if (string.IsNullOrWhiteSpace(dateStr))
                {
                    errors.Add(new ImportError
                    {
                        RowNumber = rowNumber,
                        Message = "Date is required",
                        RowData = row
                    });
                    continue;
                }
                
                if (!DateTime.TryParseExact(dateStr, input.DateFormat, System.Globalization.CultureInfo.InvariantCulture, 
                    System.Globalization.DateTimeStyles.None, out var date))
                {
                    errors.Add(new ImportError
                    {
                        RowNumber = rowNumber,
                        Message = $"Invalid date format: {dateStr}",
                        RowData = row
                    });
                    continue;
                }
                
                // Parse amount
                if (string.IsNullOrWhiteSpace(amountStr))
                {
                    errors.Add(new ImportError
                    {
                        RowNumber = rowNumber,
                        Message = "Amount is required",
                        RowData = row
                    });
                    continue;
                }
                
                // Handle decimal separator
                var normalizedAmount = amountStr
                    .Replace(input.ThousandsSeparator, string.Empty)
                    .Replace(input.DecimalSeparator, ".");
                
                if (!decimal.TryParse(normalizedAmount, System.Globalization.NumberStyles.AllowDecimalPoint | System.Globalization.NumberStyles.AllowLeadingSign, 
                    System.Globalization.CultureInfo.InvariantCulture, out var amount))
                {
                    errors.Add(new ImportError
                    {
                        RowNumber = rowNumber,
                        Message = $"Invalid amount format: {amountStr}",
                        RowData = row
                    });
                    continue;
                }
                
                // Create finance record
                var record = new FinanceRecord
                {
                    AccountId = accountId,
                    Date = DateTime.SpecifyKind(date, DateTimeKind.Utc),
                    Amount = amount,
                    Name = string.IsNullOrWhiteSpace(name) ? "Imported" : name.Trim(),
                    Description = description.Trim(),
                    Currency = currencyStr.Trim().ToUpperInvariant(),
                    IsRecurring = false,
                    RecurrenceFrequency = RecurrenceFrequency.None
                };
                
                records.Add(record);
            }
            catch (Exception ex)
            {
                errors.Add(new ImportError
                {
                    RowNumber = rowNumber,
                    Message = $"Error processing row: {ex.Message}",
                    RowData = row
                });
            }
        }
        
        // Bulk create with duplicate check
        var result = await financeService.BulkCreateWithDuplicateCheckAsync(accountId, records);
        
        // Add parsing errors to the result
        result.Errors.AddRange(errors);
        result.FailureCount += errors.Count;
        
        return result;
    }
    
    private static string? GetColumnValue(Dictionary<string, string> row, Dictionary<string, string> mappings, string fieldName)
    {
        // Find the mapping for this field (e.g., "Date" -> "Data operazione")
        var mapping = mappings.FirstOrDefault(m => m.Value == fieldName);
        if (mapping.Key == null)
        {
            return null;
        }
        
        // Get the actual column name from the mapping
        return row.TryGetValue(mapping.Key, out var value) ? value : null;
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