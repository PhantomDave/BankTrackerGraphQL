using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using OfficeOpenXml;

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
}
public class FileImportService
{
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
            parsedData.Rows = await ParseCsvAsync(reader);
        }
        else if (file.Name.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
        {
            parsedData.FileTypeExt = FileType.Xlsx;
            parsedData.Rows = ParseXlsxAsync(reader).Result;
        }
        else
        {
            throw new NotSupportedException("Unsupported file type.");
        }
        parsedData.TotalRows = parsedData.Rows.Count;
        return parsedData;
    }

    private static async Task<List<Dictionary<string, string>>> ParseCsvAsync(Stream stream)
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
            return rows;
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
        
        return rows;
    }

    private static async Task<List<Dictionary<string, string>>> ParseXlsxAsync(Stream stream)
    {
        var rows = new List<Dictionary<string, string>>();
        
        using var package = new ExcelPackage(stream);
        var worksheet = package.Workbook.Worksheets.FirstOrDefault();
        
        if (worksheet?.Dimension == null)
        {
            return rows;
        }
        
        var headers = new List<string>();
        for (var col = 1; col <= worksheet.Dimension.End.Column; col++)
        {
            var headerValue = worksheet.Cells[1, col].Text ?? $"Column{col}";
            headers.Add(headerValue);
        }
        
        for (var row = 2; row <= worksheet.Dimension.End.Row; row++)
        {
            var rowData = new Dictionary<string, string>();
            for (var col = 1; col <= worksheet.Dimension.End.Column; col++)
            {
                var cellValue = worksheet.Cells[row, col].Text ?? string.Empty;
                rowData[headers[col - 1]] = cellValue;
            }
            rows.Add(rowData);
        }
        
        return await Task.FromResult(rows);
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
        catch
        {
            return Encoding.GetEncoding("ISO-8859-1");
        }
    }
}
