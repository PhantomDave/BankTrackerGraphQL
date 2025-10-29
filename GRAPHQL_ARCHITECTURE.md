# GraphQL Architecture

## Overview

Questo progetto usa **Hot Chocolate 15** con un'architettura basata su **Type Extensions** per garantire scalabilità e organizzazione modulare.

## Come funziona

### Auto-Discovery dei Type Extensions

Il file `Program.cs` contiene un metodo `RegisterTypeExtensions` che usa reflection per scoprire automaticamente tutte le classi nell'assembly che hanno l'attributo `[ExtendObjectType]`.

```csharp
private static void RegisterTypeExtensions(IRequestExecutorBuilder builder, Assembly assembly)
{
    var typeExtensions = assembly.GetTypes()
        .Where(t => t.GetCustomAttribute<ExtendObjectTypeAttribute>() != null)
        .ToList();

    foreach (var type in typeExtensions)
    {
        builder.AddTypeExtension(type);
    }
}
```

### Vantaggi

1. **Non serve registrare manualmente ogni tipo** - aggiungi semplicemente l'attributo `[ExtendObjectType]`
2. **Organizzazione modulare** - puoi avere multiple classi Query/Mutation organizzate per dominio
3. **Scalabilità** - aggiungi 100 query/mutation senza modificare Program.cs

## Struttura dei File

### Query Extensions

Ogni dominio può avere la sua classe Query. Esempio:

**Types/Queries/AccountQueries.cs**
```csharp
using HotChocolate.Types;

namespace PhantomDave.BankTracking.Api.Types.Queries;

[ExtendObjectType(OperationTypeNames.Query)]
public class AccountQueries
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

**Types/Queries/TransactionQueries.cs**
```csharp
using HotChocolate.Types;

namespace PhantomDave.BankTracking.Api.Types.Queries;

[ExtendObjectType(OperationTypeNames.Query)]
public class TransactionQueries
{
    public async Task<IEnumerable<TransactionType>> GetTransactions(
        [Service] TransactionService transactionService)
    {
        // ...
    }
}
```

### Mutation Extensions

Stessa cosa per le Mutation:

**Types/Mutations/AccountMutations.cs**
```csharp
using HotChocolate.Types;

namespace PhantomDave.BankTracking.Api.Types.Mutations;

[ExtendObjectType(OperationTypeNames.Mutation)]
public class AccountMutations
{
    public async Task<AccountType> CreateAccount(
        string email,
        string password,
        [Service] AccountService accountService)
    {
        // ...
    }
}
```

## Organizzazione Consigliata

```
Types/
  ├── Queries/
  │   ├── AccountQueries.cs
  │   ├── TransactionQueries.cs
  │   └── ReportQueries.cs
  ├── Mutations/
  │   ├── AccountMutations.cs
  │   ├── TransactionMutations.cs
  │   └── ReportMutations.cs
  └── ObjectTypes/
      ├── AccountType.cs
      ├── TransactionType.cs
      └── ReportType.cs
```

## Dependency Injection

I servizi vengono iniettati automaticamente usando l'attributo `[Service]`:

```csharp
public async Task<AccountType?> GetAccountById(
    int id,
    [Service] AccountService accountService)  // ← Auto-injected
{
    // ...
}
```

## Best Practices

1. **Separare Query da Mutation** - Le operazioni di lettura in Query, le modifiche in Mutation
2. **Un file per dominio** - `AccountQueries.cs`, `TransactionQueries.cs`, etc.
3. **Validazione** - Usa `GraphQLException` con `ErrorBuilder` per errori strutturati
4. **Type-Safety** - Usa sempre tipi GraphQL specifici (es. `AccountType`) invece di entità del database

## Come Aggiungere Nuove Query/Mutation

1. Crea un nuovo file in `Types/Queries/` o `Types/Mutations/`
2. Aggiungi l'attributo `[ExtendObjectType]` appropriato
3. Definisci i metodi pubblici - diventeranno automaticamente query/mutation GraphQL
4. Non serve modificare `Program.cs` - la discovery è automatica!

```csharp
[ExtendObjectType(OperationTypeNames.Query)]
public class MyNewQueries
{
    // Questo diventa automaticamente disponibile come query GraphQL!
    public string GetSomething() => "Hello";
}
```

