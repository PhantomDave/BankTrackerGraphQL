---
applyTo:
  - "PhantomDave.BankTracking.Api/**/*.cs"
  - "PhantomDave.BankTracking.Data/**/*.cs"
  - "PhantomDave.BankTracking.Library/**/*.cs"
---

# Backend Development Instructions (ASP.NET + HotChocolate + EF Core)

## Code Style
- Use C# 13+ features (or latest C# features) when appropriate (primary constructors, collection expressions)
- Prefer async/await for all I/O-bound operations
- Use meaningful variable and method names that express intent
- Keep methods small and focused on a single responsibility

## HotChocolate GraphQL
- GraphQL types should extend the root via `[ExtendObjectType(OperationTypeNames.Query|Mutation)]`
- Convert entities to GraphQL types using `From*` factory helpers in `Types/ObjectTypes`
- Throw `GraphQLException` built via `ErrorBuilder` with explicit `SetCode` values
- Use standardized error codes: `BAD_USER_INPUT`, `UNAUTHENTICATED`, `NOT_FOUND`

## Entity Framework Core
- Use the repository + unit-of-work pattern from `IUnitOfWork`
- Always call `SaveChangesAsync()` on the unit of work to commit changes
- Use projection with `Select()` when you don't need full entities
- Avoid N+1 queries by using `Include()` appropriately

## Services
- Keep business logic inside `Services/*Service.cs`
- Retrieve authenticated account ID via `httpContextAccessor.GetAccountIdFromContext()`
- Normalize inputs before persistence (currency via `NormalizeCurrency`, description trimming)
- Background services create non-recurring instances by copying templates - ensure idempotency

## Validation
- Currency values should be uppercase 3-letter codes
- Currency amounts persisted as `numeric(18,2)` - send numbers not strings
- Validate all inputs at the service layer before persistence

## Testing
- Unit tests go in `PhantomDave.BankTracking.UnitTests`
- Integration tests go in `PhantomDave.BankTracking.IntegrationTests`
- Use xUnit with FluentAssertions
- Mock dependencies using Moq or NSubstitute
