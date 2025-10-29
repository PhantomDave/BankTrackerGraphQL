# GraphQL Type Mapping Guide

## Overview

When working with a 3-layer architecture (Library → Data → Api), you need to map your domain models (from Library) to GraphQL types for proper API exposure. This document explains the recommended approach.

## Architecture Layers

```
PhantomDave.BankTracking.Library (Domain Models)
            ↓
PhantomDave.BankTracking.Data (Data Access)
            ↓
PhantomDave.BankTracking.Api (GraphQL API)
            ↓
        Frontend (Angular)
```

## Type Mapping Pattern

### 1. Domain Model (Library)
Located in `PhantomDave.BankTracking.Library/Models/Account.cs`:

```csharp
namespace PhantomDave.BankTracking.Library.Models;

public class Account
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
```

**Responsibility**: Pure domain logic, no framework dependencies.

### 2. GraphQL Type (Api)
Located in `PhantomDave.BankTracking.Api/Types/AccountType.cs`:

```csharp
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Types;

public class AccountType
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Factory method to convert a domain Account model to a GraphQL AccountType
    /// </summary>
    public static AccountType FromAccount(Account account) => new()
    {
        Id = account.Id,
        Name = account.Name,
        CreatedAt = account.CreatedAt,
        UpdatedAt = account.UpdatedAt,
    };
}
```

**Responsibility**: 
- GraphQL schema exposure (HotChocolate auto-discovers public properties)
- Conversion from domain models via factory methods
- GraphQL-specific concerns (permissions, visibility)

### 3. Query Type (Api)
Located in `PhantomDave.BankTracking.Api/Types/Query.cs`:

```csharp
using PhantomDave.BankTracking.Api.Services;

namespace PhantomDave.BankTracking.Api.Types;

public class Query
{
    public async Task<IEnumerable<AccountType>> GetAccounts(
        [Service] AccountService accountService)
    {
        var accounts = await accountService.GetAllAccountsAsync();
        return accounts.Select(AccountType.FromAccount);
    }

    public async Task<AccountType?> GetAccountById(
        int id,
        [Service] AccountService accountService)
    {
        var account = await accountService.GetAccountAsync(id);
        return account != null ? AccountType.FromAccount(account) : null;
    }
}
```

**Responsibility**:
- Expose queries to clients (HotChocolate auto-discovers public methods)
- Call services to get data
- Convert results to GraphQL types
- Use `[Service]` attribute for dependency injection

## Key Principles

### 1. Separation of Concerns
- **Library**: Pure domain models (no dependencies)
- **Api**: GraphQL types that expose only what clients need
- **Services**: Business logic and orchestration

### 2. One-Way Mapping
Always map: `Library Model → Api Type`

This is the recommended direction because:
- Library models are internal to your backend
- GraphQL types define your public contract
- Clients never depend on internal models

### 3. Type Safety
Use factory methods for conversion:

```csharp
public static AccountType FromAccount(Account account) => new()
{
    Id = account.Id,
    Name = account.Name,
    CreatedAt = account.CreatedAt,
    UpdatedAt = account.UpdatedAt,
};
```

Benefits:
- Type-safe at compile time
- Single conversion logic
- Easy to refactor
- Self-documenting

## Adding New Models

When adding a new entity:

1. **Create domain model** in `Library/Models/`:
   ```csharp
   public class Transaction
   {
       public int Id { get; set; }
       public int AccountId { get; set; }
       public decimal Amount { get; set; }
       public DateTime CreatedAt { get; set; }
   }
   ```

2. **Create GraphQL type** in `Api/Types/`:
   ```csharp
   public class TransactionType
   {
       public int Id { get; set; }
       
       public int AccountId { get; set; }
       
       public decimal Amount { get; set; }
       
       public DateTime CreatedAt { get; set; }

       public static TransactionType FromTransaction(Transaction transaction) => new()
       {
           Id = transaction.Id,
           AccountId = transaction.AccountId,
           Amount = transaction.Amount,
           CreatedAt = transaction.CreatedAt,
       };
   }
   ```

3. **Add service method** in `AccountService`:
   ```csharp
   public async Task<IEnumerable<Transaction>> GetAccountTransactionsAsync(int accountId)
   {
       return await _unitOfWork.Transactions.GetByAccountIdAsync(accountId);
   }
   ```

4. **Add query field** or resolver to `Query.cs`:
   ```csharp
   public async Task<IEnumerable<TransactionType>> GetTransactionsByAccountId(
       int accountId,
       [Service] AccountService accountService)
   {
       var transactions = await accountService.GetAccountTransactionsAsync(accountId);
       return transactions.Select(TransactionType.FromTransaction);
   }
   ```

## Best Practices

### ✅ DO

- Create explicit GraphQL types in the Api layer
- Use factory methods for conversion
- Use `[Service]` attribute for dependency injection
- Return `null` for nullable references instead of empty collections
- Document public fields with XML comments

### ❌ DON'T

- Expose domain models directly as GraphQL types
- Create circular dependencies between layers
- Put business logic in type conversion methods
- Return internal models from GraphQL resolvers
- Mix data access logic in GraphQL types

## Project References

Ensure the Api project has these references:

```xml
<!-- PhantomDave.BankTracking.Api.csproj -->
<ItemGroup>
  <ProjectReference Include="..\PhantomDave.BankTracking.Data\PhantomDave.BankTracking.Data.csproj" />
  <ProjectReference Include="..\PhantomDave.BankTracking.Library\PhantomDave.BankTracking.Library.csproj" />
</ItemGroup>
```

This allows:
- Access to domain models from Library
- Access to data services from Data

## Example: Complete Flow

### Request
```graphql
query {
  getAccounts {
    id
    name
    createdAt
  }
}
```

### Flow
1. **Query resolver** calls `accountService.GetAllAccountsAsync()`
2. **Service** calls `_unitOfWork.Accounts.GetAllAsync()`
3. **Repository** queries database and returns `Account` models (Library)
4. **Service** returns `IEnumerable<Account>`
5. **Query resolver** converts each with `AccountType.FromAccount()`
6. **GraphQL server** serializes to JSON response

### Response
```json
{
  "data": {
    "getAccounts": [
      {
        "id": 1,
        "name": "Checking Account",
        "createdAt": "2025-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "name": "Savings Account",
        "createdAt": "2025-02-20T14:45:00Z"
      }
    ]
  }
}
```

## Summary

The key to handling types with the Library project is maintaining clear separation:
- **Library** defines the schema
- **Api** defines the GraphQL contract
- **Mapping** happens explicitly with factory methods
- **Services** orchestrate the flow

This ensures maintainability, type safety, and clear dependencies.

