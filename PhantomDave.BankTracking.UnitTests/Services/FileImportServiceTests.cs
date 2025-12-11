using Microsoft.Extensions.Logging;
using Moq;
using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.UnitTests.Services;

public class FileImportServiceTests
{
    private readonly Mock<ILogger<FileImportService>> _mockLogger;
    private readonly FileImportService _service;

    public FileImportServiceTests()
    {
        _mockLogger = new Mock<ILogger<FileImportService>>();
        _service = new FileImportService(_mockLogger.Object);
    }

    [Fact]
    public void FromParsedData_WithAllFields_PopulatesAllProperties()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Description"] = "Test transaction",
                    ["Name"] = "Test Name",
                    ["Currency"] = "EUR"
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Description"] = "Description",
                ["Name"] = "Name",
                ["Currency"] = "Currency"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        var record = results[0];
        Assert.Equal(accountId, record.AccountId);
        Assert.Equal(100.50m, record.Amount);
        Assert.Equal("Test transaction", record.Description);
        Assert.Equal("Test Name", record.Name);
        Assert.Equal("EUR", record.Currency);
        Assert.True(record.Imported);
    }

    [Fact]
    public void FromParsedData_WithNameOnly_PopulatesNameAndDefaultCurrency()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Description"] = "Test transaction",
                    ["Name"] = "Test Name"
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Description"] = "Description",
                ["Name"] = "Name"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        var record = results[0];
        Assert.Equal("Test Name", record.Name);
        Assert.Equal("USD", record.Currency); // Default currency
    }

    [Fact]
    public void FromParsedData_WithCurrencyOnly_PopulatesCurrencyAndDefaultName()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Description"] = "Test transaction",
                    ["Currency"] = "GBP"
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Description"] = "Description",
                ["Currency"] = "Currency"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        var record = results[0];
        Assert.Equal(string.Empty, record.Name); // Default from model
        Assert.Equal("GBP", record.Currency);
    }

    [Fact]
    public void FromParsedData_WithoutNameAndCurrency_UsesDefaults()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Description"] = "Test transaction"
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Description"] = "Description"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        var record = results[0];
        Assert.Equal(string.Empty, record.Name); // Default from model
        Assert.Equal("USD", record.Currency); // Default from code
    }

    [Fact]
    public void FromParsedData_WithLowercaseCurrency_ConvertsToUppercase()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Currency"] = "eur"
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Currency"] = "Currency"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        var record = results[0];
        Assert.Equal("EUR", record.Currency); // Should be uppercase
    }

    [Fact]
    public void FromParsedData_WithMixedCaseCurrency_ConvertsToUppercase()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Currency"] = "uSd"
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Currency"] = "Currency"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        var record = results[0];
        Assert.Equal("USD", record.Currency);
    }

    [Fact]
    public void FromParsedData_WithEmptyCurrency_UsesDefault()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Currency"] = ""
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Currency"] = "Currency"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        var record = results[0];
        Assert.Equal("USD", record.Currency); // Should use default
    }

    [Fact]
    public void FromParsedData_WithMultipleRows_ProcessesAllCorrectly()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Description"] = "Transaction 1",
                    ["Name"] = "Name 1",
                    ["Currency"] = "EUR"
                },
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-16",
                    ["Amount"] = "200.75",
                    ["Description"] = "Transaction 2",
                    ["Name"] = "Name 2",
                    ["Currency"] = "GBP"
                },
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-17",
                    ["Amount"] = "300.00",
                    ["Description"] = "Transaction 3",
                    ["Name"] = "Name 3",
                    ["Currency"] = "usd"
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Description"] = "Description",
                ["Name"] = "Name",
                ["Currency"] = "Currency"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Equal(3, results.Count);
        
        Assert.Equal("Name 1", results[0].Name);
        Assert.Equal("EUR", results[0].Currency);
        Assert.Equal(100.50m, results[0].Amount);
        
        Assert.Equal("Name 2", results[1].Name);
        Assert.Equal("GBP", results[1].Currency);
        Assert.Equal(200.75m, results[1].Amount);
        
        Assert.Equal("Name 3", results[2].Name);
        Assert.Equal("USD", results[2].Currency);
        Assert.Equal(300.00m, results[2].Amount);
    }

    [Fact]
    public void FromParsedData_WithSpecialCharactersInName_PreservesName()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Name"] = "Café München & Co."
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Name"] = "Name"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal("Café München & Co.", results[0].Name);
    }

    [Fact]
    public void FromParsedData_MarksAllRecordsAsImported()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50"
                },
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-16",
                    ["Amount"] = "200.00"
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.All(results, record => Assert.True(record.Imported));
    }

    [Fact]
    public void FromParsedData_SetsCorrectAccountId()
    {
        // Arrange
        var accountId = 42;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50"
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal(accountId, results[0].AccountId);
    }

    [Fact]
    public void FromParsedData_WithInvalidAmount_CreatesRecordWithZeroAmount()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "invalid"
                },
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-16",
                    ["Amount"] = "100.50"
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Equal(2, results.Count); // Both rows are processed
        Assert.Equal(0m, results[0].Amount); // Invalid amount defaults to 0
        Assert.Equal(100.50m, results[1].Amount);
    }

    [Fact]
    public void FromParsedData_WithDateFormatting_ParsesCorrectly()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Name"] = "Test",
                    ["Currency"] = "USD"
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Name"] = "Name",
                ["Currency"] = "Currency"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal(new DateTime(2024, 1, 15, 0, 0, 0, DateTimeKind.Utc), results[0].Date);
    }

    [Fact]
    public void FromParsedData_WithEmptyRows_ReturnsEmptyList()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows = []
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void FromParsedData_WithNameLongerThan200Chars_TruncatesName()
    {
        // Arrange
        var accountId = 1;
        var longName = new string('A', 250); // 250 characters
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Name"] = longName
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Name"] = "Name"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal(200, results[0].Name.Length);
        Assert.Equal(longName.Substring(0, 200), results[0].Name);
    }

    [Fact]
    public void FromParsedData_WithCurrencyLongerThan3Chars_UsesDefault()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Currency"] = "EURO" // 4 characters
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Currency"] = "Currency"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal("USD", results[0].Currency); // Should default to USD
    }

    [Fact]
    public void FromParsedData_WithEmptyName_UsesDefault()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Name"] = ""
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Name"] = "Name"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal("Untitled", results[0].Name);
    }

    [Fact]
    public void FromParsedData_WithWhitespaceName_UsesDefault()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Name"] = "   "
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Name"] = "Name"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal("Untitled", results[0].Name);
    }

    [Fact]
    public void FromParsedData_WithCurrencyContainingWhitespace_TrimsAndNormalizes()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Currency"] = "  eur  "
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Currency"] = "Currency"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal("EUR", results[0].Currency);
    }

    [Fact]
    public void FromParsedData_WithNameContainingLeadingTrailingWhitespace_TrimsValue()
    {
        // Arrange
        var accountId = 1;
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Name"] = "  Test Name  "
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Name"] = "Name"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal("Test Name", results[0].Name);
    }

    [Fact]
    public void FromParsedData_WithExactly200CharName_AcceptsValue()
    {
        // Arrange
        var accountId = 1;
        var exactName = new string('B', 200); // Exactly 200 characters
        var parsedData = new ParsedFileData
        {
            Rows =
            [
                new Dictionary<string, string>
                {
                    ["Date"] = "2024-01-15",
                    ["Amount"] = "100.50",
                    ["Name"] = exactName
                }
            ]
        };

        var input = new ConfirmImportInput
        {
            ColumnMappings = new Dictionary<string, string>
            {
                ["Date"] = "Date",
                ["Amount"] = "Amount",
                ["Name"] = "Name"
            }
        };

        // Act
        var results = _service.FromParsedData(accountId, parsedData, input).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal(200, results[0].Name.Length);
        Assert.Equal(exactName, results[0].Name);
    }
}
