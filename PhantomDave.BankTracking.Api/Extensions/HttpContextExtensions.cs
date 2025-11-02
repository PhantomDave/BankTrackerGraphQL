using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace PhantomDave.BankTracking.Api.Extensions;

public static class HttpContextExtensions
{
    public static ClaimsPrincipal? GetUser(this HttpContext? httpContext) => httpContext?.User;

    public static int? GetUserIdOrDefault(this ClaimsPrincipal? user)
    {
        if (user is null)
        {
            return null;
        }

        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(idClaim))
        {
            return null;
        }

        return int.TryParse(idClaim, out var id) ? id : null;
    }

    public static int RequireUserId(this ClaimsPrincipal? user)
    {
        var id = user.GetUserIdOrDefault();
        if (id is null)
        {
            throw new UnauthorizedAccessException("User id claim missing or invalid.");
        }
        return id.Value;
    }

    public static string? GetBearerToken(this HttpContext? httpContext)
    {
        if (httpContext is null)
        {
            return null;
        }
        if (!httpContext.Request.Headers.TryGetValue("Authorization", out var values))
        {
            return null;
        }
        var header = values.ToString();
        const string prefix = "Bearer ";
        if (header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return header[prefix.Length..].Trim();
        }
        return null;
    }
}

