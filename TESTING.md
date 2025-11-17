# Testing Infrastructure

This document describes the comprehensive testing strategy for the BankTracker GraphQL application.

## Overview

The testing infrastructure includes:
- **Unit Tests**: xUnit for .NET backend services and repositories
- **Integration Tests**: xUnit with WebApplicationFactory for GraphQL API
- **E2E Tests**: Playwright for full-stack user flows

## Test Projects Structure

```
PhantomDave.BankTracking.UnitTests/
├── Services/
│   ├── JwtTokenServiceTests.cs          (6 tests)
│   └── AccountServiceTests.cs           (11 tests)
└── Repositories/                         (ready for expansion)

PhantomDave.BankTracking.IntegrationTests/
├── GraphQL/
│   └── AccountIntegrationTests.cs       (7 tests)
└── Helpers/
    └── GraphQLTestFactory.cs

frontend/
├── e2e/
│   └── app.spec.ts                      (3 E2E tests)
└── playwright.config.ts
```

## Running Tests

### Backend Unit Tests

```bash
# Run all unit tests
dotnet test PhantomDave.BankTracking.UnitTests/PhantomDave.BankTracking.UnitTests.csproj

# Run with detailed output
dotnet test PhantomDave.BankTracking.UnitTests/PhantomDave.BankTracking.UnitTests.csproj --logger "console;verbosity=detailed"

# Run with code coverage
dotnet test PhantomDave.BankTracking.UnitTests/PhantomDave.BankTracking.UnitTests.csproj --collect:"XPlat Code Coverage"
```

**Current Status**: ✅ **17/17 tests passing**

### Backend Integration Tests

```bash
# Run integration tests
dotnet test PhantomDave.BankTracking.IntegrationTests/PhantomDave.BankTracking.IntegrationTests.csproj

# Run with detailed output
dotnet test PhantomDave.BankTracking.IntegrationTests/PhantomDave.BankTracking.IntegrationTests.csproj --logger "console;verbosity=detailed"
```

**Current Status**: ⚠️ **3/7 tests passing** (4 tests need GraphQL schema fixes)

### Frontend E2E Tests

```bash
cd frontend

# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with browser UI
npm run test:e2e:headed

# Run E2E tests in interactive UI mode
npm run test:e2e:ui
```

**Current Status**: ✅ **Playwright configured and ready**

### Run All Tests

```bash
# From repository root
dotnet test
cd frontend && npm run test:e2e
```

## Test Coverage

### Unit Tests Coverage

The unit tests cover:

#### JwtTokenService (6 tests)
- ✅ Token creation with valid inputs
- ✅ Token creation with roles
- ✅ Expiration time setting
- ✅ JTI claim inclusion
- ✅ Unique token generation

#### AccountService (11 tests)
- ✅ Get account by ID (valid/invalid)
- ✅ Get account by email
- ✅ Create account with valid data
- ✅ Create account validation (empty email/password)
- ✅ Create account duplicate email check
- ✅ Update account
- ✅ Update account with invalid ID
- ✅ Login with valid credentials
- ✅ Login with invalid password
- ✅ Login with non-existent email

### Integration Tests Coverage

Integration tests verify:
- ✅ GraphQL endpoint accessibility
- ✅ Account creation via GraphQL mutation
- ✅ Duplicate email handling
- ✅ Invalid password error handling
- ⚠️ Token verification (needs schema fix)
- ⚠️ Login flow (needs schema fix)
- ⚠️ Authenticated queries (needs schema fix)

### E2E Tests Coverage

Playwright E2E tests verify:
- ✅ Homepage loading
- ✅ Login form presence
- ✅ Navigation functionality

## Testing Best Practices

### Unit Tests
1. **Isolation**: Use mocks (Moq) to isolate units under test
2. **Naming**: Use descriptive test names: `MethodName_Scenario_ExpectedResult`
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Coverage**: Aim for >80% code coverage for business logic

### Integration Tests
1. **In-Memory Database**: Tests use EF Core InMemory provider
2. **Test Environment**: Tests run in "Testing" environment to skip migrations
3. **Factory Pattern**: `GraphQLTestFactory` provides consistent test setup
4. **Cleanup**: Each test uses fresh database state

### E2E Tests
1. **Real Browser**: Playwright uses real Chromium browser
2. **Selectors**: Use semantic selectors (accessibility IDs, roles)
3. **Waits**: Use Playwright's auto-waiting features
4. **Screenshots**: Captured on failure for debugging
5. **Traces**: Enabled on retry for detailed debugging

## Framework Selection Rationale

