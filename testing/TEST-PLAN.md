# HMS UI Testing Plan

## Overview

Comprehensive UI testing strategy for Hospital Management System using **Playwright** for automated testing and a **Node.js backend simulator** for mocking API responses.

---

## Testing Architecture

```
testing/
├── playwright/              # Playwright test framework
│   ├── playwright.config.ts # Configuration
│   ├── tests/               # Test files
│   │   ├── auth.spec.ts
│   │   ├── patients.spec.ts
│   │   ├── appointments.spec.ts
│   │   ├── consultations.spec.ts
│   │   ├── billing.spec.ts
│   │   └── smoke.spec.ts
│   ├── fixtures/            # Test fixtures & helpers
│   ├── pages/               # Page Object Models
│   └── utils/               # Test utilities
│
├── sim/                     # Backend simulator
│   ├── server.js            # Express server
│   ├── routes/              # API route handlers
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── appointments.js
│   │   ├── consultations.js
│   │   ├── billing.js
│   │   └── index.js
│   ├── middleware/          # Authentication, CORS
│   ├── data/                # Test data fixtures
│   │   ├── users.json
│   │   ├── patients.json
│   │   ├── doctors.json
│   │   ├── appointments.json
│   │   ├── consultations.json
│   │   ├── billing.json
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── scripts/                 # Test runner scripts
│   ├── setup.sh
│   ├── run-tests.sh
│   ├── run-simulator.sh
│   └── cleanup.sh
│
└── TEST-PLAN.md            # This file
```

---

## Test Categories

### 1. Smoke Tests
**Purpose:** Verify critical user flows work end-to-end

- [ ] User can login
- [ ] User can navigate dashboard
- [ ] User can view patient list
- [ ] User can access main modules

**File:** `tests/smoke.spec.ts`

### 2. Authentication Tests
**Purpose:** Verify login, logout, token management

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout clears session
- [ ] Expired token redirects to login
- [ ] Protected routes blocked without auth

**File:** `tests/auth.spec.ts`

### 3. Patient Management Tests
**Purpose:** Verify patient CRUD operations

- [ ] List patients displays correctly
- [ ] Search filters patients
- [ ] Create patient form validates
- [ ] Edit patient updates data
- [ ] Delete patient removes from list
- [ ] View patient profile shows all details

**File:** `tests/patients.spec.ts`

### 4. Appointment Management Tests
**Purpose:** Verify appointment scheduling and management

- [ ] Schedule appointment form validates
- [ ] Appointment appears in queue
- [ ] Update appointment status
- [ ] Cancel appointment removes it
- [ ] Queue displays correct order

**File:** `tests/appointments.spec.ts`

### 5. Consultation Tests
**Purpose:** Verify consultation recording and linking

- [ ] Create consultation from appointment
- [ ] Add consultation notes
- [ ] Link prescription to consultation
- [ ] View consultation history
- [ ] Edit consultation details

**File:** `tests/consultations.spec.ts`

### 6. Billing Tests
**Purpose:** Verify billing and payment operations

- [ ] Create invoice from consultation
- [ ] Add billing items
- [ ] Calculate totals with tax/discount
- [ ] Record payment
- [ ] View invoice details
- [ ] Generate receipt

**File:** `tests/billing.spec.ts`

---

## Test Execution Strategy

### Setup
```bash
# Install dependencies
cd testing/sim && npm install
cd ../playwright && npm install

# Start simulator
npm run simulator

# Run tests
npm run test
```

### Test Levels

**1. Unit Level (Via Page Objects)**
- Component interaction tests
- Form validation tests
- UI state management tests

**2. Integration Level**
- Multi-step workflows
- Data flow between components
- Navigation tests

**3. End-to-End Level**
- Complete user journeys
- Full feature workflows
- Cross-module interactions

---

## Backend Simulator

### Features
✅ Mock all HMS API endpoints  
✅ Simulated JWT authentication  
✅ In-memory data storage with persistence  
✅ Realistic delay simulation  
✅ Error scenario support  
✅ Data state reset between tests  

### Endpoints Mocked

#### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
```

#### Patients
```
GET    /api/patients
POST   /api/patients
GET    /api/patients/{id}
PUT    /api/patients/{id}
DELETE /api/patients/{id}
```

#### Appointments
```
GET    /api/appointments
POST   /api/appointments
GET    /api/appointments/{id}
PUT    /api/appointments/{id}
DELETE /api/appointments/{id}
GET    /api/appointments/queue
```

#### Consultations
```
GET    /api/consultations
POST   /api/consultations
GET    /api/consultations/{id}
PUT    /api/consultations/{id}
```

#### Billing
```
GET    /api/billing
POST   /api/billing
GET    /api/billing/{id}
POST   /api/billing/{id}/payments
```

---

## Test Data

### User Accounts
```json
{
  "admin": { "username": "admin", "password": "admin123" },
  "doctor": { "username": "doctor", "password": "doctor123" },
  "receptionist": { "username": "reception", "password": "reception123" }
}
```

### Sample Patients
- John Doe (ID: 1)
- Jane Smith (ID: 2)
- Robert Johnson (ID: 3)
- etc. (See `testing/sim/data/patients.json`)

### Sample Appointments
- Pre-scheduled appointments
- Various statuses (scheduled, completed, cancelled)
- Different doctors and patients

### Sample Billing
- Invoices with items
- Various payment statuses
- Tax and discount calculations

---

## Playwright Configuration

### Browsers
```
- Chromium
- Firefox
- WebKit
```

### Base Configuration
```typescript
baseURL: 'http://localhost:4200'
headless: true
timeout: 30000
retries: 2
```

### Test Organization
- One `.spec.ts` file per feature
- Page Object Models for reusability
- Shared fixtures and utilities
- Descriptive test names

---

## Test Examples

### Login Test
```typescript
test('User can login with valid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="username"]', 'doctor');
  await page.fill('input[name="password"]', 'doctor123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  expect(await page.textContent('h1')).toContain('Dashboard');
});
```

### Patient Creation Test
```typescript
test('Create patient with valid data', async ({ page, apiContext }) => {
  await loginUser(page, 'doctor', 'doctor123');
  await page.goto('/patients/register');
  
  await page.fill('input[name="name"]', 'Test Patient');
  await page.fill('input[name="email"]', 'patient@test.com');
  await page.fill('input[name="phone"]', '+1234567890');
  
  await page.click('button[type="submit"]');
  await page.waitForURL('/patients');
  
  expect(await page.textContent('table')).toContain('Test Patient');
});
```

### Appointment Scheduling Test
```typescript
test('Schedule appointment with conflict detection', async ({ page }) => {
  await loginUser(page, 'receptionist', 'reception123');
  await page.goto('/appointments/register');
  
  await page.selectOption('select[name="patient"]', '1');
  await page.selectOption('select[name="doctor"]', '1');
  await page.fill('input[name="dateTime"]', '2026-09-10T10:00');
  
  // Should show conflict error
  await page.click('button[type="submit"]');
  await expect(page.locator('.error-message')).toContainText('Doctor not available');
});
```

---

## Running Tests

### All Tests
```bash
npm run test
```

### Specific Test File
```bash
npm run test -- auth.spec.ts
```

### Headed Mode (See Browser)
```bash
npm run test:headed
```

### Debug Mode
```bash
npm run test:debug
```

### Generate Report
```bash
npm run test:report
```

### CI/CD Mode
```bash
npm run test:ci
```

---

## Test Data Management

### Reset Data Between Tests
```typescript
test.beforeEach(async ({ apiContext }) => {
  // Reset all test data
  await apiContext.delete('http://localhost:3001/api/reset');
});
```

### Seed Data for Tests
```typescript
test.beforeAll(async ({ apiContext }) => {
  // Load initial test data
  await apiContext.post('http://localhost:3001/api/seed', {
    data: require('./fixtures/initial-data.json')
  });
});
```

### Custom Fixtures
```typescript
test.extend({
  authenticatedPage: async ({ page }, use) => {
    await loginUser(page, 'doctor', 'doctor123');
    await use(page);
  }
});
```

---

## Assertions & Validation

### Page Content
```typescript
await expect(page).toHaveTitle('HMS - Patients');
await expect(page.locator('h1')).toContainText('Patients');
```

### Form Validation
```typescript
await expect(page.locator('.error-email')).toBeVisible();
await expect(page.locator('button[type="submit"]')).toBeDisabled();
```

### Table Data
```typescript
await expect(page.locator('table tbody tr')).toHaveCount(10);
await expect(page.locator('text=John Doe')).toBeVisible();
```

### Network Requests
```typescript
const response = await page.waitForResponse(
  response => response.url().includes('/api/patients') && response.status() === 200
);
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: UI Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm run test:ci
      - uses: actions/upload-artifact@v2
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Metrics & Reporting

### Coverage Areas
- **Feature Coverage:** All 13 modules
- **User Flows:** Login, CRUD operations, complex workflows
- **Error Scenarios:** Validation, network errors, conflicts
- **Edge Cases:** Empty lists, duplicate entries, state transitions

### Report Generation
- HTML report with screenshots
- Video recordings of failures
- Trace files for debugging
- JUnit XML for CI integration

### Target Metrics
- **Test Pass Rate:** > 95%
- **Execution Time:** < 5 minutes
- **Coverage:** > 80% of critical paths

---

## Debugging Failed Tests

### Visual Debugging
```bash
npm run test:headed -- --debug auth.spec.ts
```

### View Traces
```bash
npx playwright show-trace trace.zip
```

### Screenshot on Failure
```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    await page.screenshot({ path: `failure-${Date.now()}.png` });
  }
});
```

### Console Logs
```typescript
page.on('console', msg => console.log(msg.text()));
```

---

## Maintenance & Updates

### Adding New Tests
1. Create new `.spec.ts` file in `tests/`
2. Use existing Page Objects or create new ones
3. Use test data fixtures from `data/`
4. Run test locally before committing

### Updating Test Data
1. Modify JSON files in `testing/sim/data/`
2. Restart simulator
3. Re-run affected tests

### Updating Simulator
1. Add new routes in `testing/sim/routes/`
2. Add endpoints to match new API features
3. Update test data accordingly

---

## Best Practices

✅ **Isolation:** Each test is independent, no shared state  
✅ **Clarity:** Descriptive test names explain what's being tested  
✅ **DRY:** Use Page Objects and helpers to avoid duplication  
✅ **Speed:** Mock external dependencies, test in parallel  
✅ **Maintainability:** Update tests when UI changes  
✅ **Documentation:** Comment complex test logic  
✅ **Assertions:** Use specific, meaningful assertions  

---

## Troubleshooting

### Tests Timing Out
- Check if simulator is running: `npm run simulator`
- Increase timeout in `playwright.config.ts`
- Check network latency

### Flaky Tests
- Add explicit waits for elements
- Use `waitForLoadState()` before actions
- Increase test timeout for slow operations

### Data Issues
- Reset data between tests with `beforeEach`
- Check simulator logs for errors
- Verify test data in `testing/sim/data/`

---

## Quick Start

```bash
# 1. Install dependencies
cd testing/sim && npm install
cd ../playwright && npm install

# 2. Start simulator (new terminal)
cd testing/sim && npm start

# 3. Run tests
cd testing/playwright && npm test

# 4. View report
npx playwright show-report
```

---

**Happy Testing! 🧪**
