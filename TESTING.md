# BankTracker Testing Documentation

## Overview
This document describes the testing strategy and test coverage for the BankTracker application.

## Test Statistics
- **Unit Tests**: 76 (all passing)
- **Integration Tests**: 7 (all passing)
- **Total**: 83 tests

## Running Tests

### Run All Tests
```bash
./run-all-tests.sh
```

### Run Unit Tests Only
```bash
dotnet test PhantomDave.BankTracking.UnitTests/PhantomDave.BankTracking.UnitTests.csproj
```

### Run Integration Tests Only
```bash
dotnet test PhantomDave.BankTracking.IntegrationTests/PhantomDave.BankTracking.IntegrationTests.csproj
```

### Run with Coverage
```bash
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults
```

## Unit Test Coverage

### HttpContextExtensions (7 tests)
Tests authentication and authorization context handling:
- ✅ `GetAccountIdFromContext_WithValidToken_ReturnsAccountId`
- ✅ `GetAccountIdFromContext_WithUnauthenticatedUser_ThrowsGraphQLException`
- ✅ `GetAccountIdFromContext_WithNullHttpContext_ThrowsGraphQLException`
- ✅ `GetAccountIdFromContext_WithNullUser_ThrowsGraphQLException`
- ✅ `GetAccountIdFromContext_WithMissingNameIdentifierClaim_ThrowsGraphQLException`
- ✅ `GetAccountIdFromContext_WithInvalidAccountIdFormat_ThrowsGraphQLException`
- ✅ `GetAccountIdFromContext_WithEmptyAccountId_ThrowsGraphQLException`

### AccountService (10 tests)
Tests account management operations:
- ✅ `GetAccountAsync_WithValidId_ReturnsAccount`
- ✅ `GetAccountAsync_WithInvalidId_ReturnsNull`
- ✅ `GetAccountByEmail_WithValidEmail_ReturnsAccount`
- ✅ `CreateAccountAsync_WithValidData_CreatesAccount`
- ✅ `CreateAccountAsync_WithEmptyEmail_ReturnsNull`
- ✅ `CreateAccountAsync_WithEmptyPassword_ReturnsNull`
- ✅ `CreateAccountAsync_WithExistingEmail_ReturnsNull`
- ✅ `UpdateAccountAsync_WithValidData_UpdatesAccount`
- ✅ `UpdateAccountAsync_WithInvalidId_ReturnsNull`
- ✅ `LoginAccountAsync_With*_*` (3 tests)

### FinanceRecordService (19 tests)
Tests finance record CRUD and business logic:
- ✅ `GetFinanceRecordAsync_WithValidId_ReturnsRecord`
- ✅ `GetFinanceRecordAsync_WithInvalidId_ReturnsNull`
- ✅ `CreateFinanceRecordAsync_WithValidData_CreatesRecord`
- ✅ `CreateFinanceRecordAsync_WithInvalidAccount_ReturnsNull`
- ✅ `CreateFinanceRecordAsync_WithEmptyCurrency_ReturnsNull`
- ✅ `CreateFinanceRecordAsync_WithTooLongCurrency_ReturnsNull`
- ✅ `CreateFinanceRecordAsync_NormalizesCurrencyToUppercase`
- ✅ `CreateFinanceRecordAsync_TruncatesLongDescription`
- ✅ `CreateFinanceRecordAsync_WithRecurringData_SetsRecurrenceFields`
- ✅ `UpdateFinanceRecordAsync_WithValidData_UpdatesRecord`
- ✅ `UpdateFinanceRecordAsync_WithInvalidId_ReturnsNull`
- ✅ `UpdateFinanceRecordAsync_WithInvalidCurrency_ReturnsNull`
- ✅ `DeleteFinanceRecordAsync_WithValidId_DeletesRecord`
- ✅ `DeleteFinanceRecordAsync_WithInvalidId_ReturnsFalse`
- Plus more edge case tests

**Key Behaviors Tested:**
- Currency is normalized to uppercase (e.g., "usd" → "USD")
- Currency must be 1-3 characters
- Description is truncated to 500 characters
- Dates are normalized to UTC
- Recurring records properly set frequency and end date

### DashboardService (19 tests)
Tests dashboard and widget management:
- ✅ `GetDashboardAsync_WithValidId_ReturnsDashboard`
- ✅ `CreateDashboardAsync_WithValidName_CreatesDashboard`
- ✅ `CreateDashboardAsync_WithEmptyName_ReturnsNull`
- ✅ `CreateDashboardAsync_TruncatesLongName`
- ✅ `UpdateDashboardAsync_WithValidData_UpdatesDashboard`
- ✅ `UpdateDashboardAsync_WithEmptyName_DoesNotUpdateName`
- ✅ `DeleteDashboardAsync_WithValidId_DeletesDashboard`
- ✅ `AddWidgetAsync_WithValidData_AddsWidget`
- ✅ `AddWidgetAsync_WithNegativeRows_ReturnsNull`
- ✅ `AddWidgetAsync_WithZeroCols_ReturnsNull`
- ✅ `AddWidgetAsync_WithNegativePosition_NormalizesToZero`
- ✅ `UpdateWidgetAsync_WithValidData_UpdatesWidget`
- ✅ `UpdateWidgetAsync_WithZeroRows_ReturnsNull`
- ✅ `RemoveWidgetAsync_WithValidId_RemovesWidget`
- Plus more validation tests

