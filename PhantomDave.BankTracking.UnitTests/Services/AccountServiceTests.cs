using Moq;
using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Data.Repositories;
using PhantomDave.BankTracking.Library.Models;
using System.Linq.Expressions;

namespace PhantomDave.BankTracking.UnitTests.Services;

public class AccountServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<Account>> _mockAccountRepository;
    private readonly AccountService _accountService;

    public AccountServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockAccountRepository = new Mock<IRepository<Account>>();
        
        _mockUnitOfWork.Setup(u => u.Accounts).Returns(_mockAccountRepository.Object);
        
        _accountService = new AccountService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetAccountAsync_WithValidId_ReturnsAccount()
    {
        // Arrange
        var accountId = 1;
        var expectedAccount = new Account { Id = accountId, Email = "test@example.com" };
        _mockAccountRepository.Setup(r => r.GetByIdAsync(accountId))
            .ReturnsAsync(expectedAccount);

        // Act
        var result = await _accountService.GetAccountAsync(accountId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(accountId, result.Id);
        Assert.Equal("test@example.com", result.Email);
    }

    [Fact]
    public async Task GetAccountAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        _mockAccountRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((Account?)null);

        // Act
        var result = await _accountService.GetAccountAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetAccountByEmail_WithValidEmail_ReturnsAccount()
    {
        // Arrange
        var email = "test@example.com";
        var expectedAccount = new Account { Id = 1, Email = email };
        _mockAccountRepository.Setup(r => r.GetSingleOrDefaultAsync(It.IsAny<Expression<Func<Account, bool>>>()))
            .ReturnsAsync(expectedAccount);

        // Act
        var result = await _accountService.GetAccountByEmail(email);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(email, result.Email);
    }

    [Fact]
    public async Task CreateAccountAsync_WithValidData_CreatesAccount()
    {
        // Arrange
        var email = "newuser@example.com";
        var password = "SecurePassword123!";
        
        _mockAccountRepository.Setup(r => r.GetSingleOrDefaultAsync(It.IsAny<Expression<Func<Account, bool>>>()))
            .ReturnsAsync((Account?)null);
        
        _mockAccountRepository.Setup(r => r.AddAsync(It.IsAny<Account>()))
            .ReturnsAsync((Account a) => a);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _accountService.CreateAccountAsync(email, password);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(email, result.Email);
        Assert.NotNull(result.PasswordHash);
        Assert.NotEmpty(result.PasswordHash);
        _mockAccountRepository.Verify(r => r.AddAsync(It.IsAny<Account>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateAccountAsync_WithEmptyEmail_ReturnsNull()
    {
        // Act
        var result = await _accountService.CreateAccountAsync("", "password");

        // Assert
        Assert.Null(result);
        _mockAccountRepository.Verify(r => r.AddAsync(It.IsAny<Account>()), Times.Never);
    }

    [Fact]
    public async Task CreateAccountAsync_WithEmptyPassword_ReturnsNull()
    {
        // Act
        var result = await _accountService.CreateAccountAsync("test@example.com", "");

        // Assert
        Assert.Null(result);
        _mockAccountRepository.Verify(r => r.AddAsync(It.IsAny<Account>()), Times.Never);
    }

    [Fact]
    public async Task CreateAccountAsync_WithExistingEmail_ReturnsNull()
    {
        // Arrange
        var email = "existing@example.com";
        var existingAccount = new Account { Id = 1, Email = email };
        
        _mockAccountRepository.Setup(r => r.GetSingleOrDefaultAsync(It.IsAny<Expression<Func<Account, bool>>>()))
            .ReturnsAsync(existingAccount);

        // Act
        var result = await _accountService.CreateAccountAsync(email, "password");

        // Assert
        Assert.Null(result);
        _mockAccountRepository.Verify(r => r.AddAsync(It.IsAny<Account>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAccountAsync_WithValidData_UpdatesAccount()
    {
        // Arrange
        var accountId = 1;
        var newEmail = "updated@example.com";
        var newBalance = 1000m;
        var existingAccount = new Account 
        { 
            Id = accountId, 
            Email = "old@example.com", 
            CurrentBalance = 500m 
        };
        
        _mockAccountRepository.Setup(r => r.GetByIdAsync(accountId))
            .ReturnsAsync(existingAccount);
        
        _mockAccountRepository.Setup(r => r.UpdateAsync(It.IsAny<Account>()))
            .ReturnsAsync((Account a) => a);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _accountService.UpdateAccountAsync(accountId, newEmail, newBalance);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(newEmail, result.Email);
        Assert.Equal(newBalance, result.CurrentBalance);
        _mockAccountRepository.Verify(r => r.UpdateAsync(It.IsAny<Account>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateAccountAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        _mockAccountRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((Account?)null);

        // Act
        var result = await _accountService.UpdateAccountAsync(999, "test@example.com");

        // Assert
        Assert.Null(result);
        _mockAccountRepository.Verify(r => r.UpdateAsync(It.IsAny<Account>()), Times.Never);
    }

    [Fact]
    public async Task LoginAccountAsync_WithValidCredentials_ReturnsAccount()
    {
        // Arrange
        var email = "test@example.com";
        var password = "password123";
        
        var accountService = new AccountService(_mockUnitOfWork.Object);
        var createdAccount = await CreateTestAccountWithPassword(email, password);
        
        _mockAccountRepository.Setup(r => r.GetSingleOrDefaultAsync(It.IsAny<Expression<Func<Account, bool>>>()))
            .ReturnsAsync(createdAccount);

        // Act
        var result = await accountService.LoginAccountAsync(email, password);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(email, result.Email);
    }

    [Fact]
    public async Task LoginAccountAsync_WithInvalidPassword_ReturnsNull()
    {
        // Arrange
        var email = "test@example.com";
        var correctPassword = "password123";
        var wrongPassword = "wrongpassword";
        
        var createdAccount = await CreateTestAccountWithPassword(email, correctPassword);
        
        _mockAccountRepository.Setup(r => r.GetSingleOrDefaultAsync(It.IsAny<Expression<Func<Account, bool>>>()))
            .ReturnsAsync(createdAccount);

        // Act
        var result = await _accountService.LoginAccountAsync(email, wrongPassword);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAccountAsync_WithNonExistentEmail_ReturnsNull()
    {
        // Arrange
        _mockAccountRepository.Setup(r => r.GetSingleOrDefaultAsync(It.IsAny<Expression<Func<Account, bool>>>()))
            .ReturnsAsync((Account?)null);

        // Act
        var result = await _accountService.LoginAccountAsync("notfound@example.com", "password");

        // Assert
        Assert.Null(result);
    }

    private static string HashPassword(string password)
    {
        const int iterations = 100_000;
        const int saltSize = 16;
        const int keySize = 32;

        var salt = System.Security.Cryptography.RandomNumberGenerator.GetBytes(saltSize);
        var hash = System.Security.Cryptography.Rfc2898DeriveBytes.Pbkdf2(
            password, salt, iterations, System.Security.Cryptography.HashAlgorithmName.SHA256, keySize);

        return $"PBKDF2-SHA256${iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    private Task<Account> CreateTestAccountWithPassword(string email, string password)
    {
        var account = new Account
        {
            Id = 1,
            Email = email,
            PasswordHash = HashPassword(password),
            CreatedAt = DateTime.UtcNow
        };
        return Task.FromResult(account);
    }
}
