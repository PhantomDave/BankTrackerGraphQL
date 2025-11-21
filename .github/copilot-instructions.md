You are GitHub Copilot working in the BankTracker GraphQL monorepo. Follow the patterns already in the codebase before introducing new approaches.

Keep in mind the basics of programming like 

YAGNI, DRY2, NEVER RESORT TO USE SOLID

## Documentation & Libraries
- ALWAYS use context7 MCP tools when you need documentation or code examples for any library, framework, or package (HotChocolate, Apollo Angular, Entity Framework Core, Angular Material, etc.).
- First call `resolve-library-id` with the library name to get the Context7-compatible library ID, then call `get-library-docs` with that ID to retrieve up-to-date documentation.
- This ensures you have the most current information rather than relying solely on training data, which may be outdated.

## Architecture
- GraphQL backend (`PhantomDave.BankTracking.Api`) exposes accounts and finance records via HotChocolate; schema is composed from `Types/Queries|Mutations|Inputs|ObjectTypes` with `ExtendObjectType` partials.
- Data layer (`PhantomDave.BankTracking.Data`) wraps EF Core against PostgreSQL with a repository + unit-of-work abstraction registered through `AddDataAccess`.
- Domain models live in `PhantomDave.BankTracking.Library` and are shared by API, data, and background jobs.
- Angular 20 frontend (`frontend/`) uses Apollo Angular with generated GQL services, Angular Material, and signals; state is mostly managed inside `models/*-service.ts` files.
- A hosted service (`RecurringFinanceRecordService`) materializes recurring finance records by cloning templates on a timed loop, so new recurrence features must remain idempotent.

## Backend (ASP.NET + HotChocolate)
- Prefer throwing `GraphQLException` built via `ErrorBuilder` with explicit `SetCode` values; clients rely on codes like `BAD_USER_INPUT`, `UNAUTHENTICATED`, and `NOT_FOUND` for UX.
- Retrieve the authenticated account id by calling `httpContextAccessor.GetAccountIdFromContext()`; the JWT must contain `ClaimTypes.NameIdentifier` or mutations will fail.
- Keep service logic inside `Services/*Service.cs` and reuse the injected `IUnitOfWork`; call `SaveChangesAsync` on the unit of work to commit changes.
- Normalize and validate inputs (e.g., currency via `NormalizeCurrency`, description length trimming) before persistence to keep recurring job assumptions intact.
- New GraphQL types should extend the root via `[ExtendObjectType(OperationTypeNames.Query|Mutation)]` and convert entities using `From*` factory helpers in `Types/ObjectTypes`.
- Database migrations live in `PhantomDave.BankTracking.Data/Migrations`; ensure Postgres is running (`docker compose -f compose.dev.yaml up -d database`) before applying or updating schema.

## Frontend (Angular + Apollo)
- App uses `provideZonelessChangeDetection` and signals; prefer `signal()`, `computed()`, and `effect()` over RxJS state unless bridging to Apollo streams.
- Components are standalone by default—do not add `standalone: true` manually—but always list dependencies in `imports` and lean on Angular Material before custom UI.
- Use the generated Apollo classes (e.g., `CreateAccountGQL`, `GetFinanceRecordsGQL`) with `firstValueFrom` or `.watch().valueChanges`; match operation names with `refetchQueries` strings (`'getFinanceRecords'`).
- Local auth state is stored in `localStorage` as `sessionData`; guards and the `unauthorizedInterceptor` expect `SessionData` to stay in sync with backend `verifyToken` responses.
- Prefer signals over component-level Observables; when you must bridge, update signals in a `tap` and remember to set/reset `_loading` and `_error` signals like existing services do.
- UI feedback goes through `SnackbarService`; reuse `snackbar.success/error` rather than opening `MatSnackBar` manually for consistent styling.

## GraphQL Workflow
- Add operations as `.graphql` files near the feature (see `frontend/src/app/models/finance-record/gql/*.graphql`); keep operation names unique and PascalCase or camelCase that matches existing usage.
- Run `npm run codegen` (auto-runs on `npm start` via the `prestart` script) to refresh `src/generated/graphql.ts` and `schema.graphql`; the script reads the backend JWT secret from `appsettings.Development.json` or environment variables.
- If the backend schema changes, run `./update-schema.sh` after starting the API (`cd PhantomDave.BankTracking.Api && dotnet run`) so the codegen script can reach `http://localhost:5095/graphql`.
- When adding scalar fields, update the `scalars` mapping in `frontend/codegen.ts` only if the backend type is new; clients currently assume `DateTime` → `string` converted to `Date` in services.

## Developer Workflow
- Backend: `dotnet run` (or VS Code task `build`) from `PhantomDave.BankTracking.Api`; the app auto-migrates the database on startup.
- Frontend: `npm run start` in `frontend/` (triggers codegen). Fix the failing command first if schema generation fails—usually missing backend or JWT secret.
- Tests: there are no automated tests yet; verify critical flows manually (login, recurring creation) after impactful changes.
- Docker: the root `Dockerfile` builds the API only; run `docker compose -f compose.dev.yaml up -d database` for a local Postgres instance.

## Conventions & Pitfalls
- Stick to ASCII in code and messages; existing Italian copy in snackbars is unintentional, translate them to english.
- Avoid `@HostBinding`/`@HostListener`; register host styles via the `host` object (see `FlexComponent`).
- Signals should not call `.mutate`; use `.set`/`.update` as in `AccountService` and `FinanceRecordService` to keep change detection predictable without zones.
- Background service creates non-recurring instances by copying template records; new fields must populate both the recurring template and cloned instance to avoid drift.
- Currency values are persisted as `numeric(18,2)`; always send numbers (not strings) from the frontend and uppercase 3-letter codes to satisfy backend validation.
- Keep GraphQL error codes stable—UI interceptors look specifically for `UNAUTHENTICATED` to trigger logout and route redirects.