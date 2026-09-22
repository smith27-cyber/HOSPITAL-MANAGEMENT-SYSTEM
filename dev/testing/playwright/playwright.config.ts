import { defineConfig, devices } from '@playwright/test';

// =====================================================
// Base URL — ng serve only. See
// dev/planning/playwright/tasks/todo/task-0-1-decide-base-url.md
// =====================================================

const BASE_URL = 'http://localhost:4200';

export default defineConfig({
  testDir: './tests',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // ===================================================
  // CI settings. See
  // dev/planning/playwright/tasks/todo/task-0-6-decide-ci.md
  // ===================================================

  retries: process.env.CI ? 2 : 0,

  // ===================================================
  // hms-jar and ng serve are started here as plain
  // processes on this same runner — never hms-jar in its
  // own container, since dev-login requires a loopback
  // caller (see task-0-6). Postgres is assumed already
  // running (started separately via docker-compose.yml).
  // ===================================================

  webServer: [
    {
      command: 'mvn -o spring-boot:run',
      cwd: '../../../hms-pom/hms-jar',
      url: 'http://localhost:8081/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        HMS_DEV_LOGIN_ENABLED: 'true',
      },
    },
    {
      command: 'npm start',
      cwd: '../../../hms-pom/hms-webb/angular',
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],

  // ===================================================
  // Setup project establishes storageState for all 10
  // identities once; the default project depends on it
  // but does NOT set a single global storageState, since
  // each spec picks the identity/identities it needs via
  // fixtures/auth.ts. See
  // dev/planning/playwright/tasks/todo/task-0-4-decide-auth-reuse.md
  // ===================================================

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
