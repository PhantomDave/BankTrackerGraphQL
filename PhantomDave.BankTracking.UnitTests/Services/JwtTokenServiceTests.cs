using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using PhantomDave.BankTracking.Api.Services;

namespace PhantomDave.BankTracking.UnitTests.Services;

public class JwtTokenServiceTests
{
    private readonly JwtSettings _jwtSettings;
    private readonly JwtTokenService _tokenService;

    public JwtTokenServiceTests()
    {
        _jwtSettings = new JwtSettings
        {
            Secret = "ThisIsASecretKeyForTestingPurposesOnly123456789",
            Issuer = "BankTrackerTests",
            Audience = "BankTrackerTestAudience",
            ExpiryMinutes = 60
        };

        var options = Options.Create(_jwtSettings);
        _tokenService = new JwtTokenService(options);
    }

    [Fact]
    public void CreateToken_WithValidInputs_ReturnsValidJwtToken()
    {
        // Arrange
        var userId = 1;
        var email = "test@example.com";

        // Act
        var token = _tokenService.CreateToken(userId, email);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
        
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        
        Assert.Equal(_jwtSettings.Issuer, jwtToken.Issuer);
        Assert.Contains(jwtToken.Claims, c => c.Type == ClaimTypes.NameIdentifier && c.Value == userId.ToString());
        Assert.Contains(jwtToken.Claims, c => c.Type == ClaimTypes.Name && c.Value == email);
    }

    [Fact]
    public void CreateToken_WithRoles_IncludesRolesInToken()
    {
        // Arrange
        var userId = 1;
        var email = "admin@example.com";
        var roles = new[] { "Admin", "User" };

        // Act
        var token = _tokenService.CreateToken(userId, email, roles);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        
        var roleClaims = jwtToken.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToArray();
        Assert.Equal(2, roleClaims.Length);
        Assert.Contains("Admin", roleClaims);
        Assert.Contains("User", roleClaims);
    }

    [Fact]
    public void CreateToken_SetsExpirationTime()
    {
        // Arrange
        var userId = 1;
        var email = "test@example.com";
        var beforeCreation = DateTime.UtcNow;

        // Act
        var token = _tokenService.CreateToken(userId, email);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        
        Assert.True(jwtToken.ValidTo > beforeCreation);
        Assert.True(jwtToken.ValidTo <= beforeCreation.AddMinutes(_jwtSettings.ExpiryMinutes + 1));
    }

    [Fact]
    public void CreateToken_IncludesJtiClaim()
    {
        // Arrange
        var userId = 1;
        var email = "test@example.com";

        // Act
        var token = _tokenService.CreateToken(userId, email);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        
        var jtiClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti);
        Assert.NotNull(jtiClaim);
        Assert.True(Guid.TryParse(jtiClaim.Value, out _));
    }

    [Fact]
    public void CreateToken_CreatesUniqueTokens()
    {
        // Arrange
        var userId = 1;
        var email = "test@example.com";

        // Act
        var token1 = _tokenService.CreateToken(userId, email);
        var token2 = _tokenService.CreateToken(userId, email);

        // Assert
        Assert.NotEqual(token1, token2);
    }
}
