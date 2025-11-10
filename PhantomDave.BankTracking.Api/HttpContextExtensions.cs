using System.Security.Claims;
using HotChocolate;
using HotChocolate.Execution;
using Microsoft.AspNetCore.Http;

namespace PhantomDave.BankTracking.Api;

public static class HttpContextExtensions
{
    public static int GetAccountIdFromContext(this IHttpContextAccessor httpContextAccessor)
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Authentication required.")
                    .SetCode("UNAUTHENTICATED")
                    .Build());
        }

        var accountIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(accountIdClaim, out var accountId))
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Account identifier missing or invalid.")
                    .SetCode("INVALID_ACCOUNT_ID")
                    .Build());
        }

        return accountId;
    }
}