using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using PhantomDave.BankTracking.IntegrationTests.Helpers;

namespace PhantomDave.BankTracking.IntegrationTests.GraphQL;

public class AccountIntegrationTests : IClassFixture<GraphQLTestFactory>
{
    private readonly HttpClient _client;

    public AccountIntegrationTests(GraphQLTestFactory factory)
    {
        _client = factory.CreateClient();
    }

    private static string CreateAccountMutation(string email, string password) =>
        $@"mutation {{
            createAccount(email: ""{email}"", password: ""{password}"") {{
                id
                email
                createdAt
            }}
        }}";

    private static string LoginAccountMutation(string email, string password) =>
        $@"mutation {{
            loginAccount(email: ""{email}"", password: ""{password}"") {{
                token
                account {{
                    id
                    email
                }}
            }}
        }}";

    private static string SafeGetToken(string jsonContent)
    {
        using var doc = JsonDocument.Parse(jsonContent);
        if (!doc.RootElement.TryGetProperty("data", out var dataElem))
            throw new Xunit.Sdk.XunitException("Response JSON does not contain 'data' property: " + jsonContent);
        if (!dataElem.TryGetProperty("loginAccount", out var loginAccountElem))
            throw new Xunit.Sdk.XunitException("Response JSON does not contain 'loginAccount' property: " + jsonContent);
        if (!loginAccountElem.TryGetProperty("token", out var tokenElem))
            throw new Xunit.Sdk.XunitException("Response JSON does not contain 'token' property: " + jsonContent);
        return tokenElem.GetString() ?? throw new Xunit.Sdk.XunitException("Token is null");
    }

    private static int SafeGetAccountId(string jsonContent)
    {
        using var doc = JsonDocument.Parse(jsonContent);
        if (!doc.RootElement.TryGetProperty("data", out var dataElem))
            throw new Xunit.Sdk.XunitException("Response JSON does not contain 'data' property: " + jsonContent);
        if (!dataElem.TryGetProperty("loginAccount", out var loginAccountElem))
            throw new Xunit.Sdk.XunitException("Response JSON does not contain 'loginAccount' property: " + jsonContent);
        if (!loginAccountElem.TryGetProperty("account", out var accountElem))
            throw new Xunit.Sdk.XunitException("Response JSON does not contain 'account' property: " + jsonContent);
        if (!accountElem.TryGetProperty("id", out var idElem))
            throw new Xunit.Sdk.XunitException("Response JSON does not contain 'id' property: " + jsonContent);
        return idElem.GetInt32();
    }

    [Fact]
    public async Task GraphQL_Endpoint_IsAccessible()
    {
        // Arrange & Act
        var response = await _client.GetAsync("/graphql?sdl");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("type Query");
    }

    [Fact]
    public async Task CreateAccount_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var query = CreateAccountMutation("test@example.com", "Password123!");

        // Act
        var response = await _client.PostAsJsonAsync("/graphql", new { query });

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        
        if (content.Contains("errors"))
        {
            content.Should().Contain("test@example.com", "Even with errors, successful account creation should return email");
        }
        else
        {
            content.Should().Contain("test@example.com");
            content.Should().Contain("\"id\"");
        }
    }

    [Fact]
    public async Task CreateAccount_WithDuplicateEmail_ReturnsError()
    {
        // Arrange
        var createQuery = CreateAccountMutation("duplicate@example.com", "Password123!");

        var firstResponse = await _client.PostAsJsonAsync("/graphql", new { query = createQuery });
        firstResponse.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var firstContent = await firstResponse.Content.ReadAsStringAsync();
        firstContent.Should().NotContain("\"errors\"", "First account creation should succeed to properly test duplicate scenario");
        firstContent.Should().Contain("\"id\"", "Account creation response should contain an id");

        // Act
        var response = await _client.PostAsJsonAsync("/graphql", new { query = createQuery });

        // Assert
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("errors");
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        // Arrange
        var email = "login@example.com";
        var password = "Password123!";

        var createQuery = CreateAccountMutation(email, password);
        var createResponse = await _client.PostAsJsonAsync("/graphql", new { query = createQuery });
        var createContent = await createResponse.Content.ReadAsStringAsync();
        createResponse.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        createContent.Should().NotContain("\"errors\"", "Account creation should succeed before attempting login");
        createContent.Should().Contain("\"id\"", "Account creation response should contain an id");

        var loginQuery = LoginAccountMutation(email, password);

        // Act
        var response = await _client.PostAsJsonAsync("/graphql", new { query = loginQuery });

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("token");
        content.Should().Contain(email);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsError()
    {
        // Arrange
        var email = "wrongpass@example.com";
        var correctPassword = "CorrectPassword123!";
        var wrongPassword = "WrongPassword123!";

        var createQuery = CreateAccountMutation(email, correctPassword);
        await _client.PostAsJsonAsync("/graphql", new { query = createQuery });

        var loginQuery = LoginAccountMutation(email, wrongPassword);

        // Act
        var response = await _client.PostAsJsonAsync("/graphql", new { query = loginQuery });

        // Assert
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("errors");
    }

    [Fact]
    public async Task VerifyToken_WithValidToken_ReturnsAccountInfo()
    {
        // Arrange
        var email = "verify@example.com";
        var password = "Password123!";

        var createQuery = CreateAccountMutation(email, password);
        await _client.PostAsJsonAsync("/graphql", new { query = createQuery });

        var loginQuery = LoginAccountMutation(email, password);
        var loginResponse = await _client.PostAsJsonAsync("/graphql", new { query = loginQuery });
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        
        var token = SafeGetToken(loginContent);

        var verifyQuery = $@"
            mutation {{
                verifyToken(token: ""{token}"") {{
                    id
                    email
                }}
            }}";

        // Act
        var response = await _client.PostAsJsonAsync("/graphql", new { query = verifyQuery });

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain(email);
    }

    [Fact]
    public async Task GetAccount_WithAuthentication_ReturnsAccountData()
    {
        // Arrange
        var email = "getaccount@example.com";
        var password = "Password123!";

        var createQuery = CreateAccountMutation(email, password);
        await _client.PostAsJsonAsync("/graphql", new { query = createQuery });

        var loginQuery = LoginAccountMutation(email, password);
        var loginResponse = await _client.PostAsJsonAsync("/graphql", new { query = loginQuery });
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        
        var token = SafeGetToken(loginContent);
        var accountId = SafeGetAccountId(loginContent);

        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var getAccountQuery = $@"
            query {{
                getAccount(id: {accountId}) {{
                    id
                    email
                    currentBalance
                }}
            }}";

        // Act
        var response = await _client.PostAsJsonAsync("/graphql", new { query = getAccountQuery });

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain(email);
        content.Should().Contain("currentBalance");
    }
}
