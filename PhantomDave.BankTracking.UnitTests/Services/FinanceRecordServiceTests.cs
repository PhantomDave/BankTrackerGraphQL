using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Moq;
using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Data.Repositories;
using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.UnitTests.Services;

public class FinanceRecordServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<FinanceRecord>> _mockFinanceRecordRepository;
    private readonly Mock<IRepository<Account>> _mockAccountRepository;
    private readonly FinanceRecordService _service;

    public FinanceRecordServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockFinanceRecordRepository = new Mock<IRepository<FinanceRecord>>();
        _mockAccountRepository = new Mock<IRepository<Account>>();

        _mockUnitOfWork.Setup(u => u.FinanceRecords).Returns(_mockFinanceRecordRepository.Object);
        _mockUnitOfWork.Setup(u => u.Accounts).Returns(_mockAccountRepository.Object);

        _service = new FinanceRecordService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetFinanceRecordAsync_WithValidId_ReturnsRecord()
    {
        // Arrange
        var recordId = 1;
        var expectedRecord = new FinanceRecord { Id = recordId, Name = "Test Record" };
        _mockFinanceRecordRepository.Setup(r => r.GetByIdAsync(recordId))
            .ReturnsAsync(expectedRecord);

        // Act
        var result = await _service.GetFinanceRecordAsync(recordId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(recordId, result.Id);
        Assert.Equal("Test Record", result.Name);
    }

    [Fact]
    public async Task GetFinanceRecordAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        _mockFinanceRecordRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((FinanceRecord?)null);

        // Act
        var result = await _service.GetFinanceRecordAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateFinanceRecordAsync_WithValidData_CreatesRecord()
    {
        // Arrange
        var accountId = 1;
        var account = new Account { Id = accountId, Email = "test@example.com" };
        
        _mockAccountRepository.Setup(r => r.GetByIdAsync(accountId))
            .ReturnsAsync(account);
        
        _mockFinanceRecordRepository.Setup(r => r.AddAsync(It.IsAny<FinanceRecord>()))
            .ReturnsAsync((FinanceRecord fr) => fr);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateFinanceRecordAsync(
            accountId, 
            100m, 
            "Salary", 
            "USD", 
            "Monthly salary",
            DateTime.UtcNow,
            false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(accountId, result.AccountId);
        Assert.Equal(100m, result.Amount);
        Assert.Equal("Salary", result.Name);
        Assert.Equal("USD", result.Currency);
        Assert.Equal("Monthly salary", result.Description);
        Assert.False(result.IsRecurring);
        _mockFinanceRecordRepository.Verify(r => r.AddAsync(It.IsAny<FinanceRecord>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateFinanceRecordAsync_WithInvalidAccount_ReturnsNull()
    {
        // Arrange
        _mockAccountRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((Account?)null);

        // Act
        var result = await _service.CreateFinanceRecordAsync(
            999, 100m, "Test", "USD", null, null, false);

        // Assert
        Assert.Null(result);
        _mockFinanceRecordRepository.Verify(r => r.AddAsync(It.IsAny<FinanceRecord>()), Times.Never);
    }

    [Fact]
    public async Task CreateFinanceRecordAsync_WithEmptyCurrency_ReturnsNull()
    {
        // Arrange
        var account = new Account { Id = 1, Email = "test@example.com" };
        _mockAccountRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(account);

        // Act
        var result = await _service.CreateFinanceRecordAsync(
            1, 100m, "Test", "", null, null, false);

        // Assert
        Assert.Null(result);
        _mockFinanceRecordRepository.Verify(r => r.AddAsync(It.IsAny<FinanceRecord>()), Times.Never);
    }

    [Fact]
    public async Task CreateFinanceRecordAsync_WithTooLongCurrency_ReturnsNull()
    {
        // Arrange
        var account = new Account { Id = 1, Email = "test@example.com" };
        _mockAccountRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(account);

        // Act
        var result = await _service.CreateFinanceRecordAsync(
            1, 100m, "Test", "TOOLONG", null, null, false);

        // Assert
        Assert.Null(result);
        _mockFinanceRecordRepository.Verify(r => r.AddAsync(It.IsAny<FinanceRecord>()), Times.Never);
    }

    [Fact]
    public async Task CreateFinanceRecordAsync_NormalizesCurrencyToUppercase()
    {
        // Arrange
        var account = new Account { Id = 1, Email = "test@example.com" };
        FinanceRecord? capturedRecord = null;
        
        _mockAccountRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(account);
        
        _mockFinanceRecordRepository.Setup(r => r.AddAsync(It.IsAny<FinanceRecord>()))
            .Callback<FinanceRecord>(fr => capturedRecord = fr)
            .ReturnsAsync((FinanceRecord fr) => fr);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateFinanceRecordAsync(
            1, 100m, "Test", "usd", null, null, false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("USD", result.Currency);
        Assert.NotNull(capturedRecord);
        Assert.Equal("USD", capturedRecord.Currency);
    }

    [Fact]
    public async Task CreateFinanceRecordAsync_TruncatesLongDescription()
    {
        // Arrange
        var account = new Account { Id = 1, Email = "test@example.com" };
        var longDescription = new string('a', 600);
        FinanceRecord? capturedRecord = null;
        
        _mockAccountRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(account);
        
        _mockFinanceRecordRepository.Setup(r => r.AddAsync(It.IsAny<FinanceRecord>()))
            .Callback<FinanceRecord>(fr => capturedRecord = fr)
            .ReturnsAsync((FinanceRecord fr) => fr);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateFinanceRecordAsync(
            1, 100m, "Test", "USD", longDescription, null, false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(500, result.Description.Length);
        Assert.NotNull(capturedRecord);
        Assert.Equal(500, capturedRecord.Description.Length);
    }

    [Fact]
    public async Task CreateFinanceRecordAsync_WithRecurringData_SetsRecurrenceFields()
    {
        // Arrange
        var account = new Account { Id = 1, Email = "test@example.com" };
        var endDate = DateTime.UtcNow.AddMonths(12);
        
        _mockAccountRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(account);
        
        _mockFinanceRecordRepository.Setup(r => r.AddAsync(It.IsAny<FinanceRecord>()))
            .ReturnsAsync((FinanceRecord fr) => fr);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateFinanceRecordAsync(
            1, 100m, "Subscription", "USD", null, null, true,
            RecurrenceFrequency.Monthly, endDate);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsRecurring);
        Assert.Equal(RecurrenceFrequency.Monthly, result.RecurrenceFrequency);
        Assert.NotNull(result.RecurrenceEndDate);
        Assert.Equal(DateTimeKind.Utc, result.RecurrenceEndDate.Value.Kind);
    }

    [Fact]
    public async Task UpdateFinanceRecordAsync_WithValidData_UpdatesRecord()
    {
        // Arrange
        var record = new FinanceRecord
        {
            Id = 1,
            AccountId = 1,
            Amount = 100m,
            Name = "Old Name",
            Currency = "USD",
            Description = "Old description",
            Date = DateTime.UtcNow
        };

        _mockFinanceRecordRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(record);
        
        _mockFinanceRecordRepository.Setup(r => r.UpdateAsync(It.IsAny<FinanceRecord>()))
            .ReturnsAsync((FinanceRecord fr) => fr);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateFinanceRecordAsync(
            1, 200m, "EUR", "New description", null, null, "New Name");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(200m, result.Amount);
        Assert.Equal("EUR", result.Currency);
        Assert.Equal("New description", result.Description);
        Assert.Equal("New Name", result.Name);
        _mockFinanceRecordRepository.Verify(r => r.UpdateAsync(It.IsAny<FinanceRecord>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateFinanceRecordAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        _mockFinanceRecordRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((FinanceRecord?)null);

        // Act
        var result = await _service.UpdateFinanceRecordAsync(999, 100m);

        // Assert
        Assert.Null(result);
        _mockFinanceRecordRepository.Verify(r => r.UpdateAsync(It.IsAny<FinanceRecord>()), Times.Never);
    }

    [Fact]
    public async Task UpdateFinanceRecordAsync_WithInvalidCurrency_ReturnsNull()
    {
        // Arrange
        var record = new FinanceRecord { Id = 1, AccountId = 1, Amount = 100m, Currency = "USD" };
        _mockFinanceRecordRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(record);

        // Act
        var result = await _service.UpdateFinanceRecordAsync(1, currency: "TOOLONG");

        // Assert
        Assert.Null(result);
        _mockFinanceRecordRepository.Verify(r => r.UpdateAsync(It.IsAny<FinanceRecord>()), Times.Never);
    }

    [Fact]
    public async Task DeleteFinanceRecordAsync_WithValidId_DeletesRecord()
    {
        // Arrange
        _mockFinanceRecordRepository.Setup(r => r.DeleteAsync(1))
            .ReturnsAsync(true);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.DeleteFinanceRecordAsync(1);

        // Assert
        Assert.True(result);
        _mockFinanceRecordRepository.Verify(r => r.DeleteAsync(1), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteFinanceRecordAsync_WithInvalidId_ReturnsFalse()
    {
        // Arrange
        _mockFinanceRecordRepository.Setup(r => r.DeleteAsync(It.IsAny<int>()))
            .ReturnsAsync(false);

        // Act
        var result = await _service.DeleteFinanceRecordAsync(999);

        // Assert
        Assert.False(result);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Never);
    }

    // Note: DeleteAllImportedFinanceRecordForAccountAsync uses EF Core Query() with ToListAsync
    // which requires AsyncQueryable support. This is better tested with integration tests.
}
