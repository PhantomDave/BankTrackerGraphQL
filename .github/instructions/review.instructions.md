---
applyTo:
  - "**/*.cs"
  - "**/*.ts"
  - "**/*.html"
  - "**/*.graphql"
---

# Code Review Instructions

## General Guidelines
- Focus on correctness, security, and maintainability
- Suggest improvements without being overly prescriptive
- Flag potential bugs, security issues, and performance concerns

## Backend (.NET) Review Points
- Check for proper use of async/await patterns
- Verify GraphQL exceptions use standardized error codes
- Ensure database operations use IUnitOfWork
- Look for N+1 query patterns in EF Core
- Validate input sanitization and normalization

## Frontend (Angular) Review Points
- Verify signals are used correctly (no .mutate())
- Check for proper Observable cleanup
- Ensure components are standalone with proper imports
- Validate GraphQL operation naming conventions

## GraphQL Review Points
- Ensure operation names are unique
- Check for over-fetching (requesting unnecessary fields)
- Verify mutation return types include needed fields for cache updates

## Security Review Points
- Check for SQL injection vulnerabilities
- Verify authentication/authorization checks
- Look for exposed sensitive data
- Validate input sanitization
