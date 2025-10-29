using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Types.ObjectTypes;

public class AccountType
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Factory method to convert a domain Account model to a GraphQL AccountType
    /// </summary>
    public static AccountType FromAccount(Account account) => new()
    {
        Id = account.Id,
        Email = account.Email,
        CreatedAt = account.CreatedAt,
        UpdatedAt = account.UpdatedAt,
    };
}

