# Account GraphQL Operations Refactoring

This document explains the refactoring of account-related GraphQL operations to use Apollo Angular's typed GQL service pattern.

## Overview

All account operations have been migrated from using raw GraphQL queries/mutations with Apollo client to using generated, type-safe Apollo Angular GQL services.

## What Changed

### Before
```typescript
// Direct Apollo usage
this.apollo.query({
  query: GET_ACCOUNT_BY_EMAIL,
  variables: { email }
})

this.apollo.mutate({
  mutation: CREATE_ACCOUNT,
  variables: { email, password }
})
```

### After
```typescript
// Generated typed GQL services
this.getAccountByEmailGQL.fetch({ variables: { email } })
this.createAccountGQL.mutate({ variables: { email, password } })
this.loginAccountGQL.mutate({ variables: { email, password } })
```

## Generated GQL Classes

The following injectable GQL classes are now available in `src/generated/graphql.ts`:

### Queries
- **GetAccountByEmailGQL** - Fetch account by email
- **GetAccountsGQL** - Fetch all accounts

### Mutations
- **CreateAccountGQL** - Create a new account
- **LoginAccountGQL** - Login with email and password (changed from Query to Mutation for proper authentication semantics)

## Usage

### Using AccountService (Recommended)
The AccountService provides high-level methods that wrap the GQL classes with error handling and state management:

```typescript
import { AccountService } from './models/account/account-service';

export class MyComponent {
  private readonly accountService = inject(AccountService);
  
  async login() {
    const account = await this.accountService.loginAccount(email, password);
  }
  
  async register() {
    const result = await this.accountService.createAccount(email, password);
  }
}
```

### Using GQL Classes Directly (Advanced)
For more control, you can inject the GQL classes directly:

```typescript
import { LoginAccountGQL, CreateAccountGQL } from './generated/graphql';
import { firstValueFrom } from 'rxjs';

export class MyComponent {
  private readonly loginGQL = inject(LoginAccountGQL);
  private readonly createAccountGQL = inject(CreateAccountGQL);
  
  async login(email: string, password: string) {
    const result = await firstValueFrom(
      this.loginGQL.watch({ variables: { email, password } }).valueChanges
    );
    return result.data?.loginAccount;
  }
  
  async register(email: string, password: string) {
    const result = await firstValueFrom(
      this.createAccountGQL.mutate({ variables: { email, password } })
    );
    return result.data?.createAccount;
  }
}
```

## Adding New Operations

To add a new account operation:

1. Create a `.graphql` file in `src/graphql/`:
```graphql
# src/graphql/update-account.mutation.graphql
mutation UpdateAccount($id: Int!, $email: String!) {
  updateAccount(id: $id, email: $email) {
    id
    email
    createdAt
    updatedAt
  }
}
```

2. Run code generation:
```bash
npm run codegen
```

3. The new `UpdateAccountGQL` class will be generated and can be injected:
```typescript
import { UpdateAccountGQL } from './generated/graphql';

export class AccountService {
  private readonly updateAccountGQL = inject(UpdateAccountGQL);
  
  async updateAccount(id: number, email: string) {
    const result = await firstValueFrom(
      this.updateAccountGQL.mutate({ variables: { id, email } })
    );
    return result.data?.updateAccount;
  }
}
```

## Benefits

1. **Type Safety**: Full TypeScript type checking for all GraphQL operations
2. **Auto-completion**: IDE provides suggestions for available fields and variables
3. **Consistency**: All operations follow the same pattern
4. **Maintainability**: Easier to add, modify, and remove operations
5. **Code Generation**: No manual type definitions needed

## Migration Notes

- Old `account.queries.ts` and `account.mutations.ts` files have been removed
- The `Account` interface was updated to match generated types (`updatedAt?: string | null`)
- All existing components using AccountService continue to work without changes
