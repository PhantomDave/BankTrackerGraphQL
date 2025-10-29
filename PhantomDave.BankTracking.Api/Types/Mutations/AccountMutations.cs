using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;

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

        var account = await accountService.CreateAccountAsync(email, password);
        if (account is null)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Unable to create account.")
                    .SetCode("ACCOUNT_CREATE_FAILED")
                    .SetExtension("field", "email")
                    .SetExtension("reason", "duplicate_or_invalid")
                    .Build());
        }

        return AccountType.FromAccount(account);
    }
}

