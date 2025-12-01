---
applyTo:
  - "frontend/src/**/*.graphql"
  - "PhantomDave.BankTracking.Api/Types/**/*.cs"
---

# GraphQL Schema & Operations Instructions

## Operation File Structure
- Frontend operations go in `frontend/src/app/models/*/gql/*.graphql`
- Keep operation names unique across the entire schema
- Use PascalCase or camelCase matching existing conventions

## Backend Schema (HotChocolate)
- Schema is composed from `Types/Queries|Mutations|Inputs|ObjectTypes`
- Use `[ExtendObjectType]` attribute for partial type extensions
- Convert entities using `From*` factory helpers in ObjectTypes

## Frontend Codegen
- Run `npm run codegen` after any `.graphql` file changes
- Generated types are in `src/generated/graphql.ts`
- Schema file is auto-generated at `frontend/schema.graphql`

## Error Handling
- Backend should return standardized error codes:
  - `BAD_USER_INPUT` - validation errors
  - `UNAUTHENTICATED` - auth failures
  - `NOT_FOUND` - resource not found
- Frontend intercepts `UNAUTHENTICATED` for auto-logout

## Scalars
- `DateTime` maps to `string` on frontend, convert to `Date` in services
- Currency values should be numbers with uppercase 3-letter codes
- Update `frontend/codegen.ts` scalars mapping for new scalar types

## Queries Best Practices
- Use fragments for reusable field selections
- Request only needed fields to minimize payload
- Use pagination for large result sets

## Mutations Best Practices
- Use input types for complex mutation arguments
- Return the mutated object for cache updates
- Include relevant fields for UI updates in response
