using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using PhantomDave.BankTracking.IntegrationTests.Helpers;

namespace PhantomDave.BankTracking.IntegrationTests.GraphQL;

public class AccountIntegrationTests : IClassFixture<GraphQLTestFactory>
{
    private readonly HttpClient _client;
    private readonly GraphQLTestFactory _factory;

    public AccountIntegrationTests(GraphQLTestFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateAccount_WithValidData_ReturnsNewAccount()
    {
        // Arrange
        var query = @"
            mutation {
                createAccount(email: ""test@example.com"", password: ""Password123!"") {
                    id
                    email
                    createdAt
                }
            }";

        var request = new
        {
            query = query
        };

        // Act
        var response = await _client.PostAsJsonAsync("/graphql", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("test@example.com");
        content.Should().Contain("\"id\"");
    }

    [Fact]
    public async Task CreateAccount_WithDuplicateEmail_ReturnsError()
    {
        // Arrange
        var createQuery = @"
            mutation {
                createAccount(email: ""duplicate@example.com"", password: ""Password123!"") {
                    id
                    email
                }
            }";

        await _client.PostAsJsonAsync("/graphql", new { query = createQuery });

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

        var createQuery = $@"
            mutation {{
                createAccount(email: ""{email}"", password: ""{password}"") {{
                    id
                }}
            }}";

        await _client.PostAsJsonAsync("/graphql", new { query = createQuery });

        var loginQuery = $@"
            mutation {{
                loginAccount(email: ""{email}"", password: ""{password}"") {{
                    token
                    account {{
                        id
                        email
                    }}
                }}
            }}";

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

        var createQuery = $@"
            mutation {{
                createAccount(email: ""{email}"", password: ""{correctPassword}"") {{
                    id
                }}
            }}";

        await _client.PostAsJsonAsync("/graphql", new { query = createQuery });

        var loginQuery = $@"
            mutation {{
                loginAccount(email: ""{email}"", password: ""{wrongPassword}"") {{
                    token
                }}
            }}";

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

        var createQuery = $@"
            mutation {{
                createAccount(email: ""{email}"", password: ""{password}"") {{
                    id
                }}
            }}";

        await _client.PostAsJsonAsync("/graphql", new { query = createQuery });

        var loginQuery = $@"
            mutation {{
                loginAccount(email: ""{email}"", password: ""{password}"") {{
                    token
                }}
            }}";

        var loginResponse = await _client.PostAsJsonAsync("/graphql", new { query = loginQuery });
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        
        using var doc = JsonDocument.Parse(loginContent);
        var token = doc.RootElement.GetProperty("data").GetProperty("loginAccount").GetProperty("token").GetString();

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

        var createQuery = $@"
            mutation {{
                createAccount(email: ""{email}"", password: ""{password}"") {{
                    id
                }}
            }}";

        await _client.PostAsJsonAsync("/graphql", new { query = createQuery });

        var loginQuery = $@"
            mutation {{
                loginAccount(email: ""{email}"", password: ""{password}"") {{
                    token
                    account {{
                        id
                    }}
                }}
            }}";

        var loginResponse = await _client.PostAsJsonAsync("/graphql", new { query = loginQuery });
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        
        using var doc = JsonDocument.Parse(loginContent);
        var token = doc.RootElement.GetProperty("data").GetProperty("loginAccount").GetProperty("token").GetString();
        var accountId = doc.RootElement.GetProperty("data").GetProperty("loginAccount").GetProperty("account").GetProperty("id").GetInt32();

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
