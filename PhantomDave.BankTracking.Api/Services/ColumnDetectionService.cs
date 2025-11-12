namespace PhantomDave.BankTracking.Api.Services;

public class ColumnDetectionService
{
    // Inverse mapping: pattern -> standardized field name
    private static readonly Dictionary<string, string> PatternToFieldMapping = new(StringComparer.OrdinalIgnoreCase)
    {
        // Date patterns
        ["date"] = "Date",
        ["data"] = "Date",
        ["fecha"] = "Date",
        ["datum"] = "Date",
        ["transaction date"] = "Date",
        ["data operazione"] = "Date",
        ["data contabile"] = "Date",
        ["booking date"] = "Date",
        ["value date"] = "Date",
        ["fecha valor"] = "Date",
        ["fecha operacion"] = "Date",
        ["operation date"] = "Date",

        // Amount patterns
        ["amount"] = "Amount",
        ["importo"] = "Amount",
        ["monto"] = "Amount",
        ["betrag"] = "Amount",
        ["addebito"] = "Amount",
        ["accredito"] = "Amount",
        ["entrate"] = "Amount",
        ["uscite"] = "Amount",
        ["debit"] = "Amount",
        ["credit"] = "Amount",
        ["debito"] = "Amount",
        ["credito"] = "Amount",
        ["importe"] = "Amount",
        ["total"] = "Amount",
        ["totale"] = "Amount",

        // Description patterns
        ["description"] = "Description",
        ["descrizione"] = "Description",
        ["descripcion"] = "Description",
        ["beschreibung"] = "Description",
        ["memo"] = "Description",
        ["details"] = "Description",
        ["causale"] = "Description",
        ["dettagli"] = "Description",
        ["concept"] = "Description",
        ["concepto"] = "Description",
        ["narration"] = "Description",
        ["narrative"] = "Description",
        ["reference"] = "Description",
        ["riferimento"] = "Description",
        ["motivo"] = "Description",

        // Name patterns
        ["name"] = "Name",
        ["nome"] = "Name",
        ["nombre"] = "Name",
        ["payee"] = "Name",
        ["beneficiary"] = "Name",
        ["beneficiario"] = "Name",
        ["counterparty"] = "Name",
        ["controparte"] = "Name",
        ["merchant"] = "Name",
        ["vendor"] = "Name",

        // Balance patterns
        ["balance"] = "Balance",
        ["saldo"] = "Balance",
        ["saldo contabile"] = "Balance",
        ["saldo disponibile"] = "Balance",
        ["available balance"] = "Balance",
        ["current balance"] = "Balance",
        ["balance after"] = "Balance",
        ["saldo final"] = "Balance",

        // Currency patterns
        ["currency"] = "Currency",
        ["valuta"] = "Currency",
        ["moneda"] = "Currency",
        ["divisa"] = "Currency",
        ["wahrung"] = "Currency",
        ["ccy"] = "Currency"
    };

    public Dictionary<string, ColumnDetectionResult> DetectColumns(string[] headers)
    {
        var results = new Dictionary<string, ColumnDetectionResult>();

        foreach (var header in headers)
        {
            var cleanHeader = header.Trim();
            if (string.IsNullOrWhiteSpace(cleanHeader))
                continue;

            var (suggestedMapping, confidence) = FindBestMatch(cleanHeader);

            results[cleanHeader] = new ColumnDetectionResult
            {
                Column = cleanHeader,
                SuggestedMapping = suggestedMapping,
                Confidence = confidence
            };
        }

        return results;
    }

    private (string SuggestedMapping, int Confidence) FindBestMatch(string header)
    {
        var normalizedHeader = header.ToLowerInvariant().Trim();

        if (PatternToFieldMapping.TryGetValue(normalizedHeader, out var exactMatch))
        {
            return (exactMatch, 100);
        }

        var bestMatch = string.Empty;
        var bestConfidence = 0;

        foreach (var (pattern, fieldName) in PatternToFieldMapping)
        {
            var confidence = CalculateConfidence(normalizedHeader, pattern);

            if (confidence > bestConfidence)
            {
                bestConfidence = confidence;
                bestMatch = fieldName;
            }
        }

        // Return "Unknown" if confidence is too low
        return bestConfidence >= 50
            ? (bestMatch, bestConfidence)
            : ("Unknown", 0);
    }

    public int CalculateConfidence(string header, string pattern)
    {
        var normalizedHeader = header.ToLowerInvariant().Trim();
        var normalizedPattern = pattern.ToLowerInvariant().Trim();

        if (normalizedHeader == normalizedPattern)
            return 100;

        if (normalizedHeader.Contains(normalizedPattern))
        {
            var ratio = (double)normalizedPattern.Length / normalizedHeader.Length;
            return (int)(85 + (ratio * 15)); // 85-100%
        }

        if (normalizedPattern.Contains(normalizedHeader))
        {
            var ratio = (double)normalizedHeader.Length / normalizedPattern.Length;
            return (int)(75 + (ratio * 10)); // 75-85%
        }

        var distance = LevenshteinDistance(normalizedHeader, normalizedPattern);
        var maxLength = Math.Max(normalizedHeader.Length, normalizedPattern.Length);
        var similarity = 1.0 - ((double)distance / maxLength);

        var confidence = (int)(similarity * 100);

        return confidence >= 60 ? confidence : 0;
    }

    private static int LevenshteinDistance(string s1, string s2)
    {
        var len1 = s1.Length;
        var len2 = s2.Length;
        var matrix = new int[len1 + 1, len2 + 1];

        if (len1 == 0) return len2;
        if (len2 == 0) return len1;

        for (var i = 0; i <= len1; i++)
            matrix[i, 0] = i;

        for (var j = 0; j <= len2; j++)
            matrix[0, j] = j;

        for (var i = 1; i <= len1; i++)
        {
            for (var j = 1; j <= len2; j++)
            {
                var cost = s2[j - 1] == s1[i - 1] ? 0 : 1;
                matrix[i, j] = Math.Min(
                    Math.Min(matrix[i - 1, j] + 1, matrix[i, j - 1] + 1),
                    matrix[i - 1, j - 1] + cost
                );
            }
        }

        return matrix[len1, len2];
    }
}

public record ColumnDetectionResult
{
    public string Column { get; init; } = string.Empty;
    public string SuggestedMapping { get; init; } = string.Empty;
    public int Confidence { get; init; }
}