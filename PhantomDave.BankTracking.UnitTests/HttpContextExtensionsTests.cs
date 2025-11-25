using System.Security.Claims;
using HotChocolate;
using Microsoft.AspNetCore.Http;
using Moq;
using PhantomDave.BankTracking.Api;

namespace PhantomDave.BankTracking.UnitTests;

public class HttpContextExtensionsTests
{
    private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
    private readonly Mock<HttpContext> _mockHttpContext;

    public HttpContextExtensionsTests()
    {
        _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
        _mockHttpContext = new Mock<HttpContext>();
    }

    [Fact]
    public void GetAccountIdFromContext_WithValidToken_ReturnsAccountId()
    {
        // Arrange
        var accountId = 123;
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, accountId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _mockHttpContext.Setup(c => c.User).Returns(principal);
        _mockHttpContextAccessor.Setup(a => a.HttpContext).Returns(_mockHttpContext.Object);

        // Act
        var result = _mockHttpContextAccessor.Object.GetAccountIdFromContext();

        // Assert
        Assert.Equal(accountId, result);
    }

    [Fact]
    public void GetAccountIdFromContext_WithUnauthenticatedUser_ThrowsGraphQLException()
    {
        // Arrange
        var identity = new ClaimsIdentity(); // Not authenticated
        var principal = new ClaimsPrincipal(identity);

        _mockHttpContext.Setup(c => c.User).Returns(principal);
        _mockHttpContextAccessor.Setup(a => a.HttpContext).Returns(_mockHttpContext.Object);

        // Act & Assert
        var exception = Assert.Throws<GraphQLException>(() => 
            _mockHttpContextAccessor.Object.GetAccountIdFromContext());
        
        Assert.Contains("Authentication required", exception.Message);
        Assert.Single(exception.Errors);
        Assert.Equal("UNAUTHENTICATED", exception.Errors[0].Code);
    }

    [Fact]
    public void GetAccountIdFromContext_WithNullHttpContext_ThrowsGraphQLException()
    {
        // Arrange
        _mockHttpContextAccessor.Setup(a => a.HttpContext).Returns(null);

        // Act & Assert
        var exception = Assert.Throws<GraphQLException>(() => 
            _mockHttpContextAccessor.Object.GetAccountIdFromContext());
        
        Assert.Contains("Authentication required", exception.Message);
    }

    [Fact]
    public void GetAccountIdFromContext_WithNullUser_ThrowsGraphQLException()
    {
        // Arrange
        _mockHttpContext.Setup(c => c.User).Returns(null);
        _mockHttpContextAccessor.Setup(a => a.HttpContext).Returns(_mockHttpContext.Object);

        // Act & Assert
        var exception = Assert.Throws<GraphQLException>(() => 
            _mockHttpContextAccessor.Object.GetAccountIdFromContext());
        
        Assert.Contains("Authentication required", exception.Message);
    }

    [Fact]
    public void GetAccountIdFromContext_WithMissingNameIdentifierClaim_ThrowsGraphQLException()
    {
        // Arrange
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "test@example.com")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _mockHttpContext.Setup(c => c.User).Returns(principal);
        _mockHttpContextAccessor.Setup(a => a.HttpContext).Returns(_mockHttpContext.Object);

        // Act & Assert
        var exception = Assert.Throws<GraphQLException>(() => 
            _mockHttpContextAccessor.Object.GetAccountIdFromContext());
        
        Assert.Contains("Account identifier missing or invalid", exception.Message);
        Assert.Equal("INVALID_ACCOUNT_ID", exception.Errors[0].Code);
    }

    [Fact]
    public void GetAccountIdFromContext_WithInvalidAccountIdFormat_ThrowsGraphQLException()
    {
        // Arrange
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "not-a-number")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _mockHttpContext.Setup(c => c.User).Returns(principal);
        _mockHttpContextAccessor.Setup(a => a.HttpContext).Returns(_mockHttpContext.Object);

        // Act & Assert
        var exception = Assert.Throws<GraphQLException>(() => 
            _mockHttpContextAccessor.Object.GetAccountIdFromContext());
        
        Assert.Contains("Account identifier missing or invalid", exception.Message);
        Assert.Equal("INVALID_ACCOUNT_ID", exception.Errors[0].Code);
    }

    [Fact]
    public void GetAccountIdFromContext_WithEmptyAccountId_ThrowsGraphQLException()
    {
        // Arrange
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _mockHttpContext.Setup(c => c.User).Returns(principal);
        _mockHttpContextAccessor.Setup(a => a.HttpContext).Returns(_mockHttpContext.Object);

        // Act & Assert
        var exception = Assert.Throws<GraphQLException>(() => 
            _mockHttpContextAccessor.Object.GetAccountIdFromContext());
        
        Assert.Contains("Account identifier missing or invalid", exception.Message);
    }
}
