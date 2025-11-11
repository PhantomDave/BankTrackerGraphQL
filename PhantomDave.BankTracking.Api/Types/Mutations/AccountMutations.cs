using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using HotChocolate.Authorization;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Types.Mutations;

/// <summary>
/// GraphQL mutations for Account operations
/// </summary>
[ExtendObjectType(OperationTypeNames.Mutation)]
public class AccountMutations
{
    /// <summary>
    /// Create a new account
    /// </summary>
    [AllowAnonymous]
    public async Task<AccountType> CreateAccount(
        string email,
        string password,
        [Service] AccountService accountService)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Email is required.")
                    .SetCode("BAD_USER_INPUT")
                    .SetExtension("field", "email")
                    .SetExtension("reason", "required")
                    .Build());

        }

        if (string.IsNullOrWhiteSpace(password))
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Password is required.")
                    .SetCode("BAD_USER_INPUT")
                    .SetExtension("field", "password")
                    .SetExtension("reason", "required")
                    .Build());
        }

        var account = await accountService.CreateAccountAsync(email, password) ?? throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Unable to create account.")
                    .SetCode("ACCOUNT_CREATE_FAILED")
                    .SetExtension("field", "email")
                    .SetExtension("reason", "duplicate_or_invalid")
                    .Build());
        return AccountType.FromAccount(account);
    }

    /// <summary>
    /// Login to an account
    /// </summary>
    [AllowAnonymous]
    public async Task<AccountType?> LoginAccount(
        string email,
        string password,
        [Service] AccountService accountService)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Email is required.")
                    .SetCode("BAD_USER_INPUT")
                    .SetExtension("field", "email")
                    .SetExtension("reason", "required")
                    .Build());
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Password is required.")
                    .SetCode("BAD_USER_INPUT")
                    .SetExtension("field", "password")
                    .SetExtension("reason", "required")
                    .Build());
        }

        var account = await accountService.LoginAccountAsync(email, password) ?? throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Invalid email or password.")
                    .SetCode("AUTHENTICATION_FAILED")
                    .SetExtension("field", "email")
                    .SetExtension("reason", "invalid_credentials")
                    .Build());
                    
        return AccountType.FromAccount(account);
    }

    /// <summary>
    /// Login and get JWT
    /// </summary>
    [AllowAnonymous]
    public async Task<AuthPayload> Login(
        string email,
        string password,
        [Service] AccountService accountService,
        [Service] IJwtTokenService tokenService)
    {
        var account = await accountService.LoginAccountAsync(email, password) ?? throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Invalid credentials.")
                    .SetCode("UNAUTHENTICATED")
                    .Build());
        var token = tokenService.CreateToken(account.Id, account.Email);
        return new AuthPayload
        {
            Token = token,
            Account = AccountType.FromAccount(account)
        };
    }

    public async Task<AccountType> UpdateAccount(
        string email,
        decimal? currentBalance,
        [Service] AccountService accountService,
                [Service] IHttpContextAccessor httpContextAccessor)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Email is required.")
                    .SetCode("BAD_USER_INPUT")
                    .SetExtension("field", "email")
                    .SetExtension("reason", "required")
                    .Build());
        }


        int accountId = httpContextAccessor.GetAccountIdFromContext();

        var account = (await accountService.UpdateAccountAsync(accountId, email, currentBalance)) ?? throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Unable to update account.")
                    .SetCode("ACCOUNT_UPDATE_FAILED")
                    .SetExtension("field", "email")
                    .SetExtension("reason", "invalid")
                    .Build());

        return AccountType.FromAccount(account);
    }

}

public sealed class AuthPayload
{
    public string Token { get; set; } = string.Empty;
    public AccountType Account { get; set; } = default!;
}
