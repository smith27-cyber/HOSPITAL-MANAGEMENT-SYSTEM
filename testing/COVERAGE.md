# Code Coverage Report Guide

Complete guide for generating and analyzing code coverage reports from Playwright tests.

## Quick Start

### Generate Coverage Report
```bash
cd testing/playwright

# Install dependencies (first time)
npm install

# Run tests with coverage
npm run test:coverage

# View HTML report
open coverage/index.html
```

## Coverage Setup

### Configuration Files

#### `.nycrc.json` - Coverage Configuration
```json
{
  "reporter": ["html", "text", "text-summary", "json", "lcov"],
  "check-coverage": true,
  "branches": 70,      // 70% branch coverage required
  "lines": 75,         // 75% line coverage required
  "functions": 75,     // 75% function coverage required
  "statements": 75     // 75% statement coverage required
}
```

#### `playwright.config.coverage.ts` - Playwright Coverage
Extends base config with coverage collection settings.

### package.json Scripts

```bash
npm run test:coverage    # Run tests with coverage report
npm run coverage:report  # Generate HTML coverage report
npm run coverage:check   # Verify coverage thresholds met
```

## Coverage Metrics

### What Gets Measured

| Metric | Definition |
|--------|-----------|
| **Lines** | Percentage of executable lines executed |
| **Statements** | Percentage of executable statements executed |
| **Branches** | Percentage of conditional branches taken |
| **Functions** | Percentage of functions called |

### Current Thresholds

- **Branches:** 70% minimum
- **Lines:** 75% minimum
- **Functions:** 75% minimum
- **Statements:** 75% minimum

### Example Report

```
=============================== Coverage summary ===============================
Statements   : 78.5% ( 314/400 )
Branches     : 72.3% ( 145/200 )
Functions    : 81.2% ( 65/80 )
Lines        : 79.4% ( 317/400 )
================================================================================
```

## Running Coverage Tests

### Basic Coverage Report
```bash
npm run test:coverage
```

Generates:
- HTML report in `coverage/index.html`
- Console output with summary
- JSON report in `coverage/coverage-final.json`
- LCOV report in `coverage/lcov.info`

### View HTML Report
```bash
# After running coverage
npm run coverage:report

# Open in browser
open coverage/index.html
```

### Check Coverage Thresholds
```bash
npm run coverage:check
```

Verifies that coverage meets minimum thresholds.

### Generate Only (No Tests)
```bash
# After tests have run
npm run coverage:report
```

## Coverage Report Structure

### HTML Report (`coverage/index.html`)

**Dashboard View:**
- Overall coverage percentages
- Coverage history
- Trend indicators

**Module View:**
- Coverage by file/module
- Color-coded: Red (< 50%), Yellow (50-75%), Green (> 75%)
- Click files for detailed line-by-line coverage

**File View:**
- Line-by-line coverage
- Covered lines highlighted in green
- Uncovered lines highlighted in red
- Branch coverage details

### Console Output

```
=============================== Coverage summary ===============================
File              | % Stmts | % Branch | % Funcs | % Lines |
------------------|---------|----------|---------|---------|
All files         |   78.50 |   72.30  |  81.20  |  79.40  |
 auth/            |   92.00 |   85.50  |  95.00  |  92.50  |
  auth.service.ts |   92.00 |   85.50  |  95.00  |  92.50  |
 patients/        |   65.00 |   60.00  |  70.00  |  65.50  |
  patient.service |   65.00 |   60.00  |  70.00  |  65.50  |
================================================================================
```

## Analyzing Coverage

### Coverage Gap Analysis

**Find uncovered code:**
1. Open `coverage/index.html`
2. Sort by lowest coverage
3. Click file to see uncovered lines
4. Add tests for uncovered paths

### Coverage by Module

```
authentication: 92% ✅ (Exceeds threshold)
patients:      65% ❌ (Below 75% threshold)
appointments:  78% ✅ (Meets threshold)
billing:       81% ✅ (Exceeds threshold)
```

### Common Uncovered Patterns

