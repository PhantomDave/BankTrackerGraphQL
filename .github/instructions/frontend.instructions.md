---
applyTo:
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.html"
  - "frontend/src/**/*.scss"
  - "frontend/src/**/*.css"
---

# Frontend Development Instructions (Angular 20 + Apollo + Material)

## Angular Best Practices
- App uses `provideZonelessChangeDetection()` - signals are the primary state mechanism
- Angular 20+ makes components standalone by default (no need to explicitly set `standalone: true`)
- Always list dependencies in the `imports` array of `@Component` decorator
- Prefer Angular Material components before creating custom UI

## Signals & State Management
- Use `signal()`, `computed()`, and `effect()` for state management
- Use `.set()` or `.update()` - never `.mutate()`
- State is managed inside `models/*-service.ts` files
- Update signals in `tap()` when bridging from RxJS

## Apollo GraphQL
- Use generated Apollo classes (e.g., `CreateAccountGQL`, `GetFinanceRecordsGQL`)
- Use `firstValueFrom()` or `.watch().valueChanges` for queries
- Match operation names with `refetchQueries` strings (e.g., `'getFinanceRecords'`)
- Add new operations as `.graphql` files near the feature

## Authentication
- Auth state stored in `localStorage` as `sessionData`
- Guards and `unauthorizedInterceptor` expect `SessionData` to stay in sync
- Look for `UNAUTHENTICATED` error code to trigger logout

## UI & Styling
- UI feedback goes through `SnackbarService.success/error`
- Avoid `@HostBinding`/`@HostListener` - use `host` object instead
- Use English for all user-facing messages

## GraphQL Operations
- Keep operation names unique and PascalCase/camelCase matching existing usage
- Run `npm run codegen` after changing `.graphql` files
- Update `scalars` mapping in `frontend/codegen.ts` only for new backend types

## Testing
- Run `npm test` for unit tests
- Use Jasmine and Karma for unit tests (the default Angular setup)
