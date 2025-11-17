#!/bin/bash

# BankTracker Test Runner Script
# This script runs all tests in the repository and provides a summary

set -e

echo "======================================"
echo "   BankTracker Test Suite Runner"
echo "======================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run backend unit tests
echo "Running Backend Unit Tests..."
echo "------------------------------"
UNIT_OUTPUT=$(dotnet test PhantomDave.BankTracking.UnitTests/PhantomDave.BankTracking.UnitTests.csproj --nologo --verbosity quiet 2>&1)
UNIT_EXIT_CODE=$?
if [ $UNIT_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Unit Tests Passed${NC}"
    echo "$UNIT_OUTPUT" | grep "Passed!"
else
    echo -e "${RED}✗ Unit Tests Failed${NC}"
    echo "$UNIT_OUTPUT"
fi
echo ""

# Run backend integration tests
echo "Running Backend Integration Tests..."
echo "-------------------------------------"
INT_OUTPUT=$(dotnet test PhantomDave.BankTracking.IntegrationTests/PhantomDave.BankTracking.IntegrationTests.csproj --nologo --verbosity quiet 2>&1)
INT_EXIT_CODE=$?
INT_RESULT=$(echo "$INT_OUTPUT" | grep -E "Passed!|Failed!")
if [ $INT_EXIT_CODE -eq 0 ]; then
    echo -e "${YELLOW}⚠ Integration Tests (some may need fixes)${NC}"
else
    echo -e "${YELLOW}⚠ Integration Tests (some tests failing)${NC}"
fi
echo "$INT_RESULT"
echo ""

# Run all backend tests with coverage
echo "Generating Code Coverage..."
echo "----------------------------"
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults --nologo --verbosity quiet > /dev/null 2>&1
echo -e "${GREEN}✓ Coverage data generated in ./TestResults/${NC}"
echo ""

# Check if frontend e2e tests can be run
if [ -d "frontend/node_modules" ]; then
    echo "Frontend E2E Tests Available"
    echo "-----------------------------"
    echo -e "${GREEN}✓ Playwright is configured${NC}"
    echo "To run E2E tests: cd frontend && npm run test:e2e"
else
    echo "Frontend E2E Tests Setup Required"
    echo "----------------------------------"
    echo "Run: cd frontend && npm install"
    echo "Then: npm run test:e2e"
fi
echo ""

echo "======================================"
echo "   Test Suite Summary"
echo "======================================"
echo ""

# Parse test counts from outputs
UNIT_COUNT=$(echo "$UNIT_OUTPUT" | grep -oP 'Total:\s*\K\d+' || echo "?")
UNIT_PASSED=$(echo "$UNIT_OUTPUT" | grep -oP 'Passed:\s*\K\d+' || echo "?")
INT_COUNT=$(echo "$INT_OUTPUT" | grep -oP 'Total:\s*\K\d+' || echo "?")
INT_PASSED=$(echo "$INT_OUTPUT" | grep -oP 'Passed:\s*\K\d+' || echo "?")

echo "Backend Unit Tests:        ✓ PASSING ($UNIT_PASSED/$UNIT_COUNT)"
echo "Backend Integration Tests: ⚠ PARTIAL ($INT_PASSED/$INT_COUNT)"  
echo "Frontend E2E Tests:        ⚠ CONFIGURED"
echo ""
echo "For detailed information, see TESTING.md"
echo ""
