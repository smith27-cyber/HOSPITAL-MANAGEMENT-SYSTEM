# Full Line-by-Line Code Coverage Instrumentation

Complete guide for collecting and analyzing detailed code coverage from UI tests.

## Quick Start

### Collect Line-by-Line Coverage
```bash
cd testing/playwright

# Install dependencies
npm install

# Collect coverage during tests
npm run test:instrumented

# View detailed report
npm run coverage:view
```

## How It Works

### Coverage Collection Flow

```
Playwright Test
    ↓
Browser Context (JS/CSS Coverage API)
    ↓
Raw Coverage Data (per file, ranges)
    ↓
Instrumentation Fixture
    ↓
Merge Coverage Data
    ↓
Convert to NYC Format
    ↓
Generate HTML/LCOV Reports
    ↓
Analyze Line-by-Line Coverage
```

## Files & Components

### Instrumentation Files

| File | Purpose |
|------|---------|
| `instrumentation.ts` | Coverage collection utility class |
| `fixtures/coverage.ts` | Playwright test fixture for coverage |
| `tests/coverage.spec.ts` | Example coverage collection tests |
| `.nycrc.json` | NYC/Istanbul configuration |

### Generated Reports

```
coverage/
├── instrumented/
│   ├── auth-login-flow-1234567890.json
│   ├── patient-list-flow-1234567890.json
│   ├── coverage-final.json          (NYC format)
│   ├── lcov.info                    (LCOV format)
│   ├── index.html                   (HTML report)
│   └── ...
├── index.html                       (Main report)
└── summary.txt
```

## Usage

### Method 1: Using Coverage Fixture (Recommended)

```typescript
import { coverageTest as test } from '../fixtures/coverage';

test('my test with coverage', async ({ page, coverage }) => {
  // Perform test actions
  await page.goto('/patients');
  await page.waitForSelector('table tbody tr');

  // Collect coverage data
  const result = await coverage.collect('patient-list');
  console.log(`Collected: ${result.js} files`);

  // Coverage report auto-generated at test completion
});
```

### Method 2: Manual Coverage Collection

```typescript
import { CoverageInstrumentor } from '../instrumentation';

test('manual coverage collection', async ({ page }) => {
  const instrumentor = new CoverageInstrumentor();

  // Enable coverage
  await instrumentor.enableCoverage(page);

  // Test code...
  await page.goto('/patients');

  // Collect coverage
  const result = await instrumentor.collectCoverage(page, 'test-name');
  console.log(result); // { js: 45, css: 12 }

  // Generate report
  instrumentor.generateReport();
  const summary = instrumentor.getSummary();
  console.log(summary);
  // { total: 1000, covered: 750, percentage: '75.00' }
});
```

## Running Coverage Tests

### Run All Coverage Tests
```bash
npm run test:instrumented
```

Collects coverage from:
- `auth-login-flow` - Authentication module
- `patient-list-flow` - Patient listing module
- `patient-creation-flow` - Patient form module
- `appointments-flow` - Appointments module
- `billing-flow` - Billing module

### Run Specific Test
```bash
npm run test:instrumented -- --grep "auth flow"
```

### Headed Mode (See Browser)
```bash
npm run test:instrumented:headed
```

### With Detailed Output
```bash
npm run test:instrumented -- --reporter=verbose
```

## Coverage Reports

### HTML Report
**Location:** `coverage/index.html`

**Features:**
- ✅ Line-by-line coverage visualization
- ✅ Color-coded lines (red=uncovered, green=covered)
- ✅ Execution count per statement
- ✅ Coverage percentage per file
- ✅ Branch coverage details
- ✅ Function coverage tracking

**Navigation:**
1. Open `coverage/index.html` in browser
2. Click on file to see line-level details
3. Hover over lines to see execution count
4. Sort by coverage percentage

### LCOV Report
**Location:** `coverage/lcov.info`

**Format:** Standard coverage format
**Compatibility:**
- Codecov integration
- SonarQube integration
- LCOV tools
- IDE extensions

**Parsing:**
```bash
# View LCOV report
genhtml coverage/lcov.info -o coverage/lcov-html

# Merge multiple LCOV files
lcov -a coverage/lcov1.info -a coverage/lcov2.info -o coverage/merged.info
```

### NYC Report
**Location:** `coverage/instrumented/coverage-final.json`

**Format:** NYC/Istanbul JSON format
**Contents:**
- Statement map (location of each statement)
- Coverage array (execution count per statement)
- Function map and coverage
- Branch map and coverage

## Data Structure

### Raw Coverage Entry
```typescript
interface CoverageEntry {
  url: string;              // File URL (localhost:4200/...)
  ranges: Array<{
    startOffset: number;    // Start position in file
    endOffset: number;      // End position in file
    count: number;          // Times executed (0 = not covered)
  }>;
  text: string;             // Source code
}
```

