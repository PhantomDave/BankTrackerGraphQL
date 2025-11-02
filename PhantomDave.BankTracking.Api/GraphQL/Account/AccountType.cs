namespace PhantomDave.BankTracking.Api.GraphQL.Account;

public class AccountType
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Factory method to convert a domain Account model to a GraphQL AccountType
    /// </summary>
    public static AccountType FromAccount(Library.Models.Account account) => new()
    {
        Id = account.Id,
        Email = account.Email,
        CreatedAt = account.CreatedAt,
        UpdatedAt = account.UpdatedAt,
    };
}

