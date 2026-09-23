# HMS E2E Testing with Code Coverage Instrumentation

This directory contains Playwright E2E tests with **Istanbul code coverage instrumentation** enabled.

**Note:** `app.spec.ts` (the single coverage-collection smoke test below)
is planned to be replaced by a full UI/user-flow test suite covering
every feature module — see
[dev/planning/playwright/playwright-plan.md](../../planning/playwright/playwright-plan.md).
That plan explicitly keeps this directory's coverage-instrumentation
tooling as an open decision to revisit, not something to reuse or discard
without thought — see its Phase 0.

## Architecture

- **instrument-serve.js**: Node server that intercepts all JS files and instruments them with Istanbul coverage tracking
- **app.spec.ts**: Test that verifies app loads and collects coverage data from `window.__coverage__`
- **.nycrc.json**: NYC configuration for coverage reporting
- **merge-coverage.js**: Merges coverage data from multiple test runs

## Quick Start

### 1. Start the Instrumented Server (in one terminal)
```bash
cd hms-pom/hms-webb/angular
node instrument-serve.js
```
This starts a server on `http://localhost:4200` that serves all JS files with Istanbul instrumentation.

### 2. Run Tests (in another terminal)
```bash
cd dev/testing/playwright
npm install
npm run test:coverage
```

This will:
1. Clear prior coverage data
2. Run all Playwright tests
3. Collect coverage from `window.__coverage__`
4. Merge coverage files
5. Generate HTML coverage report in `./coverage/`

## Coverage Files

- `.nyc_output/`: Raw coverage data from Istanbul
- `coverage/index.html`: HTML coverage report

## How It Works

1. **Instrumentation**: The `instrument-serve.js` server uses `istanbul-lib-instrument` to modify each JS file in real-time, adding coverage tracking code
2. **Collection**: During tests, Istanbul populates `window.__coverage__` with statement, branch, and function coverage data
3. **Export**: Tests read `window.__coverage__` via `page.evaluate()` and save JSON files to `.nyc_output/`
4. **Merging**: `merge-coverage.js` combines all JSON files into one `coverage-final.json`
5. **Reporting**: NYC generates HTML and text reports

## Troubleshooting

### "No coverage data collected"
- Verify instrument-serve.js is running on port 4200
- Check browser console for any errors loading scripts
- Ensure Istanbul is instrumenting: look for `window.__coverage__` in browser DevTools console

### Server won't start
- Port 4200 already in use? Kill it: `lsof -i :4200` then `kill -9 <PID>`
- Missing dependencies? Run `npm install` in `hms-pom/hms-webb/angular/`

### Coverage data is incomplete
- Wait longer before collecting (coverage accumulates as code executes)
- Run tests multiple times to cover more code paths
- Check that all JS files are being served by instrument-serve.js (not using Angular dev server)
