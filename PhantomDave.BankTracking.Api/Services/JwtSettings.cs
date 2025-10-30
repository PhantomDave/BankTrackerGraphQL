namespace PhantomDave.BankTracking.Api.Services;

public sealed class JwtSettings
{
    public string Secret { get; init; } = string.Empty;
    public string? Issuer { get; init; }
    public string? Audience { get; init; }
    public int ExpiryMinutes { get; init; } = 60; // default 1 hour
}