- Error handling paths
- Edge case conditions
- Modal/dialog interactions
- Network error scenarios
- Validation error paths

## Improving Coverage

### Step 1: Identify Gaps
```bash
npm run test:coverage
open coverage/index.html
```

### Step 2: Add Tests
Create tests for uncovered lines:

```typescript
test('should handle network error', async ({ page }) => {
  // Intercept network error
  await page.route('**/api/**', route => route.abort());
  
  // Trigger action that causes error
  await page.click('button');
  
  // Assert error handling
  await expect(page.locator('text=Error occurred')).toBeVisible();
});
```

### Step 3: Verify Coverage
```bash
npm run test:coverage
```

Check that coverage increased.

## CI/CD Integration

### GitHub Actions

```yaml
name: Coverage Report
on: [push, pull_request]
jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd testing/playwright && npm install
      - run: cd testing/playwright && npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./testing/playwright/coverage/lcov.info
          flags: ui-tests
```

### Codecov Integration

Automatically uploads coverage to Codecov:

```bash
# Install Codecov CLI
npm install -g codecov

# After running coverage
codecov -f coverage/lcov.info -F ui-tests
```

## Coverage Thresholds

### Adjust Thresholds

Edit `.nycrc.json`:

```json
{
  "branches": 80,    // Increase from 70%
  "lines": 85,       // Increase from 75%
  "functions": 85,   // Increase from 75%
  "statements": 85   // Increase from 75%
}
```

### Enforce Per-File Thresholds

```json
{
  "per-file": true,
  "lines": 75,
  "functions": 75,
  "branches": 70,
  "statements": 75
}
```

## Troubleshooting

### Coverage Report Not Generated
```bash
# Verify test data
ls -la coverage/

# Re-run tests
npm run test:coverage -- --reporter=list
```

### Coverage Tools Not Found
```bash
# Reinstall dependencies
npm install
npm install -D nyc istanbul-lib-coverage
```

### Thresholds Failing
```bash
# Check what's failing
npm run coverage:check

# View detailed report
open coverage/index.html
```

## Best Practices

✅ **Target 75%+ coverage** - Sweet spot for maintainability  
✅ **Focus on critical paths** - Test user workflows first  
✅ **Test error cases** - Often uncovered, important  
✅ **Ignore generated code** - Focus on hand-written code  
✅ **Review regularly** - Coverage should improve over time  
✅ **Branch coverage** - More important than line coverage  

## Coverage Goals by Module

| Module | Current | Target |
|--------|---------|--------|
| Auth | 92% | 90%+ |
| Patients | 65% | 75%+ |
| Appointments | 78% | 80%+ |
| Consultations | TBD | 75%+ |
| Billing | 81% | 80%+ |

## Reports Generated

### HTML Report
Location: `coverage/index.html`
- Interactive coverage breakdown
- Line-by-line detailed view
- Trend analysis
- File navigation

### JSON Report
Location: `coverage/coverage-final.json`
- Machine-readable format
- For CI/CD integration
- For report aggregation

### LCOV Report
Location: `coverage/lcov.info`
- Standard coverage format
- Supports most CI tools
- IDE integration support

### Text Report
Printed to console:
- Quick summary view
- CI/CD friendly
- Easy to parse

## Continuous Improvement

### Weekly Review
```bash
# Generate latest coverage
npm run test:coverage

# Compare with previous week
# Look for declining coverage areas
# Add tests for gap areas
```

### Before Release
```bash
# Ensure all thresholds met
npm run coverage:check

# Review critical path coverage
# Verify error scenarios covered
# Check edge cases
```

## References

- [NYC/Istanbul Documentation](https://github.com/istanbuljs/nyc)
- [Playwright Testing](https://playwright.dev/docs/intro)
- [Code Coverage Best Practices](https://martinfowler.com/bliki/TestCoverage.html)

---

## Quick Commands

```bash
# Generate coverage report
npm run test:coverage

# View report
open coverage/index.html

# Check thresholds
npm run coverage:check

# With specific browsers
npm run test -- --project=chromium
```

---

**Coverage Goal: 75%+ across all metrics** 📊
