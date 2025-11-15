using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Services;

public enum FileType
{
    Csv,
    Xlsx
}

public class ParsedFileData
{
    public List<string> Headers { get; set; } = [];
    public List<Dictionary<string, string>> Rows { get; set; } = [];
    public int TotalRows { get; set; }
    public string DetectedDelimiter { get; set; } = ",";
    public string DetectedEncoding { get; set; } = "UTF-8";
    public FileType FileTypeExt { get; set; } = FileType.Xlsx;
    public int HeaderRowIndex { get; set; } = 1;
}
public class FileImportService(ILogger<FileImportService> logger)
{
    private readonly ILogger<FileImportService> _logger = logger;

    public async Task<ParsedFileData> ParseFileAsync(IFile file)
    {
        await using var reader = file.OpenReadStream();
        var parsedData = new ParsedFileData();
        if (file.Name.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
        {
            parsedData.FileTypeExt = FileType.Csv;
            parsedData.DetectedEncoding = DetectEncoding(reader).WebName;
            reader.Position = 0;
            using var streamReader = new StreamReader(reader, Encoding.GetEncoding(parsedData.DetectedEncoding));
            var sampleText = await streamReader.ReadToEndAsync();
            parsedData.DetectedDelimiter = DetectDelimiter(sampleText);
            reader.Position = 0;
            var (rows, headerRowIndex) = await ParseCsvAsync(reader);
            parsedData.Rows = rows;
            parsedData.HeaderRowIndex = headerRowIndex;
        }
        else if (file.Name.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
        {
            parsedData.FileTypeExt = FileType.Xlsx;
            var parsedXlsxData = await ParseXlsxAsync(reader);
            parsedData.Rows = parsedXlsxData.Rows;
            parsedData.Headers = parsedXlsxData.Headers;
            parsedData.HeaderRowIndex = parsedXlsxData.HeaderRowIndex;
        }
        else
        {
            throw new NotSupportedException("Unsupported file type.");
        }
        parsedData.TotalRows = parsedData.Rows.Count;
        return parsedData;
    }

    private static async Task<(List<Dictionary<string, string>> Rows, int HeaderRowIndex)> ParseCsvAsync(Stream stream)
    {
        var rows = new List<Dictionary<string, string>>();

        using var reader = new StreamReader(stream);
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            MissingFieldFound = null,
            BadDataFound = null
        };

        using var csv = new CsvReader(reader, config);

        await csv.ReadAsync();
        csv.ReadHeader();
        var headers = csv.HeaderRecord;

        if (headers == null || headers.Length == 0)
        {
            return (rows, 1);
        }

        while (await csv.ReadAsync())
        {
            var row = new Dictionary<string, string>();
            foreach (var header in headers)
            {
                row[header] = csv.GetField(header) ?? string.Empty;
            }
            rows.Add(row);
        }

        return (rows, 1);
    }

    private async Task<ParsedFileData> ParseXlsxAsync(Stream stream)
    {
        var parsedData = new ParsedFileData();

        parsedData.Rows = new List<Dictionary<string, string>>();

        using var package = new ExcelPackage(stream);
        var worksheet = package.Workbook.Worksheets.FirstOrDefault();

        if (worksheet?.Dimension == null)
        {
            return new ParsedFileData { Rows = parsedData.Rows, HeaderRowIndex = 1 };
        }

        var headerRowIndex = DetectHeaderRow(worksheet);

        parsedData.Headers = new List<string>();
        for (var col = 1; col <= worksheet.Dimension.End.Column; col++)
        {
            var headerValue = worksheet.Cells[headerRowIndex, col].Text ?? $"Column{col}";
            parsedData.Headers.Add(headerValue);
        }

        for (var row = headerRowIndex + 1; row <= worksheet.Dimension.End.Row; row++)
        {
            var rowData = new Dictionary<string, string>();
            for (var col = 1; col <= worksheet.Dimension.End.Column; col++)
            {
                var cellValue = worksheet.Cells[row, col].Text ?? string.Empty;
                rowData[parsedData.Headers[col - 1]] = cellValue;
            }
            parsedData.Rows.Add(rowData);
        }

        return await Task.FromResult(parsedData);
    }

    private static int DetectHeaderRow(ExcelWorksheet worksheet)
    {
        var maxRowsToCheck = Math.Min(50, worksheet.Dimension.End.Row);
        var bestRow = 1;
        var bestScore = 0;

        var headerKeywords = new[]
        {
            "date", "data", "fecha", "datum",
            "amount", "importo", "monto", "betrag",
            "description", "descrizione", "descripcion", "beschreibung",
            "balance", "saldo", "name", "nome", "currency", "valuta"
        };

        for (var row = 1; row <= maxRowsToCheck; row++)
        {
            var score = 0;
            var hasContent = false;
            var nonEmptyCells = 0;

            for (var col = 1; col <= worksheet.Dimension.End.Column; col++)
            {
                var cellText = worksheet.Cells[row, col].Text?.Trim() ?? string.Empty;

                if (!string.IsNullOrWhiteSpace(cellText))
                {
                    hasContent = true;
                    nonEmptyCells++;

                    var lowerText = cellText.ToLowerInvariant();

                    foreach (var keyword in headerKeywords)
                    {
                        if (lowerText.Contains(keyword))
                        {
                            score += 10;
                            break;
                        }
                    }

                    if (cellText.Length > 3 && cellText.Length < 50 &&
                        !decimal.TryParse(cellText.Replace(",", "."), out _) &&
                        !DateTime.TryParse(cellText, out _))
                    {
                        score += 2;
                    }
                }
            }

            if (hasContent && nonEmptyCells >= worksheet.Dimension.End.Column / 2)
            {
                score += nonEmptyCells;
            }

            if (score > bestScore)
            {
                bestScore = score;
                bestRow = row;
            }
        }

        return bestRow;
    }

    private static string DetectDelimiter(string sampleText)
    {
        var delimiters = new[] { ",", ";", "\t", "|" };
        var maxCount = 0;
        var detectedDelimiter = ",";

        foreach (var delimiter in delimiters)
        {
            var count = sampleText.Split('\n').FirstOrDefault()?.Split(delimiter).Length ?? 0;
            if (count <= maxCount) continue;

            maxCount = count;
            detectedDelimiter = delimiter;
        }

        return detectedDelimiter;
    }

    private static Encoding DetectEncoding(Stream stream)
    {
        var buffer = new byte[4096];
        var bytesRead = stream.Read(buffer, 0, buffer.Length);

        // Check for BOM
        if (bytesRead >= 3 && buffer[0] == 0xEF && buffer[1] == 0xBB && buffer[2] == 0xBF)
        {
            return Encoding.UTF8;
        }
        if (bytesRead >= 2 && buffer[0] == 0xFF && buffer[1] == 0xFE)
        {
            return Encoding.Unicode; // UTF-16 LE
        }
        if (bytesRead >= 2 && buffer[0] == 0xFE && buffer[1] == 0xFF)
        {
            return Encoding.BigEndianUnicode; // UTF-16 BE
        }

        // Try to detect UTF-8 without BOM
        try
        {
            Encoding.UTF8.GetString(buffer, 0, bytesRead);
            return Encoding.UTF8;
        }
        catch (DecoderFallbackException)
        {
            // If UTF-8 decoding fails, fall back to ISO-8859-1
            return Encoding.GetEncoding("ISO-8859-1");
        }
    }

    public IEnumerable<FinanceRecord> FromParsedData(int accountId, ParsedFileData parsedData, ConfirmImportInput input)
    {
        var records = new List<FinanceRecord>();
        var failedCount = 0;

        foreach (var row in parsedData.Rows)
        {
            try
            {
                var record = new FinanceRecord();

                if (input.ColumnMappings.TryGetValue("Date", out var dateColumn) && row.TryGetValue(dateColumn, out var dateColumnValue))
                {
                    if (DateTime.TryParseExact(dateColumnValue, input.DateFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                    {
                        // Ensure UTC kind to satisfy Npgsql 'timestamp with time zone' requirement
                        record.Date = DateTime.SpecifyKind(date, DateTimeKind.Utc);
                    }
                }

                if (input.ColumnMappings.TryGetValue("Amount", out var amountColumn) && row.TryGetValue(amountColumn, out var amountColumnValue))
                {
                    if (decimal.TryParse(amountColumnValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var amount))
                    {
                        record.Amount = amount;
                    }
                }

                if (input.ColumnMappings.TryGetValue("Description", out var descriptionColumn) && row.TryGetValue(descriptionColumn, out var descriptionColumnValue))
                {
                    record.Description = descriptionColumnValue;
                }

                record.AccountId = accountId;
                record.Imported = true;

                records.Add(record);
            }
            catch (FormatException ex)
            {
                failedCount++;
                _logger.LogWarning(ex, "Failed to parse row {RowIndex} due to format error during import", records.Count + failedCount);
            }
            catch (InvalidCastException ex)
            {
                failedCount++;
                _logger.LogWarning(ex, "Failed to parse row {RowIndex} due to invalid cast during import", records.Count + failedCount);
            }
            catch (ArgumentException ex)
            {
                failedCount++;
                _logger.LogWarning(ex, "Failed to parse row {RowIndex} due to argument error during import", records.Count + failedCount);
            }
            _logger.LogDebug("Processed {ProcessedRows} / {TotalRows}, Failed: {FailedRows}",
                records.Count + failedCount, parsedData.Rows.Count, failedCount);
        }

        return records;
    }
}
