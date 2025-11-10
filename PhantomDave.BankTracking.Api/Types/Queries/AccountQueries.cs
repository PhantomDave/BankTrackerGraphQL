using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using HotChocolate.Authorization;
using Microsoft.AspNetCore.Http;

namespace PhantomDave.BankTracking.Api.Types.Queries;

/// <summary>
/// GraphQL queries for Account operations
/// </summary>
[ExtendObjectType(OperationTypeNames.Query)]
public class AccountQueries
{
    /// <summary>
    /// Get all accounts
    /// </summary>
    [Authorize]
    public async Task<IEnumerable<AccountType>> GetAccounts(
        [Service] AccountService accountService)
    {
        var accounts = await accountService.GetAllAccountsAsync();
        return accounts.Select(AccountType.FromAccount);
    }

    /// <summary>
    /// Get an account by email
    /// </summary>
    [Authorize]
    public async Task<AccountType?> GetAccountByEmail(
        string email,
        [Service] AccountService accountService)
    {
        var account = await accountService.GetAccountByEmail(email);
        return account != null ? AccountType.FromAccount(account) : null;
    }

    [Authorize]
    public Task<bool> IsAValidJwt([Service] IHttpContextAccessor httpContextAccessor)
    {
        var user = httpContextAccessor.HttpContext?.User;
        var isAuthenticated = user?.Identity?.IsAuthenticated ?? false;
        return Task.FromResult(isAuthenticated);
    }
}