### Merged Coverage
```json
{
  "path/to/file.ts": {
    "path": "path/to/file.ts",
    "statementMap": {
      "0": { "start": { "line": 1, "column": 0 }, ... },
      "1": { "start": { "line": 2, "column": 0 }, ... }
    },
    "s": { "0": 5, "1": 3, "2": 0 },  // Execution counts
    "fnMap": {},
    "f": {},
    "branchMap": {},
    "b": {}
  }
}
```

## Analysis Examples

### Find Uncovered Lines
```bash
# Open HTML report and look for red lines
open coverage/index.html

# Or grep LCOV for zero coverage
grep "DA:.*,0$" coverage/lcov.info
```

### Coverage by Module
```bash
# From HTML report, sort by %
# From JSON, calculate per-directory stats

{
  "auth/": 92% ✅
  "patients/": 65% ❌
  "appointments/": 78% ✅
  "billing/": 81% ✅
  "core/": 70% ⚠️
}
```

### Track Coverage Over Time
```bash
# Save reports with timestamps
npm run test:instrumented
cp coverage/lcov.info coverage/lcov-$(date +%Y%m%d-%H%M%S).info

# Compare reports
# Use HTML report history or external tools
```

## Integration with CI/CD

### GitHub Actions
```yaml
- name: Run coverage tests
  run: cd testing/playwright && npm run test:instrumented

- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./testing/playwright/coverage/lcov.info
    flags: ui-tests
    name: HMS UI Coverage

- name: Comment PR
  if: github.event_name == 'pull_request'
  uses: romeovs/lcov-reporter-action@v0.3.1
  with:
    lcov-file: ./testing/playwright/coverage/lcov.info
```

### Local Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

cd testing/playwright
npm run test:instrumented
npm run coverage:check

if [ $? -ne 0 ]; then
  echo "Coverage check failed!"
  exit 1
fi
```

## Customization

### Add More Test Scenarios
```typescript
test('custom flow coverage', async ({ page, coverage }) => {
  // Your test...
  
  // Collect coverage with meaningful name
  await coverage.collect('dashboard-metrics');
});
```

### Adjust Coverage Thresholds
Edit `.nycrc.json`:
```json
{
  "lines": 85,       // Increase threshold
  "functions": 85,
  "branches": 75,
  "statements": 85
}
```

### Exclude Files from Coverage
```json
{
  "exclude": [
    "node_modules/**",
    "dist/**",
    "**/*.spec.ts",
    "**/mocks/**"
  ]
}
```

## Troubleshooting

### No Coverage Data Generated
```bash
# Check if tests ran
ls -la coverage/instrumented/

# Verify browser API available
# Playwright must be version 1.40+
npm list @playwright/test

# Run with verbose output
npm run test:instrumented -- --reporter=verbose
```

### Low Coverage Reported
- Coverage is browser-specific (only tested code)
- Dead code not executed = not covered
- Lazy-loaded modules only covered if accessed
- Error paths only covered if triggered

### LCOV Report Not Generated
```bash
# Check NYC installation
npx nyc --version

# Generate manually
npx nyc report --reporter=text-lcov > coverage/lcov.info
```

## Best Practices

✅ **Run coverage for critical paths first**  
✅ **Collect coverage per feature/module**  
✅ **Track coverage trends over time**  
✅ **Focus on function/branch coverage** (not just line coverage)  
✅ **Instrument before test optimization**  
✅ **Use coverage gaps to improve tests**  

## Performance Impact

- Coverage collection adds **10-20% test time overhead**
- Browser handles collection efficiently
- No source transformation required
- Minimal memory impact

## Advanced: Custom Analysis

### Parse Coverage JSON
```typescript
import * as fs from 'fs';

const coverage = JSON.parse(
  fs.readFileSync('coverage/instrumented/coverage-final.json', 'utf-8')
);

for (const [file, data] of Object.entries(coverage)) {
  const statements = Object.values(data.s as any);
  const covered = statements.filter(s => (s as number) > 0).length;
  const percentage = ((covered / statements.length) * 100).toFixed(2);
  
  console.log(`${file}: ${percentage}%`);
}
```

## Commands Reference

```bash
# Collection
npm run test:instrumented           # Collect coverage (default)
npm run test:instrumented:headed    # Headed mode
npm run test -- tests/coverage.spec.ts  # Specific test

# Reporting
npm run coverage:report             # Generate HTML
npm run coverage:view               # Open in browser
npm run coverage:check              # Verify thresholds

# Analysis
grep "DA:.*,0$" coverage/lcov.info  # Find uncovered lines
npx lcov --summary coverage/lcov.info  # Get summary
```

---

**Full instrumentation enabled!** 📊🔍