**Key Behaviors Tested:**
- Dashboard names truncated to 100 characters
- Widget rows and cols must be > 0
- Negative X/Y positions normalized to 0
- Widget types: NetGraph, CurrentBalance

### ColumnDetectionService (14 tests)
Tests multi-language column detection for CSV/Excel imports:
- ✅ `DetectColumns_WithEnglishDateHeader_ReturnsDateMapping`
- ✅ `DetectColumns_WithItalianDateHeader_ReturnsDateMapping`
- ✅ `DetectColumns_WithSpanishDateHeader_ReturnsDateMapping`
- ✅ `DetectColumns_WithAmountVariations_ReturnsAmountMapping`
- ✅ `DetectColumns_WithDescriptionVariations_ReturnsDescriptionMapping`
- ✅ `DetectColumns_WithBalanceVariations_ReturnsBalanceMapping`
- ✅ `DetectColumns_WithCurrencyVariations_ReturnsCurrencyMapping`
- ✅ `DetectColumns_WithNameVariations_ReturnsNameMapping`
- ✅ `DetectColumns_IsCaseInsensitive`
- ✅ `DetectColumns_WithMixedLanguageHeaders_DetectsAll`
- ✅ `DetectColumns_WithCompoundHeaders_DetectsCorrectly`
- Plus more edge cases

**Supported Languages:**
- English: Date, Amount, Description, Balance, Currency, Name
- Italian: Data, Importo, Descrizione, Saldo, Valuta, Nome
- Spanish: Fecha, Monto, Descripcion, Saldo, Moneda, Nombre
- German: Datum, Betrag, Beschreibung, Saldo, Währung

### JwtTokenService (7 tests)
Tests JWT token creation and validation:
- ✅ `CreateToken_WithValidInputs_ReturnsValidJwtToken`
- ✅ `CreateToken_WithRoles_IncludesRolesInToken`
- ✅ `CreateToken_SetsExpirationTime`
- ✅ `CreateToken_IncludesJtiClaim`
- ✅ `CreateToken_CreatesUniqueTokens`

## Integration Test Coverage

### AccountIntegrationTests (7 tests)
End-to-end GraphQL API tests:
- ✅ `GraphQL_Endpoint_IsAccessible`
- ✅ `CreateAccount_WithValidData_ReturnsSuccess`
- ✅ `CreateAccount_WithDuplicateEmail_ReturnsError`
- ✅ `Login_WithValidCredentials_ReturnsToken`
- ✅ `Login_WithInvalidPassword_ReturnsError`
- ✅ `VerifyToken_WithValidToken_ReturnsToken`
- ✅ `GetAccount_ByEmail_ReturnsAccountData`

**Infrastructure:**
- Uses in-memory database
- Tests actual GraphQL queries/mutations
- Validates JWT token flow
- Tests error handling and validation

## Test Patterns and Best Practices

### Unit Tests
- Use Moq for mocking dependencies
- Follow AAA pattern (Arrange, Act, Assert)
- Test one behavior per test
- Use descriptive test names: `MethodName_Scenario_ExpectedBehavior`
- Mock only external dependencies (repositories, unit of work)

### Integration Tests
- Use WebApplicationFactory for hosting
- Test full request/response cycle
- Validate GraphQL responses
- Test authentication flows
- Use in-memory database

## Test Dependencies
- **xUnit**: Test framework
- **Moq**: Mocking library
- **FluentAssertions**: Fluent assertion library
- **Microsoft.EntityFrameworkCore.InMemory**: In-memory database for testing
- **Microsoft.AspNetCore.Mvc.Testing**: Integration testing infrastructure

## Code Coverage
Code coverage reports are generated in the `./TestResults/` directory when running:
```bash
dotnet test --collect:"XPlat Code Coverage"
```

## Future Test Additions
Potential areas for additional test coverage:
- FileImportService (CSV/Excel parsing)
- RecurringFinanceRecordService (background job logic)
- GraphQL integration tests for FinanceRecords
- GraphQL integration tests for Dashboards
- End-to-end import workflow tests
- Frontend E2E tests with Playwright

## Notes
- Some methods that use EF Core's `Query().ToListAsync()` are better tested with integration tests
- All tests run in isolation and don't affect each other
- Integration tests use a fresh database for each test class
- Tests are fast: full suite runs in < 10 seconds

## Continuous Integration
Tests are automatically run on:
- Every push to PR branches
- Every pull request
- Before merging to main

CI configuration in `.github/workflows/tests.yml`
