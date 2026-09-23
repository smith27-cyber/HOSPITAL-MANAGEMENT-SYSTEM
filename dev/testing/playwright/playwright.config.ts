import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  use: { baseURL: 'http://localhost:4200' },

  webServer: {
    command: 'cd ../../../hms-pom/hms-webb/angular && npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  globalTeardown: require.resolve('./global-teardown'),
});
