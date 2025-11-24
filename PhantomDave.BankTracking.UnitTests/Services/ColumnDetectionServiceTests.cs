using PhantomDave.BankTracking.Api.Services;

namespace PhantomDave.BankTracking.UnitTests.Services;

public class ColumnDetectionServiceTests
{
    private readonly ColumnDetectionService _service;

    public ColumnDetectionServiceTests()
    {
        _service = new ColumnDetectionService();
    }

    [Fact]
    public void DetectColumns_WithEnglishDateHeader_ReturnsDateMapping()
    {
        // Arrange
        var headers = new[] { "Date", "Amount", "Description" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.Contains("Date", result.Keys);
        Assert.Equal("Date", result["Date"].Column);
        Assert.Equal("Date", result["Date"].SuggestedMapping);
        Assert.True(result["Date"].Confidence > 0);
    }

    [Fact]
    public void DetectColumns_WithItalianDateHeader_ReturnsDateMapping()
    {
        // Arrange
        var headers = new[] { "Data", "Importo", "Descrizione" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.Contains("Data", result.Keys);
        Assert.Equal("Date", result["Data"].SuggestedMapping);
    }

    [Fact]
    public void DetectColumns_WithSpanishDateHeader_ReturnsDateMapping()
    {
        // Arrange
        var headers = new[] { "Fecha", "Monto", "Descripcion" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.Contains("Fecha", result.Keys);
        Assert.Equal("Date", result["Fecha"].SuggestedMapping);
    }

    [Fact]
    public void DetectColumns_WithAmountVariations_ReturnsAmountMapping()
    {
        // Arrange
        var headers = new[] { "Amount", "Importo", "Betrag", "Monto" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.All(headers, header =>
        {
            Assert.Contains(header, result.Keys);
            Assert.Equal("Amount", result[header].SuggestedMapping);
        });
    }

    [Fact]
    public void DetectColumns_WithDescriptionVariations_ReturnsDescriptionMapping()
    {
        // Arrange
        var headers = new[] { "Description", "Descrizione", "Descripcion", "Causale" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.All(headers, header =>
        {
            Assert.Contains(header, result.Keys);
            Assert.Equal("Description", result[header].SuggestedMapping);
        });
    }

    [Fact]
    public void DetectColumns_WithBalanceVariations_ReturnsBalanceMapping()
    {
        // Arrange
        var headers = new[] { "Balance", "Saldo", "Current Balance" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.All(headers, header =>
        {
            Assert.Contains(header, result.Keys);
            Assert.Equal("Balance", result[header].SuggestedMapping);
        });
    }

    [Fact]
    public void DetectColumns_WithCurrencyVariations_ReturnsCurrencyMapping()
    {
        // Arrange
        var headers = new[] { "Currency", "Valuta", "Moneda", "CCY" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.All(headers, header =>
        {
            Assert.Contains(header, result.Keys);
            Assert.Equal("Currency", result[header].SuggestedMapping);
        });
    }

    [Fact]
    public void DetectColumns_WithNameVariations_ReturnsNameMapping()
    {
        // Arrange
        var headers = new[] { "Name", "Payee", "Beneficiary", "Merchant" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.All(headers, header =>
        {
            Assert.Contains(header, result.Keys);
            Assert.Equal("Name", result[header].SuggestedMapping);
        });
    }

    [Fact]
    public void DetectColumns_WithEmptyHeaders_ReturnsEmptyResult()
    {
        // Arrange
        var headers = Array.Empty<string>();

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public void DetectColumns_WithWhitespaceHeaders_SkipsWhitespace()
    {
        // Arrange
        var headers = new[] { "Date", "  ", "Amount", "" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Contains("Date", result.Keys);
        Assert.Contains("Amount", result.Keys);
        Assert.DoesNotContain("  ", result.Keys);
        Assert.DoesNotContain("", result.Keys);
    }

    [Fact]
    public void DetectColumns_WithUnknownHeader_ReturnsUnknownMapping()
    {
        // Arrange
        var headers = new[] { "UnknownColumn123" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.Contains("UnknownColumn123", result.Keys);
        Assert.Equal("Unknown", result["UnknownColumn123"].SuggestedMapping);
    }

    [Fact]
    public void DetectColumns_IsCaseInsensitive()
    {
        // Arrange
        var headers = new[] { "DATE", "date", "Date", "DaTe" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.All(headers, header =>
        {
            Assert.Contains(header, result.Keys);
            Assert.Equal("Date", result[header].SuggestedMapping);
        });
    }

    [Fact]
    public void DetectColumns_WithTrimmableHeaders_TrimsWhitespace()
    {
        // Arrange
        var headers = new[] { "  Date  ", " Amount ", "Description\t" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.Contains("Date", result.Keys);
        Assert.Contains("Amount", result.Keys);
        Assert.Contains("Description", result.Keys);
        Assert.Equal(3, result.Count);
    }

    [Fact]
    public void DetectColumns_WithMixedLanguageHeaders_DetectsAll()
    {
        // Arrange
        var headers = new[] { "Data", "Amount", "Descripcion", "Saldo" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.Equal(4, result.Count);
        Assert.Equal("Date", result["Data"].SuggestedMapping);
        Assert.Equal("Amount", result["Amount"].SuggestedMapping);
        Assert.Equal("Description", result["Descripcion"].SuggestedMapping);
        Assert.Equal("Balance", result["Saldo"].SuggestedMapping);
    }

    [Fact]
    public void DetectColumns_WithCompoundHeaders_DetectsCorrectly()
    {
        // Arrange
        var headers = new[] { "Transaction Date", "Booking Date", "Value Date" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.All(headers, header =>
        {
            Assert.Contains(header, result.Keys);
            Assert.Equal("Date", result[header].SuggestedMapping);
        });
    }

    [Fact]
    public void DetectColumns_WithDebitCreditHeaders_MapsToAmount()
    {
        // Arrange
        var headers = new[] { "Debit", "Credit", "Addebito", "Accredito" };

        // Act
        var result = _service.DetectColumns(headers);

        // Assert
        Assert.All(headers, header =>
        {
            Assert.Contains(header, result.Keys);
            Assert.Equal("Amount", result[header].SuggestedMapping);
        });
    }
}
