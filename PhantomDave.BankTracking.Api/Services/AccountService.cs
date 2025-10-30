using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Library.Models;
using System.Security.Cryptography;

namespace PhantomDave.BankTracking.Api.Services;

public class AccountService
{
    private readonly IUnitOfWork _unitOfWork;

    public AccountService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Account?> GetAccountAsync(int id)
    {
        return await _unitOfWork.Accounts.GetByIdAsync(id);
    }

    public async Task<Account?> GetAccountByEmail(string email)
    {
        return await _unitOfWork.Accounts.GetSingleOrDefaultAsync(a => a.Email == email);
    }
    
    public async Task<IEnumerable<Account>> GetAllAccountsAsync()
    {
        return await _unitOfWork.Accounts.GetAllAsync();
    }

    private async Task<bool> IsEmailAlreadyPresent(string email)
    {
        var account = await _unitOfWork.Accounts.GetSingleOrDefaultAsync(a => a.Email == email);
        return account != null;
    }
    public async Task<Account?> CreateAccountAsync(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;
        if (string.IsNullOrWhiteSpace(password))
            return null;

        if (await IsEmailAlreadyPresent(email))
            return null;

        var account = new Account
        {
            Email = email,
            PasswordHash = HashPassword(password),
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Accounts.AddAsync(account);
        await _unitOfWork.SaveChangesAsync();
        return account;
    }

    public async Task<Account?> UpdateAccountAsync(int id, string? email = null, decimal? balance = null)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(id);
        if (account == null)
            return null;

        if (!string.IsNullOrEmpty(email))
            account.Email = email;

        account.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Accounts.UpdateAsync(account);
        await _unitOfWork.SaveChangesAsync();
        return account;
    }

    public async Task<Account?> LoginAccountAsync(string email, string password)
    {
        var account = await GetAccountByEmail(email);
        if(account == null)
            return null;
        return VerifyPassword(password, account.PasswordHash) ? account : null;
    }
    
    private static string HashPassword(string password)
    {
        const int iterations = 100_000;
        const int saltSize = 16;   // 128-bit
        const int keySize = 32;    // 256-bit

        var salt = RandomNumberGenerator.GetBytes(saltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, keySize);

        return $"PBKDF2-SHA256${iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }
    
    private static bool VerifyPassword(string password, string stored)
    {
        if (string.IsNullOrWhiteSpace(stored))
            return false;

        var parts = stored.Split('$');
        if (parts.Length != 4)
            return false;

        var scheme = parts[0];
        if (!string.Equals(scheme, "PBKDF2-SHA256", StringComparison.Ordinal))
            return false; // unsupported scheme

        if (!int.TryParse(parts[1], out var iterations) || iterations <= 0)
            return false;

        byte[] salt;
        byte[] expectedHash;
        try
        {
            salt = Convert.FromBase64String(parts[2]);
            expectedHash = Convert.FromBase64String(parts[3]);
        }
        catch
        {
            return false;
        }

        var actualHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expectedHash.Length);
        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }
}
