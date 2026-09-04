# HMS Testing System

Complete UI testing system for HMS using **Playwright** for automated testing and a **Node.js Backend Simulator** for mocking API calls.

## Quick Start

### 1. Setup (One-time)
```bash
cd testing

# Install all dependencies
bash scripts/setup.sh

# Or manually:
cd sim && npm install && cd ../playwright && npm install
```

### 2. Run Tests

#### Terminal 1 - Start Backend Simulator
```bash
cd testing/sim
npm start
# Runs on http://localhost:3001
```

#### Terminal 2 - Run Tests
```bash
cd testing/playwright

# Run all tests
npm run test

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npm run test -- auth.spec.ts

# Run tests with UI
npm run test:ui

# Debug mode
npm run test:debug
```

#### Terminal 3 (Optional) - Run Frontend
```bash
cd hms-frontend
npm start
# Runs on http://localhost:4200
```

## Architecture

### Backend Simulator (`testing/sim/`)
- Express.js server mocking all HMS API endpoints
- Runs on `http://localhost:3001`
- In-memory data with JSON fixtures
- JWT authentication support
- Realistic error responses
- Data reset between test runs

### Test Data (`testing/sim/data/`)
- `users.json` - Test user accounts
- `patients.json` - Sample patient records
- `doctors.json` - Doctor profiles
- `appointments.json` - Appointment data
- `consultations.json` - Consultation records
- `billing.json` - Invoice data

### Playwright Tests (`testing/playwright/`)
- `tests/smoke.spec.ts` - Smoke tests
- `tests/auth.spec.ts` - Authentication tests
- `tests/patients.spec.ts` - Patient CRUD tests
- `tests/appointments.spec.ts` - Appointment tests
- `tests/consultations.spec.ts` - Consultation tests
- `tests/billing.spec.ts` - Billing tests

## Test Accounts

Use these credentials to login in tests:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| doctor | doctor123 | Doctor |
| reception | reception123 | Receptionist |
| nurse | nurse123 | Nurse |

## API Endpoints (Simulator)

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
```

### Patients
```
GET    /api/patients
POST   /api/patients
GET    /api/patients/{id}
PUT    /api/patients/{id}
DELETE /api/patients/{id}
```

### Appointments
```
GET    /api/appointments
POST   /api/appointments
GET    /api/appointments/{id}
PUT    /api/appointments/{id}
DELETE /api/appointments/{id}
GET    /api/appointments/queue
```

### Consultations
```
GET    /api/consultations
POST   /api/consultations
GET    /api/consultations/{id}
PUT    /api/consultations/{id}
```

### Billing
```
GET    /api/billing
POST   /api/billing
GET    /api/billing/{id}
POST   /api/billing/{id}/payments
```

### Reset
```
POST   /api/reset    # Reset all test data
```

## Test Execution

### All Tests
```bash
npm run test
```

### Specific Test
```bash
npm run test -- auth.spec.ts
npm run test -- patients.spec.ts
```

### Headed Mode (See Browser)
```bash
npm run test:headed
```

### UI Mode (Interactive)
```bash
npm run test:ui
```

### Debug Mode
```bash
npm run test:debug
```

### Generate HTML Report
```bash
npm run test
npm run test:report
```

### CI/CD Mode (For Pipelines)
```bash
npm run test:ci
```

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup (e.g., login)
  });

  test('should do something', async ({ page }) => {
    await page.goto('/route');
    // Actions and assertions
    await expect(page.locator('text=Expected')).toBeVisible();
  });
});
```

### Common Actions
```typescript
// Navigation
await page.goto('/patients');

// Filling forms
await page.fill('input[name="name"]', 'John');
await page.selectOption('select[name="type"]', 'Doctor');

// Clicking
await page.click('button[type="submit"]');

// Waiting
await page.waitForURL('**/dashboard');
await page.waitForSelector('table tbody tr');

// Assertions
await expect(page.locator('text=Success')).toBeVisible();
await expect(page).toHaveTitle('HMS - Patients');
```

## Debugging

### View Traces
After test fails, view trace:
```bash
npx playwright show-trace trace.zip
```

### Screenshot on Failure
Screenshots automatically saved to `test-results/` directory.

### Video Recording
Videos of failed tests in `test-results/video/` directory.

### Browser DevTools
```bash
npm run test:debug
# Opens Playwright Inspector with DevTools
```

## Best Practices

✅ **Isolation** - Tests should be independent  
✅ **Clarity** - Use descriptive test names  
✅ **DRY** - Extract common test code  
✅ **Speed** - Mock all external dependencies  
✅ **Assertions** - Use specific, meaningful assertions  
✅ **Data** - Reset data between tests  

## Continuous Integration

### GitHub Actions Example
```yaml
name: UI Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd testing && bash scripts/setup.sh
      - run: cd testing/playwright && npm run test:ci
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: testing/playwright/test-results/
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
lsof -i :4200 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Simulator Not Starting
```bash
cd testing/sim
npm install  # Reinstall dependencies
npm start
```

### Playwright Issues
```bash
# Reinstall browsers
npx playwright install --with-deps

# Update Playwright
npm install -D @playwright/test@latest
```

### Data Not Resetting
```bash
# Curl reset endpoint
curl -X POST http://localhost:3001/api/reset
```

## File Structure
```
testing/
├── TEST-PLAN.md              # Comprehensive testing plan
├── README.md                 # This file
├── scripts/
│   └── setup.sh             # Setup script
├── sim/
│   ├── server.js            # Express simulator
│   ├── package.json
│   ├── data/
│   │   ├── users.json
│   │   ├── patients.json
│   │   ├── doctors.json
│   │   ├── appointments.json
│   │   ├── consultations.json
│   │   └── billing.json
│   └── ...
└── playwright/
    ├── playwright.config.ts
    ├── package.json
    ├── tests/
    │   ├── auth.spec.ts
    │   ├── patients.spec.ts
    │   ├── smoke.spec.ts
    │   └── ...
    ├── pages/
    ├── fixtures/
    └── test-results/
```

## Code Coverage

Generate and track code coverage reports from UI tests:

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# Check coverage meets thresholds
npm run coverage:check
```

**Coverage Targets:**
- Lines: 75%
- Branches: 70%
- Functions: 75%
- Statements: 75%

See [COVERAGE.md](./COVERAGE.md) for detailed coverage documentation.

## Links

- [Playwright Documentation](https://playwright.dev)
- [Testing Plan](./TEST-PLAN.md)
- [Coverage Guide](./COVERAGE.md)
- [HMS Project](../)

## Quick Commands

```bash
# Setup
bash scripts/setup.sh

# Run simulator
cd sim && npm start

# Run all tests
cd playwright && npm test

# Run specific test
npm test -- auth.spec.ts

# See browser while running tests
npm run test:headed

# Interactive UI mode
npm run test:ui

# View test report
npm run test:report
```

---

**Happy Testing! 🎭**