### xUnit for .NET Tests
**Why xUnit?**
- Modern, minimalistic syntax for .NET 10
- Built-in parallel test execution for faster CI
- Excellent dependency injection support
- Industry standard for new .NET projects
- Great integration with Visual Studio and CLI

**Alternatives Considered:**
- NUnit: More verbose, better for legacy projects
- MSTest: Microsoft ecosystem lock-in

### Playwright for E2E Tests
**Why Playwright?**
- Cross-browser support (Chromium, Firefox, WebKit)
- Modern API with auto-waiting
- Excellent debugging tools (traces, screenshots)
- Better GraphQL testing support
- Multi-tab and multi-origin support
- Native TypeScript support

**Alternatives Considered:**
- Cypress: Easier but limited to Chrome, same-origin restrictions
- Selenium: Older, less reliable, more flaky tests

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '10.0.x'
    
    - name: Run Unit Tests
      run: dotnet test PhantomDave.BankTracking.UnitTests/
    
    - name: Run Integration Tests
      run: dotnet test PhantomDave.BankTracking.IntegrationTests/
    
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install Dependencies
      working-directory: frontend
      run: npm ci
    
    - name: Install Playwright
      working-directory: frontend
      run: npx playwright install --with-deps chromium
    
    - name: Run E2E Tests
      working-directory: frontend
      run: npm run test:e2e
```

## Code Coverage Reporting

Generate code coverage report:

```bash
# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults

# Install reportgenerator tool (one-time)
dotnet tool install -g dotnet-reportgenerator-globaltool

# Generate HTML report
reportgenerator \
  -reports:"./TestResults/**/coverage.cobertura.xml" \
  -targetdir:"./CoverageReport" \
  -reporttypes:Html

# View report
open ./CoverageReport/index.html
```

## Adding New Tests

### Adding a Unit Test

1. Create test file in appropriate directory: `PhantomDave.BankTracking.UnitTests/Services/MyServiceTests.cs`
2. Follow AAA pattern (Arrange-Act-Assert)
3. Use descriptive test names
4. Mock dependencies with Moq

Example:
```csharp
public class MyServiceTests
{
    [Fact]
    public async Task MethodName_WhenCondition_ThenExpectedBehavior()
    {
        // Arrange
        var mockDependency = new Mock<IDependency>();
        var service = new MyService(mockDependency.Object);
        
        // Act
        var result = await service.MethodName();
        
        // Assert
        Assert.NotNull(result);
        mockDependency.Verify(d => d.SomeMethod(), Times.Once);
    }
}
```

### Adding an Integration Test

1. Use `IClassFixture<GraphQLTestFactory>` for test class
2. Create GraphQL queries/mutations as strings
3. Use `HttpClient` to post to `/graphql`
4. Assert on response content

### Adding an E2E Test

1. Create test file in `frontend/e2e/`
2. Use Playwright's `test` and `expect` functions
3. Navigate with `page.goto()`
4. Interact with elements using semantic selectors
5. Use auto-waiting features

## Troubleshooting

### Unit Tests Fail to Build

```bash
# Restore packages
dotnet restore

# Clean and rebuild
dotnet clean
dotnet build
```

### Integration Tests Database Issues

The tests use in-memory database. If you see database errors:
1. Ensure `UseEnvironment("Testing")` is set in `GraphQLTestFactory`
2. Check that `Program.cs` skips migration in Testing environment

### E2E Tests Won't Start

```bash
# Reinstall Playwright browsers
cd frontend
npx playwright install --with-deps chromium

# Check if Angular dev server starts
npm start
```

### Playwright Tests Timeout

Increase timeout in `playwright.config.ts`:
```typescript
use: {
  baseURL: 'http://localhost:4200',
  timeout: 60000, // Increase from default 30s
}
```

## Future Improvements

### High Priority
- [ ] Fix remaining 4 integration tests
- [ ] Add repository layer unit tests
- [ ] Add finance record service unit tests
- [ ] Expand E2E tests to cover full user journeys

### Medium Priority
- [ ] Add mutation testing with Stryker.NET
- [ ] Integrate coverage reporting into CI
- [ ] Add performance tests for critical queries
- [ ] Add contract tests for GraphQL schema

### Low Priority
- [ ] Add visual regression tests with Playwright
- [ ] Add load tests with k6 or Artillery
- [ ] Add accessibility tests with axe-core

## Resources

- [xUnit Documentation](https://xunit.net/)
- [Playwright Documentation](https://playwright.dev/)
- [Moq Documentation](https://github.com/moq/moq4)
- [FluentAssertions Documentation](https://fluentassertions.com/)
- [WebApplicationFactory Documentation](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests)
